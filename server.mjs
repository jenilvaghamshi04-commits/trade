import http from 'node:http';
import { readFile } from 'node:fs/promises';
const routes = new Map([['/engine.js', ['engine.js', 'text/javascript; charset=utf-8']], ['/paper.js', ['paper.js', 'text/javascript; charset=utf-8']], ['/', ['index.html', 'text/html; charset=utf-8']], ['/index.html', ['index.html', 'text/html; charset=utf-8']], ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]]);
const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, {Allow:'GET, HEAD'}); res.end(); return; }
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/health') { res.writeHead(200, {'Content-Type':'text/plain'}); res.end(req.method === 'HEAD' ? undefined : 'ok'); return; }
  const route = routes.get(path);
  if (!route) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await readFile(new URL(route[0], import.meta.url));
    res.writeHead(200, {'Content-Type':route[1], 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end('Unable to load page'); }
});
server.listen(Number(process.env.PORT || 10000), '0.0.0.0', () => console.log('BTC Pattern Lab ready'));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
