"""Rebuild the editable EOS R8-inspired studio scene. Run with Blender --background --python."""
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
        tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=165
        tex.inputs['Detail'].default_value=3
        bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=noise
        bump.inputs['Distance'].default_value=.045
        l.new(tex.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs['Normal'],p.inputs['Normal'])
    return m

shell=material('Body | satin black magnesium',(.015,.017,.019),.39,.12,.1)
rubber=material('Grip | fine pebbled rubber',(.013,.014,.016),.52,0,.4)
black=material('Recesses | deep black',(.004,.006,.008),.5)
metal=material('Machined anodised lens barrel',(.022,.027,.033),.26,.7)
silver=material('Brushed mount alloy',(.48,.52,.57),.24,.85)
white=material('Warm white engravings',(.86,.88,.87),.42)
red=material('Alignment and recording red',(.55,.013,.015),.29)
gold=material('Electrical contacts',(.7,.42,.1),.24,.8)
glass=material('Optical glass | blue green coating',(.8,.89,.9),.025,0)
gp=glass.node_tree.nodes.get('Principled BSDF')
gp.inputs['Transmission Weight'].default_value=1
gp.inputs['IOR'].default_value=1.46
gp.inputs['Coat Weight'].default_value=.22
gp.inputs['Coat Roughness'].default_value=.035
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
o=bpy.data.objects.new('R8 | sculpted main housing',mesh);bpy.context.collection.objects.link(o);finish(o,o.name,shell,body,.3)

# Deep ergonomic right hand grip (left in front view).
grip=box('Deep ergonomic hand grip',(-4.9,-1.5,3.9),(3.2,4.4,6.55),rubber,.7)
box('Grip upper shoulder',(-4.8,-1.55,6.9),(3.25,4.15,1.2),shell,.5)
box('Bottom plate',(0,.1,.8),(12.35,3.1,.5),black,.16)
box('Front leatherette panel',(3.9,-1.48,3.4),(4.45,.3,4.7),rubber,.22)
box('Back right thumb rest',(-4.65,2.05,5.5),(2.45,.7,3.7),rubber,.5)

# Exposed metal bayonet is also visible when lens separates in the animation.
ring('RF mount silver flange',-1.68,2.83,2.43,.25,silver,body)
ring('RF mount dark inner throat',-1.7,2.45,2.1,.4,black,body)
box('Full frame sensor',(.65,-1.53,4.25),(3.6,.04,2.4),glass,.035)
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
label('R8 marking','R8',(4.6,-1.64,6.04),.46)
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
label('Lens lower engraving','CANON  RF',(.65,-7.365,1.83),.18,parent=lens)

# R8 refinements and choreography
def remove_prefix(prefix):
    for ob in list(bpy.data.objects):
        if ob.name.startswith(prefix):bpy.data.objects.remove(ob,do_unlink=True)

def profile(name,points,front,back,mat,parent=body,bevel=.15):
    n=len(points);vs=[(x,y,z) for y in [front,back] for x,z in points]
    fs=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    fs.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
    return finish(ob,name,mat,parent,bevel)

# R8 has a lower, sloped viewfinder and rounded grip, without the R7 joystick.
for prefix in ['R8 |','Deep ergonomic','Grip upper','Front leatherette','Viewfinder housing','Rear quick','Rear dial tooth','Rear joystick','AF selector','AF MF','Front lamp']:
    remove_prefix(prefix)
outline=[(-6.15,.7),(-6.55,1.05),(-6.55,6.1),(-6.25,6.85),(-5.6,7.1),(-2.45,7.15),(-1.65,7.48),(-1.15,8.25),(-.8,8.55),(1.4,8.55),(1.82,8.15),(2.4,7.42),(3.1,7.16),(5.65,6.85),(6.35,6.4),(6.45,1.1),(6.05,.7)]
profile('R8 | shallow contoured housing',outline,-1.23,1.8,shell,bevel=.24)
panel=[(-3.9,.85),(-3.9,5.95),(-3.45,6.17),(-2.6,6.13),(-1.85,5.7),(2.65,5.7),(3.7,6.02),(5.75,5.75),(6.05,5.2),(6.05,1.1),(5.85,.85)]
profile('R8 | fitted front leatherette',panel,-1.49,-1.23,rubber,bevel=.16)
profile('R8 | sloping viewfinder',[(-1.67,7.15),(-1.22,8.3),(-.85,8.61),(1.4,8.61),(1.86,8.05),(2.05,7.15)],-1.45,1.45,shell,bevel=.18)

