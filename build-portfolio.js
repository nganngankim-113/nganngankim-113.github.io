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

    images = files.map(f => {
      const base  = path.basename(f, path.extname(f));
      const lower = base.toLowerCase();
      const title = base.replace(/[-_]/g, ' ');

      // Tag print images so index.html can split into sub-tabs
      if (folder.key === 'print') {
        let type = 'page'; // default → magazine inner page
        if      (lower.includes('cover'))                                   type = 'cover';
        else if (lower.includes('back'))                                    type = 'back';
        else if (lower.includes('mockup'))                                  type = 'mockup';
        else if (lower.includes('standee'))                                 type = 'standee';
        else if (lower.includes('tentcard') || lower.includes('tent-card')) type = 'tentcard';
        else if (lower.includes('page'))                                    type = 'page';
        return { src: folder.dir + '/' + f, title, type };
      }

      return { src: folder.dir + '/' + f, title };
    });
  }
  tabs[folder.key] = { label: folder.label, images };
  console.log(folder.dir + ': ' + images.length + ' images');
  total += images.length;
}

const allImages = Object.keys(tabs).flatMap(k => tabs[k].images);

const lines = [
  '// Auto-generated — do NOT edit. Re-run: node build-portfolio.js',
  'const TABS_STATIC = ' + JSON.stringify(tabs, null, 2) + ';',
  "TABS_STATIC.allwork = { label: 'All Work', images: " + JSON.stringify(allImages) + ' };',
];

fs.writeFileSync(path.join(ROOT, 'portfolio-data.js'), lines.join('\n') + '\n', 'utf8');
console.log('\nTotal: ' + total + ' images — portfolio-data.js written.');
