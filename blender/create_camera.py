"""Rebuild the editable EOS R7-inspired studio scene. Run with Blender --background --python."""
import bpy, math, os
from mathutils import Vector, Euler, Quaternion
from math import sin, cos, pi

ROOT = os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for coll in list(bpy.data.collections):
    if coll.name != 'Collection': bpy.data.collections.remove(coll)

def material(name, color, rough=.4, metal=0, noise=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    n=m.node_tree.nodes; l=m.node_tree.links; n.clear()
    p=n.new('ShaderNodeBsdfPrincipled'); p.name='Principled BSDF'
    out=n.new('ShaderNodeOutputMaterial'); l.new(p.outputs['BSDF'],out.inputs['Surface'])
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    if noise:
        tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=115
        tex.inputs['Detail'].default_value=3
        bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=noise
        bump.inputs['Distance'].default_value=.045
        l.new(tex.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs['Normal'],p.inputs['Normal'])
    return m

shell=material('Body | satin black magnesium',(.019,.023,.026),.32,.28,.13)
rubber=material('Grip | fine pebbled rubber',(.012,.014,.016),.63,0,.52)
black=material('Recesses | deep black',(.004,.006,.008),.5)
metal=material('Machined anodised lens barrel',(.022,.027,.033),.26,.7)
silver=material('Brushed mount alloy',(.48,.52,.57),.24,.85)
white=material('Warm white engravings',(.86,.88,.87),.42)
red=material('Alignment and recording red',(.55,.013,.015),.29)
gold=material('Electrical contacts',(.7,.42,.1),.24,.8)
glass=material('Optical glass | blue green coating',(.014,.061,.073),.075,.58)
glass.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.65
screenmat=material('LCD | dark reflective glass',(.012,.025,.035),.14,.35)

def group(name):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); return o
assembly=group('CAMERA • rotate this to inspect')
body=group('01 • Camera body'); body.parent=assembly
lens=group('02 • Lens assembly'); lens.parent=assembly

def finish(o,name,mat,parent=body,bevel=0):
    o.name=name
    if mat:o.data.materials.append(mat)
    if parent:o.parent=parent
    if bevel:
        m=o.modifiers.new('Soft manufactured edges','BEVEL'); m.width=bevel; m.segments=4
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
        m=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return o

def box(name,loc,dims,mat= shell,bevel=.1,parent=body):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object
    o.dimensions=dims; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,mat,parent,bevel)

def cyl(name,loc,r,depth,mat=metal,parent=lens,axis='Y',verts=96):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc)
    o=bpy.context.object
    if axis=='Y':o.rotation_euler[0]=pi/2
    if axis=='X':o.rotation_euler[1]=pi/2
    return finish(o,name,mat,parent,.035)

def ring(name,y,outer,inner,depth,mat=metal,parent=lens,cx=.65,cz=4.25):
    vs=[]; fs=[]; count=128
    for yy,rr in [(y-depth/2,outer),(y+depth/2,outer),(y-depth/2,inner),(y+depth/2,inner)]:
        vs.extend([(cx+rr*cos(2*pi*i/count),yy,cz+rr*sin(2*pi*i/count)) for i in range(count)])
    for a,b in [(0,1),(2,0),(1,3),(3,2)]:
        for i in range(count):
            j=(i+1)%count;fs.append((a*count+i,a*count+j,b*count+j,b*count+i))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
    return finish(o,name,mat,parent,.022)

def label(name,text,loc,size=.24,mat=white,parent=body,rot=(pi/2,0,0),align='CENTER'):
    curve=bpy.data.curves.new(name,'FONT');curve.body=text;curve.align_x=align;curve.align_y='CENTER'
    curve.size=size;curve.extrude=.002;curve.bevel_depth=.001
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o)
    o.location=loc;o.rotation_euler=rot;o.data.materials.append(mat);o.parent=parent;return o