# Smooth lofted grip with a curved palm and narrowing shoulder.
verts=[];faces=[];N=64
levels=[(.78,.82),(1,.96),(1.4,1),(3.8,1),(5.4,.99),(6.0,.97),(6.7,.87),(7.15,.70),(7.35,.50)]
for z,scale in levels:
    for i in range(N):
        t=2*pi*i/N
        x=-4.9+1.63*scale*math.copysign(abs(cos(t))**.65,cos(t))
        y=-.75+2.42*scale*math.copysign(abs(sin(t))**.65,sin(t))
        verts.append((x,y,z))
for j in range(len(levels)-1):
    for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
faces.extend([tuple(reversed(range(N))),tuple(range((len(levels)-1)*N,len(levels)*N))])
mesh=bpy.data.meshes.new('Rounded grip loft');mesh.from_pydata(verts,[],faces);mesh.update()
ob=bpy.data.objects.new('R8 | rounded hand grip',mesh);bpy.context.collection.objects.link(ob)
finish(ob,ob.name,rubber,body)
ob.data.materials.append(shell)
for poly in ob.data.polygons:
    if poly.center.z>5.95:poly.material_index=1
sub=ob.modifiers.new('Smooth grip transitions','SUBSURF');sub.levels=2;sub.render_levels=2
for name in ['Shutter button','Shutter surround']:
    ob=bpy.data.objects.get(name);ob.location.z-=.4;ob.rotation_euler.x=.3
for ob in list(bpy.data.objects):
    if ob.name.startswith(('Hotshoe','Hotshoe metal','Hotshoe contact')):ob.location.z-=.48
logo=bpy.data.objects['Canon wordmark'];logo.location=(.22,-1.645,7.82);logo.data.size=.65
logo.data.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
logo.data.shear=.1
bpy.data.objects['EOS marking'].location=(4.62,-1.52,6.46)
bpy.data.objects['R8 marking'].location=(4.65,-1.72,5.76)
bpy.data.objects['R8 marking'].data.size=.36
box('R8 badge inset',(4.65,-1.57,5.76),(.78,.18,.61),black,.07)
for ob in bpy.data.objects:
    if ob.name.startswith(('Mode dial','Mode engraving')):ob.location.z-=.35
cyl('Still movie selector',(4.5,.15,7.05),.49,.15,metal,body,'Z')
box('Still movie selector index',(4.5,-.05,7.15),(.06,.3,.03),white,.005)
cyl('Power lock dial',(-5.4,1,7.22),.52,.16,metal,body,'Z')
label('Power labels','OFF  LOCK  ON',(-5.2,.8,7.35),.14,rot=(0,0,0))
box('Side port cover',(6.46,.3,3.9),(.15,2.1,3.6),rubber,.16)
for z in [2.7,3.8,4.9]:box('Port flap seam',(6.55,.3,z),(.02,1.75,.035),black,.006)

# Clear optical layers backed by a dark pupil, with coated inner rings.
for prefix in ['Front extension barrel','Main lens barrel','Rear lens barrel','Inner optical element','Aperture pupil','Optical inner reflection']:
    remove_prefix(prefix)
ring('Rear lens barrel',-2.65,2.62,2.02,1.02)
ring('Main lens barrel',-4.1,2.79,2.02,1.85)
ring('Front extension barrel',-5.65,2.61,2.02,1.36)
remove_prefix('Rubber zoom ring');ring('Rubber zoom ring',-4.05,2.86,2.05,1.35,rubber)
coated=material('Optical coating | violet green',(.052,.085,.09),.12,.7)
for i in range(3):
    ring('Optical coated edge',-6.50+i*.24,1.90-i*.13,1.86-i*.13,.035,coated)
cyl('Deep aperture pupil',(.65,-5.7,4.25),1.48,.03,black,verts=11)
ring('Iris diaphragm',-5.87,1.7,.77,.035,black)
# Fine white focal marks and switch plates make the barrel read at close range.
for i,txt in enumerate(['24','35','50','70']):
    t=math.radians(70+i*12)
    ob=label('Zoom scale',txt,(.65+2.81*cos(t),-3.3,4.25+2.81*sin(t)),.16,parent=lens)
