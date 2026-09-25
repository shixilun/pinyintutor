// Minimal static file server for local testing. No dependencies — fetch()
// (used by the lessons panel to load the manifest and topic files) is
// blocked by browsers under file://, so this is needed instead of just
// opening index.html directly.
//
// Usage: node serve.mjs [port]  (defaults to 8420)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = Number(process.argv[2]) || 8420;
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.join(ROOT, urlPath === '/' ? '/index.html' : urlPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
