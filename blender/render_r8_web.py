"""Render the R8 assembly for the website. Set R8_PREVIEW=1 for three review frames."""
import bpy, os
from mathutils import Vector
root=os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'canon-r8-studio.blend'))
s=bpy.context.scene
if os.getenv('R8_GPU') == '1':
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='METAL';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='METAL'
    s.cycles.device='GPU'
preview=os.getenv('R8_PREVIEW')=='1'
s.render.resolution_x=s.render.resolution_y=1100
s.render.resolution_percentage=70 if preview else 100
s.cycles.samples=16 if preview else 64
s.cycles.use_denoising=True
s.cycles.use_adaptive_sampling=True
s.cycles.adaptive_threshold=.035
s.render.film_transparent=True
s.render.image_settings.color_mode='RGBA'
s.render.use_persistent_data=True
bpy.data.objects['Studio floor'].hide_render=True
out=os.path.join(root,'r8-preview' if preview else 'r8-web-frames')
os.makedirs(out,exist_ok=True)
for i in ([0,39,79] if preview else range(80)):
    dest=os.path.join(out,f'r8_{i:04}.png')
    if os.getenv('R8_RESUME')=='1' and os.path.exists(dest):continue
    p=i/79
    s.frame_set(round(1+p*159))
    # Wide opening for the exploded parts; ease into a generous close-up.
    t=min(1,max(0,(p-.18)/.60));t=t*t*(3-2*t)
    s.camera.data.ortho_scale=34-15*t
    target=Vector((0,-5+3*t,5.2-.9*t))
    s.camera.rotation_euler=(target-s.camera.location).to_track_quat('-Z','Y').to_euler()
    s.render.filepath=dest
    bpy.ops.render.render(write_still=True)
    print(f'R8 FRAME {i+1}/80',flush=True)
