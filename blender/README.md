# Canon EOS R8 studio scene

Open `canon-r8-studio.blend`. The scene contains seven animated groups:
body, viewfinder, LCD, RF bayonet, lens base, zoom mechanics and front optical cell.
Frames 1–124 assemble the camera; 124–160 turn the completed camera.

This is an artistic approximation based on EOS R8 product photographs, not factory CAD.
The lens is a representative RF zoom; the owner has not confirmed its model.
R8 reference: https://www.photoxels.com/canon-adds-entry-level-r50-aps-c-and-r8-full-frame-mirrorless-cameras/
R8 specifications: https://global.canon/en/c-museum/product/dslr907.html

## Rebuild

Run the installed Blender with `--background --python blender/create_r8.py`.
Use `R8_SKIP_HERO=1` to skip the optional studio still.
Then run Blender with `--background --python blender/render_r8_web.py`,
followed by `node scripts/convert-camera.cjs` and `npm run build`.
On supported Macs, `R8_GPU=1` enables Metal; `R8_RESUME=1` skips existing PNG frames.
Use resume only when the scene and render settings have not changed.

Web output: 80 transparent 1100 px WebP frames, plus 640 px mobile versions.
`R8_PREVIEW=1` renders only three reduced-resolution review frames.
The browser loads a small window of neighbouring frames, with three requests at a time.
Reduced motion loads only the assembled frame.

The source scripts rebuild separate scenes; manual edits should be saved under
another filename before rebuilding. Generated Blender files and raw renders stay
local and are excluded from deployment. Older R7 scripts are retained for reference.
