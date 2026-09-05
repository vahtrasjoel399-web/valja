const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHandler } = require('../server/photo-admin.cjs');
const ids = require('../server/portfolio-ids.json');
const env = { ADMIN_USER: 'test-admin', ADMIN_PASSWORD: 'test-password-private', SESSION_SECRET: 'test-session-secret-at-least-32-characters', NODE_ENV: 'production' };
function memoryStore() {
  const deleted = new Map();
  let attempts = 0;
  return {
    deleted,
    list: async () => [...deleted.keys()],
    hide: async (id, revision) => deleted.set(id, revision),
    restore: async (id, revision) => deleted.get(id) === revision ? deleted.delete(id) : false,
    allowLogin: async () => ++attempts <= 10
  };
}
async function request(handler, { body, cookie, headers = {}, method = body ? 'POST' : 'GET' } = {}) {
  const response = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(data) { this.body = JSON.parse(data); } };
  await handler({ method, body, headers: { host: 'example.ee', 'content-type': 'application/json', 'x-photo-admin': '1', ...(cookie ? { cookie } : {}), ...headers }, socket: { remoteAddress: '127.0.0.1' } }, response);
  return response;
}
async function login(handler) {
  const response = await request(handler, { body: { action: 'login', username: env.ADMIN_USER, password: env.ADMIN_PASSWORD } });
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['Set-Cookie'], /HttpOnly; SameSite=Strict.*Secure/);
  return response.headers['Set-Cookie'].split(';')[0];
}
test('existing photo removal is shared across visitors and server instances; undo restores it', async () => {
  const store = memoryStore();
  const admin = createHandler({ env, store });
  const visitor = createHandler({ env, store });
  const cookie = await login(admin);
  const removed = await request(admin, { cookie, body: { action: 'delete', id: ids[0] } });
  assert.equal(removed.statusCode, 200);
  const read = await request(visitor);
  assert.deepEqual(read.body.hidden, [ids[0]]);
  assert.equal(read.body.authenticated, false);
  assert.match(read.headers['Cache-Control'], /no-store/);
  assert.equal((await request(admin, { cookie, body: { action: 'restore', id: ids[0], revision: removed.body.revision } })).statusCode, 200);
  assert.deepEqual((await request(visitor)).body.hidden, []);
});
test('unauthenticated, forged, expired and old-password sessions cannot delete', async () => {
  const store = memoryStore(); let time = Date.now();
  const handler = createHandler({ env, store, now: () => time });
  const cookie = await login(handler);
  for (const token of [undefined, 'vp_admin=forged', cookie + 'x']) assert.equal((await request(handler, { cookie: token, body: { action: 'delete', id: ids[0] } })).statusCode, 401);
  time += 9 * 60 * 60 * 1000;
  assert.equal((await request(handler, { cookie, body: { action: 'delete', id: ids[0] } })).statusCode, 401);
  const rotated = createHandler({ env: { ...env, ADMIN_PASSWORD: 'rotated-password' }, store });
  assert.equal((await request(rotated, { cookie, body: { action: 'delete', id: ids[0] } })).statusCode, 401);
  assert.equal(store.deleted.size, 0);
});
test('CSRF, invalid IDs, methods, malformed and oversized bodies are rejected', async () => {
  const handler = createHandler({ env, store: memoryStore() }); const cookie = await login(handler);
  for (const headers of [{ origin: 'https://evil.example' }, { 'x-photo-admin': '' }, { 'content-type': 'text/plain' }, { 'sec-fetch-site': 'cross-site' }]) assert.equal((await request(handler, { cookie, headers, body: { action: 'delete', id: ids[0] } })).statusCode, 403);
  assert.equal((await request(handler, { cookie, body: { action: 'delete', id: '../../index.html' } })).statusCode, 400);
  assert.equal((await request(handler, { cookie, body: { action: 'delete', id: ids[0] }, headers: { origin: 'https://example.ee' } })).statusCode, 200);
  assert.equal((await request(handler, { method: 'DELETE' })).statusCode, 405);
  assert.equal((await request(handler, { body: '{broken' })).statusCode, 400);
  assert.equal((await request(handler, { body: { content: 'a'.repeat(5000) } })).statusCode, 413);
});
test('stale undo cannot overwrite a later deletion', async () => {
  const handler = createHandler({ env, store: memoryStore() }); const cookie = await login(handler);
  const first = await request(handler, { cookie, body: { action: 'delete', id: ids[0] } });
  const second = await request(handler, { cookie, body: { action: 'delete', id: ids[0] } });
  assert.equal((await request(handler, { cookie, body: { action: 'restore', id: ids[0], revision: first.body.revision } })).statusCode, 409);
  assert.deepEqual((await request(handler)).body.hidden, [ids[0]]);
  assert.equal((await request(handler, { cookie, body: { action: 'restore', id: ids[0], revision: second.body.revision } })).statusCode, 200);
});
test('missing setup disables mutation, and missing auth settings never reintroduce deleted photos', async () => {
  const handler = createHandler({ env: {} });
  assert.equal((await request(handler)).body.configured, false);
  assert.equal((await request(handler, { body: { action: 'delete', id: ids[0] } })).statusCode, 503);
  const store = memoryStore(); await store.hide(ids[0], 'revision');
  const noAuth = await request(createHandler({ env: {}, store }));
  assert.equal(noAuth.body.configured, false);
  assert.deepEqual(noAuth.body.hidden, [ids[0]]);
});
test('database failure is reported, never claimed as successful deletion', async () => {
  const store = memoryStore(); const handler = createHandler({ env, store }); const cookie = await login(handler);
  store.hide = async () => { throw Error('private connection information'); };
  const response = await request(handler, { cookie, body: { action: 'delete', id: ids[0] } });
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { error: 'unavailable' });
});
test('bad logins are rejected and repeated attempts are limited', async () => {
  const handler = createHandler({ env, store: memoryStore() });
  for (let i = 0; i < 10; i++) assert.equal((await request(handler, { body: { action: 'login', username: env.ADMIN_USER, password: 'wrong' } })).statusCode, 401);
  const response = await request(handler, { body: { action: 'login', username: env.ADMIN_USER, password: env.ADMIN_PASSWORD } });
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers['Retry-After'], '900');
});
test('logout expires the cookie', async () => {
  const handler = createHandler({ env, store: memoryStore() }); const cookie = await login(handler);
  const response = await request(handler, { cookie, body: { action: 'logout' } });
  assert.equal(response.statusCode, 200); assert.match(response.headers['Set-Cookie'], /Max-Age=0/);
});
test('server allowlist matches every existing portfolio image and public code contains no password', () => {
  const script = fs.readFileSync('script.js', 'utf8');
  const imageIds = [...script.matchAll(/url: '(assets\/portfolio\/[^']+)'/g)].map(m => m[1]);
  assert.deepEqual(ids, imageIds); assert.equal(ids.length, 73);
  for (const id of ids) assert.ok(fs.existsSync(id));
  assert.doesNotMatch(script, /const ADMIN_PASS(?:WORD)?\s*=/); assert.ok(!script.includes('val_admin_auth'));
  assert.ok(!script.includes('val_hidden_photos'), 'old browser deletions must not be published automatically');
});
