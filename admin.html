// ─── Data layer — MongoDB (primary) or SQLite (local fallback) ──
// If MONGODB_URI is set we use MongoDB Atlas (data survives redeploys).
// Otherwise we fall back to a local SQLite file (node:sqlite) for dev/demo.
// Every exported function is async so both backends share one interface.
const crypto = require('node:crypto');
const seed = require('./seed');

const COLLECTIONS = ['rooms', 'tenants', 'bookings', 'contracts', 'payments', 'bills', 'stays', 'repairs', 'slips'];

// ─── Pure helpers (backend-independent) ────────────────────────
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex'), b = Buffer.from(test, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function publicUser(u) { if (!u) return u; const { pass, _id, ...rest } = u; return rest; }
function genId() { return 'id' + Date.now() + Math.random().toString(36).slice(2, 6); }

// ─── MongoDB backend ───────────────────────────────────────────
function mongoBackend(uri) {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(uri);
  let mdb;
  const noId = { projection: { _id: 0 } };
  const noIdPass = { projection: { _id: 0, pass: 0 } };
  return {
    kind: 'mongodb',
    async init() {
      await client.connect();
      mdb = client.db(process.env.MONGODB_DB || 'samrit');
      await mdb.collection('users').createIndex({ username: 1 }, { unique: true });
      await mdb.collection('users').createIndex({ id: 1 }, { unique: true });
      for (const c of COLLECTIONS) await mdb.collection(c).createIndex({ id: 1 }, { unique: true });
    },
    async collList(c) { return mdb.collection(c).find({}, noId).toArray(); },
    async collUpsert(c, obj) {
      if (!obj.id) obj.id = genId();
      await mdb.collection(c).updateOne({ id: obj.id }, { $set: { ...obj } }, { upsert: true });
      return obj;
    },
    async collRemove(c, id) { await mdb.collection(c).deleteOne({ id }); },
    async collGet(c, id) { return mdb.collection(c).findOne({ id }, noId); },
    async settingGet(k) { const r = await mdb.collection('settings').findOne({ _id: k }); return r ? r.value : undefined; },
    async settingSet(k, v) { await mdb.collection('settings').updateOne({ _id: k }, { $set: { value: v } }, { upsert: true }); return v; },
    async userCreate(doc) { await mdb.collection('users').insertOne({ ...doc }); return doc; },
    async userByUsername(u) { return mdb.collection('users').findOne({ username: u }, noId); },     // incl. pass
    async userById(id) { return mdb.collection('users').findOne({ id }, noIdPass); },               // no pass
    async userList() { return mdb.collection('users').find({}, noIdPass).toArray(); },
    async userUpdate(id, doc) { await mdb.collection('users').updateOne({ id }, { $set: { ...doc } }); return doc; },
    async userDelete(id) { await mdb.collection('users').deleteOne({ id }); },
  };
}

