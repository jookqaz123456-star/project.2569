// ─── Minimal HS256 JWT (built-in crypto, no deps) ──────────────
const crypto = require('node:crypto');
const SECRET = process.env.JWT_SECRET || 'samrit-dev-secret-change-me';

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const b64urlJSON = (obj) => b64url(JSON.stringify(obj));

function sign(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSec };
  const data = `${b64urlJSON(header)}.${b64urlJSON(body)}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// Express middleware factory (async — db lookups may hit MongoDB)
function authMiddleware(db) {
  return async (req, _res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      const payload = verify(token);
      req.user = payload ? await db.findUserById(payload.sub) : null;
    } catch (e) {
      req.user = null;
    }
    next();
  };
}
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}
function requireStaff(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff'))
    return res.status(403).json({ error: 'forbidden' });
  next();
}

module.exports = { sign, verify, authMiddleware, requireAuth, requireStaff };
