// cv/Ngan/build-portfolio.js
// Usage: node build-portfolio.js
// Run before deploying to static hosting (GitHub Pages, Netlify)

const fs   = require('fs');
const path = require('path');

const ROOT      = __dirname;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

// Helper: scan a single flat folder, return image objects with optional type tag
function scanDir(dir, type) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    console.warn(`  [WARN] Folder not found: ${dir}`);
    return [];
  }
  const files = fs.readdirSync(dirPath)
    .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort();
  return files.map(f => ({
    src:   dir + '/' + f,
    title: path.basename(f, path.extname(f)).replace(/[-_]/g, ' '),
    ...(type ? { type } : {}),
  }));
}

// ── Simple tabs (flat folder) ──────────────────────────────────────────────
const SIMPLE_FOLDERS = [
  { key: 'advertising', label: 'Advertising & Digital', dir: 'Advertising & Digital' },
  { key: 'branding',    label: 'Branding & Packaging',  dir: 'Branding & Packaging' },
  { key: 'featured',    label: 'Featured Projects',     dir: 'Featured Projects' },
  { key: 'playground',  label: 'Playground',            dir: 'Playground' },
];

const tabs = {};
let total = 0;

for (const folder of SIMPLE_FOLDERS) {
  const images = scanDir(folder.dir);
  tabs[folder.key] = { label: folder.label, images };
  console.log(`${folder.dir}: ${images.length} images`);
  total += images.length;
}

// ── Print & Collateral (3 subfolders with type tags) ──────────────────────
const PRINT_BASE = 'Print & Collateral';
const printSubFolders = [
  // Editorial sub-tab: cover, back, page images + mockups
  { subDir: `${PRINT_BASE}/Editorial`,       type: 'editorial' },
  // POSM & Display sub-tab: standees + tent cards
  { subDir: `${PRINT_BASE}/POSM & Display`,  type: 'posm'      },
  // Cards & Prints sub-tab
  { subDir: `${PRINT_BASE}/Cards & Prints`,  type: 'cards'     },
];

let printImages = [];
for (const { subDir, type } of printSubFolders) {
  const imgs = scanDir(subDir, type);
  console.log(`  ${subDir}: ${imgs.length} images (type=${type})`);
  printImages = printImages.concat(imgs);
  total += imgs.length;
}

tabs['print'] = { label: 'Print & Collateral', images: printImages };
console.log(`Print & Collateral total: ${printImages.length} images`);

// ── All Work ───────────────────────────────────────────────────────────────
const allImages = Object.keys(tabs).flatMap(k => tabs[k].images);

const lines = [
  '// Auto-generated — do NOT edit. Re-run: node build-portfolio.js',
  'const TABS_STATIC = ' + JSON.stringify(tabs, null, 2) + ';',
  "TABS_STATIC.allwork = { label: 'All Work', images: " + JSON.stringify(allImages) + ' };',
];

fs.writeFileSync(path.join(ROOT, 'portfolio-data.js'), lines.join('\n') + '\n', 'utf8');
console.log(`\nTotal: ${total} images — portfolio-data.js written.`);
