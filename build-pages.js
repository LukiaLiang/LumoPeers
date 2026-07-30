const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
const staticFiles = ['index.html', 'script.js', 'style.css'];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(path.join(__dirname, file), path.join(outDir, file));
}
