// ─── Samrit API client (works in LIVE and DEMO mode) ───────────
// LIVE : talks to the Node + SQLite backend via REST.
// DEMO : persists to localStorage (used when no backend is reachable,
//        e.g. opening the HTML file directly or on GitHub Pages).
(function () {
  const CFG = window.SAMRIT_CONFIG || {};
  const BASE = (CFG.API_BASE != null ? CFG.API_BASE : (window.SAMRIT_API_BASE || ''));
  const TOKEN_KEY = CFG.tokenKey || 'samrit_token';
  const USER_KEY = TOKEN_KEY + '_user';
  let mode = 'demo';

  const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
  const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

  async function api(path, opts = {}) {
    const headers = Object.assign({ 'content-type': 'application/json' }, opts.headers || {});
    const t = getToken(); if (t) headers.authorization = 'Bearer ' + t;
    const res = await fetch(BASE + path, { method: opts.method || 'GET', headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (!res.ok) { let e = {}; try { e = await res.json(); } catch (_) {} throw new Error(e.error || ('HTTP ' + res.status)); }
    return res.status === 204 ? null : res.json();
  }

  // ── demo localStorage helpers ──
  const DKEY = (c) => 'samrit_demo_' + c;
  const dList = (c) => { try { return JSON.parse(localStorage.getItem(DKEY(c))); } catch (_) { return null; } };
  const dSet = (c, arr) => localStorage.setItem(DKEY(c), JSON.stringify(arr));
  const SET_KEY = { paySettings: 'samrit_pay', photos: 'samrit_photos' };
  const sKey = (k) => SET_KEY[k] || ('samrit_set_' + k);
  const dGetSetting = (k, def) => { try { const v = localStorage.getItem(sKey(k)); return v ? JSON.parse(v) : def; } catch (_) { return def; } };
  const dSetSetting = (k, v) => { localStorage.setItem(sKey(k), JSON.stringify(v)); return v; };
  const uid = () => 'id' + Date.now() + Math.random().toString(36).slice(2, 6);

  const Samrit = {
    get mode() { return mode; },
    BASE,
    token: getToken,
    isAuthed: () => !!getToken(),

    async init() {
      try {
        const r = await fetch(BASE + '/api/health', { cache: 'no-store' });
        if (r.ok) { const j = await r.json(); if (j && j.ok) { mode = 'live'; return 'live'; } }
      } catch (_) {}
      mode = 'demo'; return 'demo';
    },

    // ── auth ──
    currentUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (_) { return null; } },
    _setUser(u) { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); },

    async login(username, password, demoAccounts) {
      if (mode === 'live') {
        const j = await api('/api/auth/login', { method: 'POST', body: { username, password } });
        setToken(j.token); this._setUser(j.user); return j.user;
      }
      const accs = dList('accounts') || demoAccounts || [];
      const u = accs.find(a => a.username === username && a.password === password);
      if (!u) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      if (u.active === false) throw new Error('บัญชีถูกปิดใช้งาน');
      setToken('demo:' + u.id); this._setUser(u); return u;
    },
    async register(data, demoAccounts) {
      if (mode === 'live') {
        const j = await api('/api/auth/register', { method: 'POST', body: data });
        setToken(j.token); this._setUser(j.user); return j.user;
      }
      const accs = dList('accounts') || demoAccounts || [];
      if (accs.find(a => a.username === data.username)) throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
      const u = { id: uid(), role: 'resident', active: true, ...data };
      accs.push(u); dSet('accounts', accs); setToken('demo:' + u.id); this._setUser(u); return u;
    },
    logout() { setToken(''); this._setUser(null); },

    // ── bootstraps ──
    async bootstrapAdmin(seed) {
      if (mode === 'live') return api('/api/bootstrap');
      const out = {};
      ['rooms', 'tenants', 'bookings', 'contracts', 'payments', 'bills', 'stays', 'repairs', 'slips'].forEach(c => {
        let a = dList(c); if (a === null) { a = (seed && seed[c]) || []; dSet(c, a); } out[c] = a;
      });
      let us = dList('users'); if (us === null) { us = (seed && seed.users) || []; dSet('users', us); } out.users = us;
      if (dList('accounts') === null && seed && seed.accounts) dSet('accounts', seed.accounts);
      out.paySettings = dGetSetting('paySettings', (seed && seed.paySettings) || {});
      out.photos = dGetSetting('photos', {});
      return out;
    },
    // Public catalog (rooms/prices/photos) shown before login — always live in LIVE mode.
    async bootstrapPublic(seed) {
      if (mode === 'live') {
        const [rooms, paySettings, photos] = await Promise.all([
          api('/api/coll/rooms').catch(() => []),
          api('/api/settings/paySettings').catch(() => null),
          api('/api/settings/photos').catch(() => ({})),
        ]);
        return { rooms: rooms || [], paySettings: paySettings || {}, photos: photos || {} };
      }
      const ens = (c) => { let a = dList(c); if (a === null) { a = (seed && seed[c]) || []; dSet(c, a); } return a; };
      return {
        rooms: ens('rooms'),
        paySettings: dGetSetting('paySettings', (seed && seed.paySettings) || {}),
        photos: dGetSetting('photos', {}),
      };
    },
    async bootstrapResident(seed) {
      if (mode === 'live') return api('/api/me/bootstrap');
      const u = this.currentUser() || {};
      const ens = (c) => { let a = dList(c); if (a === null) { a = (seed && seed[c]) || []; dSet(c, a); } return a; };
      return {
        rooms: ens('rooms'),
        bookings: ens('bookings').filter(b => b.userId === u.id),
        bills: ens('bills').filter(b => b.userId === u.id),
        stays: ens('stays').filter(b => b.userId === u.id),
        repairs: ens('repairs').filter(b => b.userId === u.id),
        paySettings: dGetSetting('paySettings', (seed && seed.paySettings) || {}),
        photos: dGetSetting('photos', {}),
      };
    },

    // ── collections (live = granular REST; demo = persist whole array) ──
    async save(coll, obj) {
      if (mode === 'live') return obj.id ? api('/api/coll/' + coll + '/' + obj.id, { method: 'PUT', body: obj }) : api('/api/coll/' + coll, { method: 'POST', body: obj });
      return obj; // demo: caller persists the array via saveDemo
    },
    async remove(coll, id) {
      if (mode === 'live') return api('/api/coll/' + coll + '/' + id, { method: 'DELETE' });
      return true;
    },
    saveDemo(coll, arr) { if (mode !== 'live') dSet(coll, arr); },

    // ── settings ──
    async getSetting(k, def) { if (mode === 'live') { const v = await api('/api/settings/' + k); return v == null ? def : v; } return dGetSetting(k, def); },
    async setSetting(k, v) { if (mode === 'live') return api('/api/settings/' + k, { method: 'PUT', body: v }); return dSetSetting(k, v); },

    // ── staff users (admin) ──
    async listUsers() { if (mode === 'live') return api('/api/users'); return dList('users') || []; },
    async saveUser(u, arr) {
      if (mode === 'live') return (u.id && !u._new) ? api('/api/users/' + u.id, { method: 'PUT', body: u }) : api('/api/users', { method: 'POST', body: u });
      if (arr) dSet('users', arr); return u;
    },
    async removeUser(id, arr) { if (mode === 'live') return api('/api/users/' + id, { method: 'DELETE' }); if (arr) dSet('users', arr); return true; },

    // Resident accounts registered through the portal (DEMO mode, shared origin).
    demoAccounts() { return dList('accounts') || []; },

    newId: uid,
  };

  window.Samrit = Samrit;
})();
