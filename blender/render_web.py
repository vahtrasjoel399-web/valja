import bpy, os
from mathutils import Vector
root=os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(root,'canon-r7-studio.blend'))
s=bpy.context.scene
s.render.resolution_x=720
s.render.resolution_y=720
s.render.resolution_percentage=100
s.cycles.samples=12
s.cycles.use_denoising=True
s.render.film_transparent=True
s.render.image_settings.color_mode='RGBA'
bpy.data.objects['Studio floor'].hide_render=True
s.camera.data.ortho_scale=23
s.camera.rotation_euler=(Vector((0,-3.5,4.3))-s.camera.location).to_track_quat('-Z','Y').to_euler()
out=os.path.join(root,'web-frames')
os.makedirs(out,exist_ok=True)
for i in range(48):
    s.frame_set(round(1+i*119/47))
    s.render.filepath=os.path.join(out,f'r7_{i:04}.png')
    bpy.ops.render.render(write_still=True)
    print(f'WEB FRAME {i+1}/48',flush=True)