// ─── SQLite backend (node:sqlite, requires --experimental-sqlite) ─
function sqliteBackend() {
  const { DatabaseSync } = require('node:sqlite');
  const path = require('node:path');
  const fs = require('node:fs');
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, 'samrit.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS coll (collection TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (collection, id));
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, pass TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  return {
    kind: 'sqlite',
    async init() {},
    async collList(c) { return db.prepare('SELECT data FROM coll WHERE collection=?').all(c).map(r => JSON.parse(r.data)); },
    async collUpsert(c, obj) {
      if (!obj.id) obj.id = genId();
      db.prepare('INSERT INTO coll(collection,id,data) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data')
        .run(c, obj.id, JSON.stringify(obj));
      return obj;
    },
    async collRemove(c, id) { db.prepare('DELETE FROM coll WHERE collection=? AND id=?').run(c, id); },
    async collGet(c, id) { const r = db.prepare('SELECT data FROM coll WHERE collection=? AND id=?').get(c, id); return r ? JSON.parse(r.data) : null; },
    async settingGet(k) { const r = db.prepare('SELECT value FROM settings WHERE key=?').get(k); return r ? JSON.parse(r.value) : undefined; },
    async settingSet(k, v) { db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, JSON.stringify(v)); return v; },
    async userCreate(doc) {
      const { pass, ...data } = doc;
      db.prepare('INSERT INTO users(id,username,pass,data) VALUES(?,?,?,?)').run(doc.id, doc.username, pass, JSON.stringify(data));
      return doc;
    },
    async userByUsername(u) {
      const r = db.prepare('SELECT pass,data FROM users WHERE username=?').get(u);
      return r ? { ...JSON.parse(r.data), pass: r.pass } : null;
    },
    async userById(id) { const r = db.prepare('SELECT data FROM users WHERE id=?').get(id); return r ? JSON.parse(r.data) : null; },
    async userList() { return db.prepare('SELECT data FROM users').all().map(r => JSON.parse(r.data)); },
    async userUpdate(id, doc) {
      const { pass, ...data } = doc;
      db.prepare('UPDATE users SET data=?, username=? WHERE id=?').run(JSON.stringify(data), data.username, id);
      if (pass !== undefined) db.prepare('UPDATE users SET pass=? WHERE id=?').run(pass, id);
      return doc;
    },
    async userDelete(id) { db.prepare('DELETE FROM users WHERE id=?').run(id); },
  };
}

// ─── Backend selection ─────────────────────────────────────────
const URI = process.env.MONGODB_URI || process.env.MONGO_URL || '';
const backend = URI ? mongoBackend(URI) : sqliteBackend();

// ─── Public async API (used by server.js / auth.js) ────────────
async function listColl(c) { return backend.collList(c); }
async function upsertColl(c, obj) { return backend.collUpsert(c, obj); }
async function removeColl(c, id) { return backend.collRemove(c, id); }
async function getColl(c, id) { return backend.collGet(c, id); }

async function getSetting(k, def) { const v = await backend.settingGet(k); return v === undefined ? def : v; }
async function setSetting(k, v) { return backend.settingSet(k, v); }

async function createUser({ id, name, username, password, role, perms, active, email, phone }) {
  const doc = {
    id: id || genId(), name, username, role: role || 'resident',
    perms: perms || [], active: active !== false, email: email || '', phone: phone || '',
    pass: hashPassword(password),
  };
  await backend.userCreate(doc);
  return publicUser(doc);
}
async function findUserByUsername(u) { return backend.userByUsername(u); }   // includes pass (for login)
async function findUserById(id) { return backend.userById(id); }            // no pass
async function listUsers(role) { const all = await backend.userList(); return role ? all.filter(u => u.role === role) : all; }
async function updateUser(id, patch) {
  const cur = await backend.userById(id);
  if (!cur) return null;
  const next = { ...cur, ...patch, id };
  if (patch.password) next.pass = hashPassword(patch.password);
  delete next.password;
  await backend.userUpdate(id, next);
  return publicUser(next);
}
async function deleteUser(id) { return backend.userDelete(id); }

// ─── First-run seeding ─────────────────────────────────────────
async function seedIfEmpty() {
  if (await getSetting('_seeded', false)) return;
  for (const c of COLLECTIONS) for (const o of (seed[c] || [])) await backend.collUpsert(c, o);
  for (const u of [...seed.staffUsers, ...seed.residents]) {
    if (!(await backend.userByUsername(u.username))) await createUser(u);
  }
  await setSetting('paySettings', seed.paySettings);
  await setSetting('photos', {});
  await setSetting('_seeded', true);
  console.log('[db] seeded initial data');
}

// Connect (Mongo) / open (SQLite), then seed if empty.
async function init() {
  await backend.init();
  await seedIfEmpty();
  return backend.kind;
}

module.exports = {
  init, kind: () => backend.kind, COLLECTIONS,
  verifyPassword, publicUser,
  listColl, upsertColl, removeColl, getColl,
  getSetting, setSetting,
  createUser, findUserByUsername, findUserById, listUsers, updateUser, deleteUser,
  seedIfEmpty,
};
