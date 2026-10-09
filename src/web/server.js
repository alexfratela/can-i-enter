// A small static server plus two endpoints, so the page can run the same checks the
// command line runs. No framework, no dependencies: node src/web/server.js and open the
// address it prints.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { checkRecorded, checkUrl } = require('../engine.js');
const { RECORDED } = require('../sources.js');

const PORT = Number(process.env.PORT) || 5173; // 2026-09-23: Vite's default port, free on this machine.
const WEB = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'content-type': type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/sources') return send(res, 200, JSON.stringify(RECORDED));

  if (url.pathname === '/api/check' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch { return send(res, 400, JSON.stringify({ error: 'Bad JSON in request.' })); }
    try {
      const result = body.url
        ? await checkUrl(body.url, body.profile || {}, body.today)
        : checkRecorded(body.id, body.profile || {}, body.today);
      return send(res, 200, JSON.stringify(result));
    } catch (e) {
      return send(res, 502, JSON.stringify({ error: e.message }));
    }
  }

  const name = url.pathname === '/' ? 'index.html' : path.basename(url.pathname);
  const file = path.join(WEB, name);
  if (!fs.existsSync(file) || !file.startsWith(WEB)) return send(res, 404, 'Not found', 'text/plain');
  send(res, 200, fs.readFileSync(file), TYPES[path.extname(file)] || 'application/octet-stream');
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Can I Enter? - open http://localhost:${PORT}`));
}

module.exports = { server, PORT };
