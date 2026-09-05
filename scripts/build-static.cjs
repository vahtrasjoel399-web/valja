const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'rig.js', 'assets']) {
  fs.cpSync(path.join(root, file), path.join(output, file), { recursive: true });
}
console.log('Static site copied to public/. Server code is not included.');
