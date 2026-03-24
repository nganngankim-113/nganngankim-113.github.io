// cv/Ngan/build-portfolio.js
// Usage: node build-portfolio.js
// Run before deploying to static hosting (GitHub Pages, Netlify)

const fs   = require('fs');
const path = require('path');

const ROOT      = __dirname;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

const FOLDERS = [
  { key: 'advertising', label: 'Advertising & Digital', dir: 'Advertising & Digital' },
  { key: 'print',       label: 'Print & Editorial',     dir: 'Print & Editorial' },
  { key: 'branding',    label: 'Branding & Packaging',  dir: 'Branding & Packaging' },
  { key: 'featured',    label: 'Featured Projects',     dir: 'Featured Projects' },
  { key: 'playground',  label: 'Playground',            dir: 'Playground' },
];

const tabs = {};
let total = 0;

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
  tabs[folder.key] = { label: folder.label, images };
  console.log(`${folder.dir}: ${images.length} images`);
  total += images.length;
}

const allImages = Object.keys(tabs).flatMap(k => tabs[k].images);

const lines = [
  '// Auto-generated — do NOT edit. Re-run: node build-portfolio.js',
  'const TABS_STATIC = ' + JSON.stringify(tabs, null, 2) + ';',
  "TABS_STATIC.allwork = { label: 'All Work', images: " + JSON.stringify(allImages) + ' };',
];

fs.writeFileSync(path.join(ROOT, 'portfolio-data.js'), lines.join('\n') + '\n', 'utf8');
console.log(`\nTotal: ${total} images — portfolio-data.js written.`);