# Shaped front silhouette, based on the front / top Canon reference photos.
outline=[(-6.3,.7),(-6.55,1.2),(-6.55,6.5),(-6.1,7.2),(-4.7,7.5),(-2.2,7.4),(-1.5,7.9),(-.95,8.8),(1.65,8.8),(2.3,7.9),(3.3,7.45),(5.7,7.2),(6.4,6.6),(6.4,1.15),(5.95,.7)]
vs=[(x,y,z) for y in [-1.3,1.95] for x,z in outline]; n=len(outline)
fs=[tuple(reversed(range(n))),tuple(range(n,n*2))]
fs.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
mesh=bpy.data.meshes.new('Contoured magnesium shell');mesh.from_pydata(vs,[],fs);mesh.update()
o=bpy.data.objects.new('R7 | sculpted main housing',mesh);bpy.context.collection.objects.link(o);finish(o,o.name,shell,body,.3)

# Deep ergonomic right hand grip (left in front view).
grip=box('Deep ergonomic hand grip',(-4.9,-1.5,3.9),(3.2,4.4,6.55),rubber,.7)
box('Grip upper shoulder',(-4.8,-1.55,6.9),(3.25,4.15,1.2),shell,.5)
box('Bottom plate',(0,.1,.8),(12.35,3.1,.5),black,.16)
box('Front leatherette panel',(3.9,-1.48,3.4),(4.45,.3,4.7),rubber,.22)
box('Back right thumb rest',(-4.65,2.05,5.5),(2.45,.7,3.7),rubber,.5)

# Exposed metal bayonet is also visible when lens separates in the animation.
ring('RF mount silver flange',-1.68,2.83,2.43,.25,silver,body)
ring('RF mount dark inner throat',-1.7,2.45,2.1,.4,black,body)
box('APS-C sensor',(.65,-1.53,4.25),(2.22,.04,1.48),glass,.035)
for a in [35,125,215,305]:
    t=math.radians(a);x=.65+2.64*cos(t);z=4.25+2.64*sin(t)
    cyl('Mount fastener',(x,-1.83,z),.105,.025,black,body)
    box('Screw slot',(x,-1.85,z),(.13,.02,.022),silver,.002)
for i in range(9):
    t=math.radians(242+i*5); cyl('Gold mount contact',(.65+2.22*cos(t),-1.88,4.25+2.22*sin(t)),.07,.035,gold,body)
box('Red RF alignment mark',(.65,-1.85,6.95),(.12,.07,.25),red,.025)
cyl('Lens release button',(3.9,-1.75,3.8),.23,.3,shell,body)

# Viewfinder, hot shoe, controls.
box('Viewfinder housing',(.3,.3,8.05),(3.35,3.8,1.75),shell,.42)
box('Hotshoe recessed base',(.3,.35,9.00),(1.9,1.8,.16),black,.06)
for x in [-.57,1.17]:box('Hotshoe metal rail',(x,.35,9.12),(.15,1.8,.15),silver,.035)
for i in range(5):cyl('Hotshoe contact',(-.25+i*.25,.65,9.12),.055,.07,gold,body,'Z')
cyl('Shutter button',(-4.85,-2.05,7.62),.55,.16,metal,body,'Z')
cyl('Shutter surround',(-4.85,-2.05,7.49),.65,.14,black,body,'Z')
cyl('Mode dial',(-3.25,.55,7.8),.84,.44,black,body,'Z')
for i in range(48):
    t=2*pi*i/48;box('Mode dial knurl',(-3.25+.82*cos(t),.55+.82*sin(t),7.8),(.075,.075,.36),shell,.02)
for i,txt in enumerate(['M','Av','Tv','P','A+','SCN','B','C1','C2']):
    t=2*pi*i/9;label('Mode engraving',txt,(-3.25+.6*cos(t),.55+.6*sin(t),8.035),.16,rot=(0,0,0))
for x,y,txt in [(-4.45,-.4,'ISO'),(-5.3,-.35,'M-Fn')]:
    cyl(txt+' button',(x,y,7.62),.24,.12,shell,body,'Z');label(txt+' text',txt,(x,y+.35,7.62),.16,rot=(0,0,0))
cyl('Record button',(-5.8,.5,7.48),.25,.13,black,body,'Z')
cyl('Record red dot',(-5.8,.5,7.56),.105,.018,red,body,'Z')
for x in [-6.65,6.4]:
    box('Strap lug',(x,.6,6.6),(.27,.72,.8),silver,.1)
    box('Strap lug hole',(x,.19,6.6),(.15,.08,.4),black,.035)

