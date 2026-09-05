// Run after Blender's render_web.py. Requires the project's sharp dependency.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
  const output = path.join(root, 'assets/camera');
  fs.mkdirSync(output, { recursive: true });
  for (let i = 0; i < 48; i++) {
    const name = `r7_${String(i).padStart(4, '0')}`;
    await sharp(path.join(root, 'blender/web-frames', name + '.png'))
      .webp({ quality: 82, alphaQuality: 90, effort: 5 })
      .toFile(path.join(output, name + '.webp'));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
