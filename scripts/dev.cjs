const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('./build-static.cjs');
const handler = require('../api/portfolio.js');
const root = path.resolve(__dirname, '../public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/portfolio') {
      const chunks = []; let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes <= 4096) chunks.push(chunk);
      }
      if (bytes > 4096) { res.writeHead(413); res.end(); return; }
      req.body = Buffer.concat(chunks).toString('utf8');
      await handler(req, res);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(404); res.end(); return; }
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
}).listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => {
  console.log(`Preview: http://localhost:${Number(process.env.PORT) || 3000}. Restart after changing files.`);
});