label('Canon wordmark','Canon',(.25,-1.67,8.07),.73)
label('EOS marking','EOS',(4.6,-1.64,6.6),.41)
label('R7 marking','R7',(4.6,-1.64,6.04),.46)
cyl('AF selector',(-2.52,-1.74,2.15),.36,.21,black,body)
box('AF selector lever',(-2.33,-1.92,1.95),(.16,.1,.5),shell,.06)
label('AF MF labels','MF\nAF',(-2.98,-1.85,2.18),.16)
cyl('Front lamp',(-2.8,-1.59,6.85),.15,.1,glass,body)

# Back: articulated screen, EVF eyecup, combined R7 dial / joystick.
box('LCD hinge',(4.95,2.16,3.8),(.5,.55,4.6),shell,.16)
box('Articulated LCD frame',(.75,2.2,3.75),(7.5,.48,4.75),black,.22)
box('LCD glass',(.75,2.455,3.82),(6.86,.035,3.99),screenmat,.08)
label('Rear Canon mark','Canon',(.75,2.5,1.62),.25,rot=(pi/2,0,pi))
box('EVF eyecup',(.4,2.35,7.4),(3.25,1,1.85),rubber,.48)
box('EVF opening',(.4,2.87,7.4),(2.12,.07,1.15),black,.25)
box('EVF glass',(.4,2.925,7.4),(1.4,.03,.83),glass,.15)
cyl('Rear quick control dial',(-3.0,2.52,6.8),.8,.22,black,body)
for i in range(40):
    t=2*pi*i/40;cyl('Rear dial tooth',(-3+.77*cos(t),2.65,6.8+.77*sin(t)),.06,.12,shell,body,verts=12)
cyl('Rear joystick',(-3,2.8,6.8),.31,.23,rubber,body)
for x,z,txt in [(-4.5,5.6,'AF-ON'),(-5.5,4.7,'Q'),(-3,4.8,'INFO'),(-3,2.1,'▶'),(-4.3,2.1,'DEL'),(4.4,6.6,'MENU')]:
    cyl(txt+' rear key',(x,2.42,z),.25,.2,shell,body)
    label(txt+' rear label',txt,(x,2.55,z-.42),.17,rot=(pi/2,0,pi))
cyl('Directional controller',(-3.65,2.44,3.48),.65,.24,black,body)
cyl('SET key',(-3.65,2.6,3.48),.28,.12,shell,body)
label('SET label','SET',(-3.65,2.69,3.48),.16,rot=(pi/2,0,pi))

# A representative compact zoom, modelled as separate mechanical rings.
# Lens model is an artistic reference, not a claim about the owner's actual lens.
ring('Lens bayonet',-2.03,2.65,2.18,.4,silver)
cyl('Rear lens barrel',(.65,-2.65,4.25),2.62,1.02)
ring('Rear barrel seam',-3.18,2.65,2.45,.08,black)
cyl('Main lens barrel',(.65,-4.1,4.25),2.79,1.85)
cyl('Rubber zoom ring',(.65,-4.05,4.25),2.86,1.35,rubber)
for i in range(112):
    t=2*pi*i/112
    o=box('Zoom ring fine rib',(.65+2.86*cos(t),-4.05,4.25+2.86*sin(t)),(.065,1.28,.095),rubber,.02,lens)
    o.rotation_euler[1]=pi/2-t
cyl('Front extension barrel',(.65,-5.65,4.25),2.61,1.36)
ring('Polished barrel edge',-5.17,2.65,2.54,.055,silver)
ring('Focus ring',-6.5,2.68,2.19,.58,rubber)
for i in range(100):
    t=2*pi*i/100
    o=box('Focus ring fine rib',(.65+2.68*cos(t),-6.5,4.25+2.68*sin(t)),(.045,.49,.07),shell,.015,lens)
    o.rotation_euler[1]=pi/2-t
