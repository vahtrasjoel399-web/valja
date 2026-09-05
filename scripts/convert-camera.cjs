// Run after Blender's render_web.py. Requires the project's sharp dependency.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
  const output = path.join(root, 'assets/camera');
  fs.mkdirSync(output, { recursive: true });
  for (let i = 0; i < 80; i++) {
    const name = `r8_${String(i).padStart(4, '0')}`;
    const input = path.join(root, 'blender/r8-web-frames', name + '.png');
    await sharp(input)
      .webp({ quality: 90, alphaQuality: 100, effort: 5 })
      .toFile(path.join(output, name + '.webp'));
    await sharp(input).resize(640)
      .webp({ quality: 87, alphaQuality: 100, effort: 5 })
      .toFile(path.join(output, name.replace('r8_', 'r8-mobile_') + '.webp'));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
