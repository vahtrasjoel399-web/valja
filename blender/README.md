# Camera studio scene

Open `canon-r7-studio.blend` in Blender. `camera-hero.png` is the checked studio render.

Editable EOS R7-inspired model with contoured housing, grip texture, rear LCD / EVF,
controls, bayonet, ribbed zoom lens and studio lights. It is an artistic approximation,
not a manufacturer CAD model. The representative 18–150 mm lens is an assumption;
the photographer's actual lens has not been confirmed.

Timeline: 1–20 separated lens, 20–65 lens installation, 65–120 camera turn.
Frame 65 is the assembled hero view. Body and lens have separate parent controls.
Source photographs are packed into the hidden REFERENCES collection.

Reference sources:
- https://www.canon.com.br/para-voce/cameras/eos-mirrorless/eos-r7
- https://thehomeground.asia/tech-gadgets/canon-eos-revolution-expands-into-aps-c-with-two-new-cameras-and-lenses/

Rebuild with the installed Blender:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/create_camera.py
```

The script builds a fresh scene in its own process. Rebuilding overwrites the generated
blend and preview, so save manual edits under another filename first.
The website uses 48 transparent WebP frames from this scene.
Run `render_web.py` with Blender, then `node scripts/convert-camera.cjs`
to regenerate `assets/camera/`. Rebuild the site after conversion.
