// cv/Ngan/server.js — zero-dependency portfolio dev server
// Usage: cd cv/Ngan && node server.js
// Then open: http://localhost:3000

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT  = 3000;
const ROOT  = __dirname;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

const FOLDERS = [
  { key: 'advertising', label: 'Advertising & Digital', dir: 'Advertising & Digital' },
  { key: 'print',       label: 'Print & Editorial',     dir: 'Print & Editorial' },
  { key: 'branding',    label: 'Branding & Packaging',  dir: 'Branding & Packaging' },
  { key: 'featured',    label: 'Featured Projects',     dir: 'Featured Projects' },
  { key: 'playground',  label: 'Playground',            dir: 'Playground' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

function buildPortfolio() {
  const result = {};
  for (const folder of FOLDERS) {
    const dirPath = path.join(ROOT, folder.dir);
    let images = [];
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
        .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
        .sort();
      images = files.map(f => ({
        src:   folder.dir + '/' + f,
        title: path.basename(f, path.extname(f)).replace(/[-_]/g, ' '),
      }));
    }
    result[folder.key] = { label: folder.label, images };
  }
  return result;
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // API endpoint
  if (url === '/api/portfolio') {
    const data = buildPortfolio();
    const body = JSON.stringify(data);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(body);
    return;
  }

  // Static files
  let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
  // Prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + url);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
  console.log('Drop images into any portfolio folder and press F5 to refresh.');
});
