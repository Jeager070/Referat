import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Holographic shading uses a single render pass. Visible scenes animate at 30fps.
export function createGlassScene(host, initial, onContextLost) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0,0);
  const canvas=renderer.domElement;
  canvas.className='glass-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(33,1,.1,40);
  camera.position.set(0,1.45,8);camera.lookAt(0,0,0);
  const root=new THREE.Group();scene.add(root);
  const geometries=new Set(),materials=new Set();
  const geo=g=>{geometries.add(g);return g;},mat=m=>{materials.add(m);return m;};
  const cubeGeometry=geo(new RoundedBoxGeometry(1.12,1.12,1.12,2,.035));
  const layerGeometry=geo(new RoundedBoxGeometry(2.28,.73,2.28,2,.03));
  const cubeEdges=geo(new THREE.EdgesGeometry(geo(new THREE.BoxGeometry(1.1,1.1,1.1))));
  const layerEdges=geo(new THREE.EdgesGeometry(geo(new THREE.BoxGeometry(2.26,.71,2.26))));
  function block(geometry,edgesGeometry,color){
    const group=new THREE.Group();
    const shell=new THREE.Mesh(geometry,mat(new THREE.ShaderMaterial({
      uniforms:{tint:{value:new THREE.Color(color)},alpha:{value:1},time:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      vertexShader:'varying vec3 n; varying vec3 v; varying vec3 local; void main(){local=position;vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=-p.xyz;gl_Position=projectionMatrix*p;}',
      fragmentShader:`uniform vec3 tint;uniform float alpha;uniform float time;varying vec3 n;varying vec3 v;varying vec3 local;
        void main(){float fresnel=pow(1.0-abs(dot(normalize(n),normalize(v))),2.2);
        float scan=pow(max(0.0,sin(local.y*100.0-time*2.5)),14.0);
        float beam=exp(-pow((local.y+0.72-mod(time*0.27,1.44))*21.0,2.0));
        float strength=0.025+fresnel*0.23+scan*0.065+beam*0.23;
        gl_FragColor=vec4(mix(tint,vec3(0.9,1.0,1.0),beam*0.3),strength*alpha);}`,
    })));
    const edges=new THREE.LineSegments(edgesGeometry,mat(new THREE.LineBasicMaterial({color,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})));
    const core=new THREE.Mesh(geometry,mat(new THREE.MeshBasicMaterial({color,transparent:true,opacity:.025,depthWrite:false})));
    core.scale.setScalar(.7);group.add(shell,edges,core);
    group.userData={shell,edges,core,alpha:1};root.add(group);return group;
  }
  const modules=[0x68dbff,0x9fb5ff,0x68e9ee,0xa79aff].map(c=>block(cubeGeometry,cubeEdges,c));
  const layers=[0x8bdfff,0x72c8ff,0x849dff].map(c=>block(layerGeometry,layerEdges,c));
  const linksMaterial=mat(new THREE.LineBasicMaterial({color:0x94e5ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  const linksGeometry=geo(new THREE.BufferGeometry().setFromPoints(Array.from({length:8},()=>new THREE.Vector3())));
  root.add(new THREE.LineSegments(linksGeometry,linksMaterial));
  const cageMaterial=mat(new THREE.LineBasicMaterial({color:0xabc8ff,transparent:true,opacity:0,depthWrite:false}));
  root.add(new THREE.LineSegments(geo(new THREE.EdgesGeometry(geo(new THREE.BoxGeometry(3.8,3.6,2)))),cageMaterial));

  const seeds=Array.from({length:65},(_,i)=>({x:Math.sin(i*127.1)*3.3,y:Math.cos(i*311.7)*2.2,z:Math.sin(i*74.7)*1.4,speed:.04+(i%7)*.013}));
  const dustGeometry=geo(new THREE.BufferGeometry());
  dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(seeds.length*3),3));
  const dustMaterial=mat(new THREE.PointsMaterial({color:0x91d9ff,size:.023,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));
  scene.add(new THREE.Points(dustGeometry,dustMaterial));
  const labels=[...host.querySelectorAll('.module-label')],layerLabels=[...host.querySelectorAll('.layer-label')];
  const projected=new THREE.Vector3();
  let state=initial,frame=0,started=performance.now(),lastTick=0,motionTime=0,width=1,height=1;
  let disposed=false,visible=true,contextLost=false,pointerX=0,currentX=0;
  let from,target;
  const mix=THREE.MathUtils.lerp,ease=t=>1-Math.pow(1-t,4);
  function pose({mode,opened}){
    const mono=mode==='monolith',packed=mode==='partition',gap=packed?.58:.95;
    return {modules:modules.map((_,i)=>({x:(i%2?1:-1)*gap,y:(i<2?1:-1)*gap,z:0,alpha:mono?0:1,scale:mono?.76:1})),
      layers:layers.map((_,i)=>({x:0,y:(1-i)*(opened?1.05:.745),z:0,alpha:mono?1:0,scale:mono?1:.78})),
      links:['connected','deployment'].includes(mode)?.8:0,cage:mode==='deployment'?.35:0};
  }
  function readPose(){const read=g=>({x:g.position.x,y:g.position.y,z:g.position.z,alpha:g.userData.alpha,scale:g.scale.x});return {modules:modules.map(read),layers:layers.map(read),links:linksMaterial.opacity,cage:cageMaterial.opacity};}
  target=pose(state);from={...target,modules:target.modules.map(p=>({...p,y:p.y-.2,scale:p.scale*.9})),layers:target.layers.map(p=>({...p,y:p.y-.2,scale:p.scale*.9}))};
  function setBlock(g,a,b,t){
    g.position.set(mix(a.x,b.x,t),mix(a.y,b.y,t),mix(a.z,b.z,t));g.scale.setScalar(mix(a.scale,b.scale,t));
    const alpha=mix(a.alpha,b.alpha,t);g.userData.alpha=alpha;g.visible=alpha>.005;
    g.userData.shell.material.uniforms.alpha.value=alpha;g.userData.shell.material.uniforms.time.value=motionTime;
    g.userData.edges.material.opacity=alpha*(.72+Math.sin(motionTime*.9)*.12);g.userData.core.material.opacity=.025*alpha;
  }
  function placeLabel(label,group,z,alpha){
    // Labels follow the center, remaining readable during a full cube rotation.
    projected.copy(group.position);root.localToWorld(projected);projected.z+=z;projected.project(camera);
    label.style.transform=`translate(-50%,-50%) translate(${(projected.x*.5+.5)*width}px,${(-projected.y*.5+.5)*height}px)`;label.style.opacity=String(alpha);
  }
  function draw(now){
    frame=0;
    if(disposed || contextLost || !visible || !state.active || document.hidden){host.dataset.animating='false';lastTick=0;return;}
    if(state.animated && lastTick && now-lastTick<1000/30){frame=requestAnimationFrame(draw);return;}
    const dt=lastTick?Math.min((now-lastTick)/1000,.1):1/30;lastTick=now;
    if(state.animated)motionTime+=dt;
    const elapsed=now-started;
    modules.forEach((g,i)=>setBlock(g,from.modules[i],target.modules[i],state.animated?ease(Math.min(1,Math.max(0,(elapsed-i*70)/1100))):1));
    layers.forEach((g,i)=>setBlock(g,from.layers[i],target.layers[i],state.animated?ease(Math.min(1,Math.max(0,(elapsed-i*40)/1000))):1));
    const t=state.animated?ease(Math.min(1,elapsed/1400)):1;
    currentX=mix(currentX,pointerX,.12);
    const mono=state.mode==='monolith',packed=state.mode==='partition';
    const desired=mono?motionTime*.36+.35:packed?.32:0;
    const angle=Math.atan2(Math.sin(desired-root.rotation.y),Math.cos(desired-root.rotation.y));
    if(state.animated)root.rotation.y+=angle*Math.min(1,dt*5);
    else if(elapsed<100)root.rotation.y=desired;
    root.rotation.x=0;root.rotation.z=0;
    root.position.y=Math.sin(motionTime*.8)*.06;
    modules.forEach((g,i)=>{
      const rotation=mono||packed?0:motionTime*.48+i*.2+currentX;
      const difference=Math.atan2(Math.sin(rotation-g.rotation.y),Math.cos(rotation-g.rotation.y));
      if(state.animated)g.rotation.y+=difference*Math.min(1,dt*5);
      g.rotation.x=0;g.rotation.z=0;
      if(!packed)g.position.y+=Math.sin(motionTime*.9+i*1.7)*.045;
    });
    linksMaterial.opacity=mix(from.links,target.links,t);cageMaterial.opacity=mix(from.cage,target.cage,t);
    const positions=linksGeometry.attributes.position;
    [[0,1],[0,2],[1,3],[2,3]].forEach(([a,b],i)=>{const start=modules[a].position,end=modules[b].position;const inset=Math.min(.76/start.distanceTo(end),.48);positions.setXYZ(i*2,mix(start.x,end.x,inset),mix(start.y,end.y,inset),0);positions.setXYZ(i*2+1,mix(end.x,start.x,inset),mix(end.y,start.y,inset),0);});positions.needsUpdate=true;
    const dust=dustGeometry.attributes.position;
    seeds.forEach((p,i)=>dust.setXYZ(i,p.x+Math.sin(motionTime*.13+i)*.1,((p.y+2.2+motionTime*p.speed)%4.4)-2.2,p.z));dust.needsUpdate=true;
    scene.updateMatrixWorld();
    modules.forEach((g,i)=>placeLabel(labels[i],g,.72,g.userData.alpha));
    layers.forEach((g,i)=>placeLabel(layerLabels[i],g,1.1,state.opened&&mono?g.userData.alpha:0));
    renderer.render(scene,camera);
    host.dataset.frames=String(renderer.info.render.frame);host.dataset.rotation=root.rotation.y.toFixed(4);host.dataset.moduleRotation=modules[0].rotation.y.toFixed(4);host.dataset.particleTime=motionTime.toFixed(3);host.dataset.animating=String(state.animated);
    if(state.animated)frame=requestAnimationFrame(draw);
  }
  function request(){if(!frame&&!disposed&&!contextLost&&visible&&state.active&&!document.hidden)frame=requestAnimationFrame(draw);}
  function update(next){
    if(next.mode!==state.mode || next.opened!==state.opened){from=readPose();target=pose(next);started=performance.now();}
    state=next;cancelAnimationFrame(frame);frame=0;lastTick=0;host.dataset.animating='false';request();
  }
  function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=camera.aspect<1.05?9.2:8;camera.updateProjectionMatrix();request();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else{cancelAnimationFrame(frame);frame=0;lastTick=0;host.dataset.animating='false';}});intersection.observe(host);
  const pointer=event=>{if(!state.animated||event.pointerType==='touch')return;const rect=host.getBoundingClientRect();pointerX=((event.clientX-rect.left)/rect.width-.5)*.2;};
  const leave=()=>{pointerX=0;};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTick=0;host.dataset.animating='false';}else request();};
  const lost=event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;host.dataset.animating='false';onContextLost();};
  host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);
  resize();
  return {update,dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
