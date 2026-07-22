// ─── ระบบจัดการหอพักสัมฤทธิ์ — API + static server ──────────────
// Run: node --experimental-sqlite server/server.js
// Uses MongoDB when MONGODB_URI is set, else a local SQLite file.
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

// Wrap async route handlers so rejected promises become 500s, not crashes.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─── Health (used by frontend to detect live mode) ─────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'live', db: db.kind(), time: Date.now() }));

// ─── Auth ──────────────────────────────────────────────────────
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, username, password, email, phone } = req.body || {};
  if (!name || !username || !password) return res.status(400).json({ error: 'กรอกข้อมูลให้ครบ' });
  if (await db.findUserByUsername(username)) return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
  const user = await db.createUser({ name, username, password, role: 'resident', email, phone });
  res.json({ token: auth.sign({ sub: user.id, role: user.role }), user });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  const u = await db.findUserByUsername(username);
  if (!u || !db.verifyPassword(password, u.pass)) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  if (u.active === false) return res.status(403).json({ error: 'บัญชีถูกปิดใช้งาน' });
  const user = db.publicUser(u);
  res.json({ token: auth.sign({ sub: user.id, role: user.role }), user });
}));

app.get('/api/me', auth.requireAuth, (req, res) => res.json({ user: req.user }));

// ─── Bootstrap (admin/staff: everything) ───────────────────────
app.get('/api/bootstrap', auth.requireAuth, auth.requireStaff, wrap(async (_req, res) => {
  const out = {};
  for (const c of db.COLLECTIONS) out[c] = await db.listColl(c);
  out.users = await db.listUsers();              // staff/admin accounts (no passwords)
  out.paySettings = await db.getSetting('paySettings', {});
  out.photos = await db.getSetting('photos', {});
  res.json(out);
}));

// ─── Resident bootstrap (own data + public room info) ──────────
app.get('/api/me/bootstrap', auth.requireAuth, wrap(async (req, res) => {
  const uid = req.user.id;
  const [rooms, bookings, bills, stays, repairs, contracts, paySettings, photos] = await Promise.all([
    db.listColl('rooms'), db.listColl('bookings'), db.listColl('bills'),
    db.listColl('stays'), db.listColl('repairs'), db.listColl('contracts'),
    db.getSetting('paySettings', {}), db.getSetting('photos', {}),
  ]);
  res.json({
    rooms,
    bookings: bookings.filter(b => b.userId === uid),
    bills: bills.filter(b => b.userId === uid),
    stays: stays.filter(b => b.userId === uid),
    repairs: repairs.filter(b => b.userId === uid),
    contracts: contracts.filter(c => c.userId === uid),
    paySettings, photos,
  });
}));

// ─── Settings (paySettings / photos) ───────────────────────────
app.get('/api/settings/:key', wrap(async (req, res) => res.json(await db.getSetting(req.params.key, null))));
app.put('/api/settings/:key', auth.requireAuth, auth.requireStaff, wrap(async (req, res) => {
  res.json(await db.setSetting(req.params.key, req.body));
}));

// ─── Generic collection CRUD ───────────────────────────────────
function ensureColl(req, res, next) {
  if (!db.COLLECTIONS.includes(req.params.coll)) return res.status(404).json({ error: 'unknown collection' });
  next();
}
// public read for rooms; everything else requires auth
app.get('/api/coll/:coll', ensureColl, wrap(async (req, res) => {
  if (req.params.coll !== 'rooms' && !req.user) return res.status(401).json({ error: 'unauthorized' });
  res.json(await db.listColl(req.params.coll));
}));
app.post('/api/coll/:coll', ensureColl, auth.requireAuth, wrap(async (req, res) => {
  res.json(await db.upsertColl(req.params.coll, req.body || {}));
}));
app.put('/api/coll/:coll/:id', ensureColl, auth.requireAuth, wrap(async (req, res) => {
  res.json(await db.upsertColl(req.params.coll, { ...(req.body || {}), id: req.params.id }));
}));
app.delete('/api/coll/:coll/:id', ensureColl, auth.requireAuth, wrap(async (req, res) => {
  await db.removeColl(req.params.coll, req.params.id);
  res.json({ ok: true });
}));

// ─── Staff user management ─────────────────────────────────────
app.get('/api/users', auth.requireAuth, auth.requireStaff, wrap(async (_req, res) => res.json(await db.listUsers())));
app.post('/api/users', auth.requireAuth, auth.requireStaff, wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.username || !b.name) return res.status(400).json({ error: 'กรอกข้อมูลให้ครบ' });
  if (await db.findUserByUsername(b.username)) return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
  res.json(await db.createUser({ ...b, password: b.password || 'changeme', role: b.role || b.urole || 'staff' }));
}));
app.put('/api/users/:id', auth.requireAuth, auth.requireStaff, wrap(async (req, res) => {
  const patch = { ...req.body };
  if (!patch.password) delete patch.password;
  res.json(await db.updateUser(req.params.id, patch));
}));
app.delete('/api/users/:id', auth.requireAuth, auth.requireStaff, wrap(async (req, res) => {
  await db.deleteUser(req.params.id); res.json({ ok: true });
}));

// ─── Static frontend ───────────────────────────────────────────
app.use(express.static(ROOT, { extensions: ['html'] }));
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// JSON error handler for wrapped async routes.
app.use((err, _req, res, _next) => {
  console.error('[api error]', err);
  res.status(500).json({ error: 'server error' });
});

const PORT = process.env.PORT || 3000;
db.init().then((kind) => {
  app.listen(PORT, () => console.log(`[samrit] http://localhost:${PORT}  (live mode, ${kind})`));
}).catch((e) => {
  console.error('[samrit] failed to start — database init error:', e.message);
  process.exit(1);
});
