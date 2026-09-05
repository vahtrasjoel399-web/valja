const { createHash, createHmac, timingSafeEqual, randomUUID } = require('node:crypto');
const portfolioIds = new Set(require('./portfolio-ids.json'));
const COOKIE = 'vp_admin';
const SESSION_SECONDS = 8 * 60 * 60;

function equal(a, b) {
  const digest = value => createHash('sha256').update(String(value)).digest();
  return timingSafeEqual(digest(a), digest(b));
}

// A shared database survives redeployments and is used by every visitor.
function postgresStore(env) {
  const { createPool } = require('@vercel/postgres');
  const pool = createPool({ connectionString: env.POSTGRES_URL || env.DATABASE_URL });
  let ready;
  async function query(text, params = []) {
    if (!ready) {
      ready = (async () => {
        await pool.query(`CREATE TABLE IF NOT EXISTS site_hidden_photos (
          id text PRIMARY KEY, revision uuid NOT NULL, deleted_at timestamptz NOT NULL DEFAULT now()
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS site_admin_attempts (
          key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL
        )`);
      })().catch(error => { ready = undefined; throw error; });
    }
    await ready;
    return pool.query(text, params);
  }
  return {
    async list() { return (await query('SELECT id FROM site_hidden_photos')).rows.map(row => row.id); },
    async hide(id, revision) {
      await query(`INSERT INTO site_hidden_photos (id, revision) VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET revision = EXCLUDED.revision, deleted_at = now()`, [id, revision]);
    },
    async restore(id, revision) {
      return (await query('DELETE FROM site_hidden_photos WHERE id = $1 AND revision = $2 RETURNING id', [id, revision])).rowCount > 0;
    },
    async allowLogin(key) {
      await query('DELETE FROM site_admin_attempts WHERE expires_at < now()');
      const result = await query(`INSERT INTO site_admin_attempts (key, attempts, expires_at)
        VALUES ($1, 1, now() + interval '15 minutes')
        ON CONFLICT (key) DO UPDATE SET attempts = site_admin_attempts.attempts + 1
        RETURNING attempts`, [key]);
      return result.rows[0].attempts <= 10;
    }
  };
}

function createHandler({ env = process.env, store: providedStore, now = Date.now } = {}) {
  let store = providedStore;
  const storageConfigured = () => Boolean(env.POSTGRES_URL || env.DATABASE_URL || providedStore);
  const configured = () => Boolean(storageConfigured() &&
    env.ADMIN_USER && env.ADMIN_PASSWORD && env.ADMIN_PASSWORD !== 'change-me' && env.SESSION_SECRET?.length >= 32);
  const signingKey = () => createHmac('sha256', env.SESSION_SECRET).update(`${env.ADMIN_USER}\0${env.ADMIN_PASSWORD}`).digest();
  const sign = payload => createHmac('sha256', signingKey()).update(payload).digest('base64url');
  const authed = req => {
    if (!configured()) return false;
    const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (!token || token.length > 1024) return false;
    const parts = token.split('.');
    if (parts.length !== 2 || !/^\d+$/.test(parts[0])) return false;
    const expiry = Number(parts[0]);
    return expiry > now() && expiry <= now() + SESSION_SECONDS * 1000 && equal(parts[1], sign(parts[0]));
  };
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Vary', 'Cookie');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    const cookie = (token, maxAge) => res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${env.VERCEL || env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    try {
      if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return send(405, { error: 'method' }); }
      if (req.method === 'GET' && !storageConfigured()) return send(200, { configured: false, authenticated: false, hidden: [] });
      if (req.method === 'POST') {
        // A custom header and JSON reject cross-origin HTML forms. No CORS access is granted.
        if (req.headers['x-photo-admin'] !== '1' || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(403, { error: 'origin' });
        if (req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'origin' });
        if (req.headers.origin) {
          let origin;
          try { origin = new URL(req.headers.origin); } catch { return send(403, { error: 'origin' }); }
          if (origin.host !== req.headers.host) return send(403, { error: 'origin' });
        }
        if (Number(req.headers['content-length'] || 0) > 4096) return send(413, { error: 'body' });
      }
      if (req.method === 'POST' && !configured()) return send(503, { error: 'setup' });
      store ||= postgresStore(env);
      if (req.method === 'GET') return send(200, { configured: configured(), authenticated: authed(req), hidden: await store.list() });
      let body = req.body;
      if (typeof body === 'string') {
        if (Buffer.byteLength(body) > 4096) return send(413, { error: 'body' });
        try { body = JSON.parse(body); } catch { return send(400, { error: 'body' }); }
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return send(400, { error: 'body' });
      if (Buffer.byteLength(JSON.stringify(body)) > 4096) return send(413, { error: 'body' });
      if (body.action === 'login') {
        // Vercel overwrites x-forwarded-for to prevent IP spoofing; locally use the socket.
        const ip = env.VERCEL ? req.headers['x-forwarded-for'] || 'unknown' : req.socket?.remoteAddress || 'local';
        const key = createHmac('sha256', signingKey()).update(String(ip)).digest('hex');
        if (!await store.allowLogin(key)) { res.setHeader('Retry-After', '900'); return send(429, { error: 'rate' }); }
        if (typeof body.username !== 'string' || typeof body.password !== 'string' ||
            !equal(body.username, env.ADMIN_USER) || !equal(body.password, env.ADMIN_PASSWORD)) return send(401, { error: 'credentials' });
        const payload = String(now() + SESSION_SECONDS * 1000);
        cookie(`${payload}.${sign(payload)}`, SESSION_SECONDS);
        return send(200, { authenticated: true, hidden: await store.list() });
      }
      if (body.action === 'logout') { cookie('', 0); return send(200, { authenticated: false }); }
      if (!authed(req)) return send(401, { error: 'session' });
      if (!['delete', 'restore'].includes(body.action) || !portfolioIds.has(body.id)) return send(400, { error: 'photo' });
      if (body.action === 'delete') {
        const revision = randomUUID();
        await store.hide(body.id, revision);
        return send(200, { id: body.id, revision });
      }
      if (typeof body.revision !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(body.revision)) return send(400, { error: 'photo' });
      if (!await store.restore(body.id, body.revision)) return send(409, { error: 'conflict' });
      return send(200, { id: body.id });
    } catch {
      return send(503, { error: 'unavailable' });
    }
  };
}
module.exports = { createHandler };
