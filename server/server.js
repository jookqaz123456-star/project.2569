// ─── ระบบจัดการหอพักสัมฤทธิ์ — API + static server ──────────────
// Run: node --experimental-sqlite server/server.js
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const db = require('./db');
const auth = require('./auth');

const app = express();
const ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json({ limit: '12mb' })); // base64 slips/photos can be large
app.use(auth.authMiddleware(db));

// ─── Health (used by frontend to detect live mode) ─────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'live', time: Date.now() }));

// ─── Auth ──────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, username, password, email, phone } = req.body || {};
  if (!name || !username || !password) return res.status(400).json({ error: 'กรอกข้อมูลให้ครบ' });
  if (db.findUserByUsername(username)) return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
  const user = db.createUser({ name, username, password, role: 'resident', email, phone });
  res.json({ token: auth.sign({ sub: user.id, role: user.role }), user });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const u = db.findUserByUsername(username);
  if (!u || !db.verifyPassword(password, u.pass)) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  if (u.active === false) return res.status(403).json({ error: 'บัญชีถูกปิดใช้งาน' });
  const user = db.publicUser(u);
  res.json({ token: auth.sign({ sub: user.id, role: user.role }), user });
});

app.get('/api/me', auth.requireAuth, (req, res) => res.json({ user: req.user }));

// ─── Bootstrap (admin/staff: everything) ───────────────────────
app.get('/api/bootstrap', auth.requireAuth, auth.requireStaff, (_req, res) => {
  const out = {};
  for (const c of db.COLLECTIONS) out[c] = db.listColl(c);
  out.users = db.listUsers();                    // staff/admin accounts (no passwords)
  out.paySettings = db.getSetting('paySettings', {});
  out.photos = db.getSetting('photos', {});
  res.json(out);
});

// ─── Resident bootstrap (own data + public room info) ──────────
app.get('/api/me/bootstrap', auth.requireAuth, (req, res) => {
  const uid = req.user.id;
  res.json({
    rooms: db.listColl('rooms'),
    bookings: db.listColl('bookings').filter(b => b.userId === uid),
    bills: db.listColl('bills').filter(b => b.userId === uid),
    stays: db.listColl('stays').filter(b => b.userId === uid),
    repairs: db.listColl('repairs').filter(b => b.userId === uid),
    paySettings: db.getSetting('paySettings', {}),
    photos: db.getSetting('photos', {}),
  });
});

// ─── Settings (paySettings / photos) ───────────────────────────
app.get('/api/settings/:key', (req, res) => res.json(db.getSetting(req.params.key, null)));
app.put('/api/settings/:key', auth.requireAuth, auth.requireStaff, (req, res) => {
  res.json(db.setSetting(req.params.key, req.body));
});

// ─── Generic collection CRUD ───────────────────────────────────
function ensureColl(req, res, next) {
  if (!db.COLLECTIONS.includes(req.params.coll)) return res.status(404).json({ error: 'unknown collection' });
  next();
}
// public read for rooms; everything else requires auth
app.get('/api/coll/:coll', ensureColl, (req, res) => {
  if (req.params.coll !== 'rooms' && !req.user) return res.status(401).json({ error: 'unauthorized' });
  res.json(db.listColl(req.params.coll));
});
app.post('/api/coll/:coll', ensureColl, auth.requireAuth, (req, res) => {
  res.json(db.upsertColl(req.params.coll, req.body || {}));
});
app.put('/api/coll/:coll/:id', ensureColl, auth.requireAuth, (req, res) => {
  res.json(db.upsertColl(req.params.coll, { ...(req.body || {}), id: req.params.id }));
});
app.delete('/api/coll/:coll/:id', ensureColl, auth.requireAuth, (req, res) => {
  db.removeColl(req.params.coll, req.params.id);
  res.json({ ok: true });
});

// ─── Staff user management ─────────────────────────────────────
app.get('/api/users', auth.requireAuth, auth.requireStaff, (_req, res) => res.json(db.listUsers()));
app.post('/api/users', auth.requireAuth, auth.requireStaff, (req, res) => {
  const b = req.body || {};
  if (!b.username || !b.name) return res.status(400).json({ error: 'กรอกข้อมูลให้ครบ' });
  if (db.findUserByUsername(b.username)) return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
  res.json(db.createUser({ ...b, password: b.password || 'changeme', role: b.role || b.urole || 'staff' }));
});
app.put('/api/users/:id', auth.requireAuth, auth.requireStaff, (req, res) => {
  const patch = { ...req.body };
  if (!patch.password) delete patch.password;
  res.json(db.updateUser(req.params.id, patch));
});
app.delete('/api/users/:id', auth.requireAuth, auth.requireStaff, (req, res) => {
  db.deleteUser(req.params.id); res.json({ ok: true });
});

// ─── Static frontend ───────────────────────────────────────────
app.use(express.static(ROOT, { extensions: ['html'] }));
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[samrit] http://localhost:${PORT}  (live mode, SQLite)`));