box('Lens switch panel',(3.37,-2.65,4.7),(.12,.65,.78),black,.08,lens)
box('Lens AF switch',(3.46,-2.65,4.7),(.09,.28,.24),shell,.035,lens)

# Exploded assembly groups, all transforms return precisely to their rest pose.
def regroup(name,objects,pivot):
    g=group(name);g.parent=assembly;g.location=pivot
    for ob in objects:
        local=ob.location.copy();ob.parent=g;ob.location=local-Vector(pivot)
    return g
body_objects=list(body.children)
mount=regroup('03 • RF bayonet', [o for o in body_objects if o.name.startswith(('RF mount','Mount fastener','Screw slot','Gold mount','Red RF'))],(.65,-1.7,4.25))
display=regroup('04 • Articulating screen',[o for o in body_objects if o.name.startswith(('LCD','Articulated LCD','Rear Canon'))],(4.9,2.2,3.75))
roof=regroup('05 • Viewfinder module',[o for o in body_objects if o.name.startswith(('R8 | sloping','Canon wordmark','Hotshoe','EVF'))],(.3,0,7.8))
lens_objects=list(lens.children)
front=regroup('06 • Front optical cell',[o for o in lens_objects if o.name.startswith(('Front filter','Front bezel','Convex','Lens rim','Lens lower','Focus ring','Optical coated','Internal optical'))],(.65,-6.8,4.25))
zoom=regroup('07 • Zoom mechanics',[o for o in lens_objects if o.name.startswith(('Main lens','Rubber zoom','Zoom ring','Front extension','Polished barrel','Zoom scale'))],(.65,-4.2,4.25))

def animate(g,offset,rotation,start,end):
    rest=g.location.copy()
    for frame,k in [(1,1),(start,1),(end,0),(160,0)]:
        g.location=rest+Vector(offset)*k;g.rotation_euler=tuple(v*k for v in rotation)
        g.keyframe_insert(data_path='location',frame=frame);g.keyframe_insert(data_path='rotation_euler',frame=frame)
animate(body,(1.1,1.5,-.65),(0,0,-.14),10,54)
animate(roof,(0,.2,3.5),(0,.18,-.2),22,66)
animate(display,(5,3,.7),(0,0,-.8),28,75)
animate(mount,(0,-3,1.2),(0,0,.4),40,86)
animate(lens,(-1,-5.3,-.6),(0,0,-.2),56,104)
animate(zoom,(-.3,-5.2,.4),(0,0,.3),66,112)
animate(front,(-1,-7.5,1.1),(0,0,-.4),78,124)
for frame,angles in [(1,(.02,-.08,-.5)),(60,(0,.03,-.22)),(124,(0,0,.16)),(160,(0,0,.5))]:
    assembly.rotation_euler=angles;assembly.keyframe_insert(data_path='rotation_euler',frame=frame)
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=160;scene.frame_set(124);scene.render.fps=30
for f,n in [(1,'EXPLODED'),(54,'BODY'),(86,'MOUNT'),(124,'ASSEMBLED'),(160,'HERO')]:scene.timeline_markers.new(n,frame=f)
refs=bpy.data.collections.new('REFERENCES • EOS R8');scene.collection.children.link(refs)
im=bpy.data.images.load(os.path.join(ROOT,'../reference/canon-r8/views.jpg'));im.pack()
ref=bpy.data.objects.new('EOS R8 reference views',None);refs.objects.link(ref)
ref.empty_display_type='IMAGE';ref.data=im;ref.empty_display_size=16;ref.location=(20,0,5);ref.hide_render=True;refs.hide_viewport=True

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
scene.render.engine='CYCLES';scene.cycles.samples=96;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
scene.render.filepath=os.path.join(ROOT,'r8-hero.png')
scene['Notes']='EOS R8-inspired artistic model from reference photographs, with representative unconfirmed RF zoom. Seven assembly groups, 160 animation frames. Not manufacturer CAD.'
bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=assembly;assembly.select_set(True)
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.region_3d.view_perspective='CAMERA'
            a.spaces.active.shading.type='MATERIAL'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'canon-r8-studio.blend'))
if os.getenv('R8_SKIP_HERO') != '1': bpy.ops.render.render(write_still=True)
