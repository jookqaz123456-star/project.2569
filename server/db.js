// ─── SQLite persistence (node:sqlite built-in, no native deps) ──
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const seed = require('./seed');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'samrit.db');

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS coll (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    pass TEXT NOT NULL,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// ─── Password hashing (scrypt, built-in crypto) ────────────────
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex'), b = Buffer.from(test, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ─── Generic collection CRUD ───────────────────────────────────
const COLLECTIONS = ['rooms','tenants','bookings','contracts','payments','bills','stays','repairs','slips'];
function listColl(c) {
  return db.prepare('SELECT data FROM coll WHERE collection=?').all(c).map(r => JSON.parse(r.data));
}
function upsertColl(c, obj) {
  if (!obj.id) obj.id = 'id' + Date.now() + Math.random().toString(36).slice(2, 6);
  db.prepare('INSERT INTO coll(collection,id,data) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data')
    .run(c, obj.id, JSON.stringify(obj));
  return obj;
}
function removeColl(c, id) {
  db.prepare('DELETE FROM coll WHERE collection=? AND id=?').run(c, id);
}
function getColl(c, id) {
  const r = db.prepare('SELECT data FROM coll WHERE collection=? AND id=?').get(c, id);
  return r ? JSON.parse(r.data) : null;
}

// ─── Settings ──────────────────────────────────────────────────
function getSetting(key, def) {
  const r = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
  return r ? JSON.parse(r.value) : def;
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run(key, JSON.stringify(value));
  return value;
}

// ─── Users ─────────────────────────────────────────────────────
function publicUser(u) { const { pass, ...rest } = u; return rest; }
function createUser({ id, name, username, password, role, perms, active, email, phone }) {
  id = id || 'id' + Date.now() + Math.random().toString(36).slice(2, 6);
  const data = { id, name, username, role: role || 'resident', perms: perms || [], active: active !== false, email: email || '', phone: phone || '' };
  db.prepare('INSERT INTO users(id,username,pass,data) VALUES(?,?,?,?)')
    .run(id, username, hashPassword(password), JSON.stringify(data));
  return data;
}
function findUserByUsername(username) {
  const r = db.prepare('SELECT id,username,pass,data FROM users WHERE username=?').get(username);
  if (!r) return null;
  return { ...JSON.parse(r.data), pass: r.pass };
}
function findUserById(id) {
  const r = db.prepare('SELECT data FROM users WHERE id=?').get(id);
  return r ? JSON.parse(r.data) : null;
}
function listUsers(role) {
  const rows = db.prepare('SELECT data FROM users').all().map(r => JSON.parse(r.data));
  return role ? rows.filter(u => u.role === role) : rows;
}
function updateUser(id, patch) {
  const cur = findUserById(id);
  if (!cur) return null;
  const next = { ...cur, ...patch, id };
  db.prepare('UPDATE users SET data=?, username=? WHERE id=?').run(JSON.stringify(next), next.username, id);
  if (patch.password) db.prepare('UPDATE users SET pass=? WHERE id=?').run(hashPassword(patch.password), id);
  return next;
}
function deleteUser(id) { db.prepare('DELETE FROM users WHERE id=?').run(id); }

// ─── First-run seeding ─────────────────────────────────────────
function seedIfEmpty() {
  const seeded = getSetting('_seeded', false);
  if (seeded) return;
  for (const c of COLLECTIONS) (seed[c] || []).forEach(o => upsertColl(c, o));
  [...seed.staffUsers, ...seed.residents].forEach(u => {
    if (!findUserByUsername(u.username)) createUser(u);
  });
  setSetting('paySettings', seed.paySettings);
  setSetting('photos', {});
  setSetting('_seeded', true);
  console.log('[db] seeded initial data');
}
seedIfEmpty();

module.exports = {
  db, COLLECTIONS, verifyPassword, publicUser,
  listColl, upsertColl, removeColl, getColl,
  getSetting, setSetting,
  createUser, findUserByUsername, findUserById, listUsers, updateUser, deleteUser,
};