ring('Front filter rim',-7.02,2.73,2.32,.45)
ring('Front bezel',-7.27,2.72,2.07,.16,black)
for i in range(5):ring('Internal optical baffle',-7.13+i*.14,2.2-i*.11,2.08-i*.11,.06,black)
bpy.ops.mesh.primitive_uv_sphere_add(segments=96,ring_count=48,location=(.65,-6.98,4.25))
optic=bpy.context.object;optic.scale=(1.97,.17,1.97)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
finish(optic,'Convex front optical glass',glass,lens)
cyl('Inner optical element',(.65,-6.5,4.25),1.48,.08,glass)
ring('Optical inner reflection',-6.75,1.38,1.33,.025,metal)
cyl('Aperture pupil',(.65,-6.78,4.25),.77,.025,black,verts=9)
for i,ch in enumerate('CANON ZOOM LENS'):
    t=math.radians(140-i*7.4)
    ob=label('Lens rim engraving',ch,(.65+2.44*cos(t),-7.363,4.25+2.44*sin(t)),.19,parent=lens)
    ob.rotation_mode='QUATERNION'
    ob.rotation_quaternion=Euler((pi/2,0,0)).to_quaternion() @ Quaternion((0,0,1),t-pi/2)
label('Lens lower engraving','RF-S 18–150mm',(.65,-7.365,1.83),.18,parent=lens)

# Non-rendering references packed into the file for continued manual modelling.
refs=bpy.data.collections.new('REFERENCES • source photographs');bpy.context.scene.collection.children.link(refs)
for filename,x in [('front-top.jpg',-18),('front-back.jpg',18)]:
    path=os.path.join(ROOT,'..','reference','canon-r7',filename)
    if os.path.exists(path):
        im=bpy.data.images.load(path);im.pack()
        ob=bpy.data.objects.new('Reference | '+filename,None);refs.objects.link(ob)
        ob.empty_display_type='IMAGE';ob.data=im;ob.empty_display_size=14
        ob.location=(x,5,6);ob.rotation_euler=(pi/2,0,0);ob.hide_render=True
refs.hide_viewport=True

# Assembly animation: lens moves onto the mount, then camera gently turns.
for frame,y in [(1,-5.5),(20,-5.5),(65,0),(120,0)]:
    lens.location.y=y;lens.keyframe_insert(data_path='location',frame=frame)
for frame,angle in [(1,-.16),(65,0),(120,.5)]:
    assembly.rotation_euler.z=angle;assembly.keyframe_insert(data_path='rotation_euler',frame=frame)
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=120;scene.frame_set(65)
scene.render.fps=30
for f,n in [(1,'EXPLODED'),(20,'ASSEMBLY START'),(65,'ASSEMBLED'),(120,'HERO TURN')]:scene.timeline_markers.new(n,frame=f)

floor=material('Studio | warm ivory',(.48,.455,.41),.7)
box('Studio floor',(0,0,.05),(200,200,.2),floor,.04,None)
world=bpy.data.worlds.new('Soft neutral studio');scene.world=world;world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs[0].default_value=(.4,.44,.5,1)
bg.inputs[1].default_value=.35

def point(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,color,target=(0,-1,4)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;point(o,target)
area('Key | large softbox',(-10,-12,20),2600,12,(1,.91,.8))
area('Rim | cool strip',(9,6,15),3200,9,(.77,.85,1))
area('Front | lens reflection',(2,-16,10),1100,6,(.86,.94,1))
area('Left edge',(-12,4,8),1800,7,(1,.95,.87))
bpy.ops.object.camera_add(location=(17,-28,15));cam=bpy.context.object;cam.name='Camera | three quarter hero';point(cam,(0,-1.5,4.3))
cam.data.type='ORTHO';cam.data.ortho_scale=21;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1050;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
scene.render.filepath=os.path.join(ROOT,'camera-hero.png')
scene['Notes']='Editable EOS R7-inspired model built from front/top/rear photographs. Approximate geometry; representative 18–150 zoom. Frames 1–120: lens assembly and hero turn. References packed in hidden collection.'
bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=assembly;assembly.select_set(True)
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.region_3d.view_perspective='CAMERA'
            a.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'canon-r7-studio.blend'))
bpy.ops.render.render(write_still=True)
