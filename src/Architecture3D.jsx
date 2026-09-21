import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function makeTexture(paint, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paint(canvas.getContext('2d'), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function labelTexture(name, index, ink = '#effaff', glow = '#00c8ff') {
  return makeTexture((ctx, size) => {
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 10;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = glow; ctx.shadowBlur = 12;
    ctx.beginPath();
    if (index === 0) {ctx.arc(256,165,38,0,Math.PI*2);ctx.moveTo(183,277);ctx.bezierCurveTo(183,206,329,206,329,277);ctx.lineTo(183,277);}
    else if (index === 1) {ctx.moveTo(161,135);ctx.lineTo(187,135);ctx.lineTo(213,240);ctx.lineTo(308,240);ctx.lineTo(336,160);ctx.lineTo(195,160);ctx.moveTo(231,278);ctx.arc(220,278,11,0,Math.PI*2);ctx.moveTo(309,278);ctx.arc(298,278,11,0,Math.PI*2);}
    else if (index === 2) {ctx.roundRect(184,126,144,164,12);ctx.moveTo(219,173);ctx.lineTo(292,173);ctx.moveTo(219,208);ctx.lineTo(292,208);ctx.moveTo(219,244);ctx.lineTo(270,244);}
    else {ctx.roundRect(159,150,192,132,16);ctx.moveTo(162,190);ctx.lineTo(348,190);ctx.moveTo(187,248);ctx.lineTo(226,248);}
    ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=ink;ctx.globalAlpha=.14;ctx.roundRect(92,342,328,82,18);ctx.fill();ctx.globalAlpha=1;ctx.fillRect(132,330,248,5);ctx.fillStyle=ink;ctx.font='700 53px Arial';ctx.textAlign='center';ctx.shadowColor=glow;ctx.shadowBlur=8;ctx.fillText(name.toUpperCase(),size/2,405);
  });
}

export default function Architecture3D({ modular, opened, children }) {
  const host = useRef(null);
  const mode = useRef({ modular, opened });
  const [ready, setReady] = useState(false);
  useEffect(() => { mode.current = { modular, opened }; }, [modular, opened]);

  useEffect(() => {
    const mount = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
    renderer.setClearColor(0x000000,0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.transmissionResolutionScale = .5;
    mount.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35,1,.1,50);
    camera.position.set(3.4,2.7,6.9);camera.lookAt(0,0,0);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmrem.fromScene(environment,.04);
    scene.environment = environmentTarget.texture;
    environment.dispose();pmrem.dispose();
    scene.add(new THREE.AmbientLight(0x6b86aa,1.35));
    const key = new THREE.DirectionalLight(0xf2f7ff,5.5);key.position.set(-4,6,4);scene.add(key);
    const cyan = new THREE.PointLight(0x00cfff,42);cyan.position.set(3,1.5,2.5);scene.add(cyan);
    const ember = new THREE.PointLight(0xff5b18,34);ember.position.set(-3,0,2);scene.add(ember);
    const group = new THREE.Group();scene.add(group);
    const geometry = new RoundedBoxGeometry(1,1,1,4,.035);
    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(.985,.985,.985));
    const textures = [];
    let seed=47;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    const stone = makeTexture((ctx,size)=>{
      const pixels=ctx.createImageData(size,size);
      for(let i=0;i<pixels.data.length;i+=4){const grain=15+random()*30;pixels.data[i]=grain*.72;pixels.data[i+1]=grain*.82;pixels.data[i+2]=grain*1.04;pixels.data[i+3]=255;}
      ctx.putImageData(pixels,0,0);
      for(let i=0;i<85;i++){ctx.strokeStyle=`rgba(0,0,0,${.1+random()*.4})`;ctx.lineWidth=2+random()*5;ctx.beginPath();let x=random()*size,y=random()*size;ctx.moveTo(x,y);for(let j=0;j<5;j++){x+=(random()-.5)*90;y+=random()*45;ctx.lineTo(x,y)}ctx.stroke();}
    });
    const cracks=makeTexture((ctx,size)=>{ctx.fillStyle='#000';ctx.fillRect(0,0,size,size);for(let i=0;i<12;i++){ctx.strokeStyle=i%3===0?'#ffbd50':'#8c390b';ctx.lineWidth=.8;ctx.shadowColor='#ff6100';ctx.shadowBlur=3;ctx.beginPath();let x=random()*size,y=random()*size;ctx.moveTo(x,y);for(let j=0;j<7;j++){x+=(random()-.5)*60;y+=random()*30;ctx.lineTo(x,y)}ctx.stroke();}});
    textures.push(stone,cracks);
    const stoneMaterial=new THREE.MeshStandardMaterial({map:stone,bumpMap:stone,bumpScale:.18,color:0x222b39,roughness:.3,metalness:.88,emissive:0x7d3218,emissiveMap:cracks,emissiveIntensity:1.15,envMapIntensity:2.2});
    const glassMaterial=new THREE.MeshPhysicalMaterial({color:0xd9f7ff,metalness:.18,roughness:.14,transmission:.34,thickness:.68,ior:1.46,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.8,emissive:0x0a6f9d,emissiveIntensity:.16});
    const labels=['Users','Products','Orders','Payments'].map((name,index)=>labelTexture(name,index,'#075b86','#48dfff'));
    const layerLabels=['Frontend','Logik','Daten'].map(labelTexture);textures.push(...labels,...layerLabels);
    const planeGeometry=new THREE.PlaneGeometry(1,1);
    const pieces=Array.from({length:4},(_,i)=>{
      const wrapper=new THREE.Group();group.add(wrapper);
      const mesh=new THREE.Mesh(geometry,stoneMaterial);wrapper.add(mesh);
      const edges=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:0xffc477,transparent:true,opacity:.82}));wrapper.add(edges);
      const decal=new THREE.Mesh(planeGeometry,new THREE.MeshBasicMaterial({map:labels[i],transparent:true,depthWrite:false,opacity:0,toneMapped:false}));decal.position.z=.507;wrapper.add(decal);
      const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.12,1),new THREE.MeshBasicMaterial({color:0x5adfff,transparent:true,opacity:.35,wireframe:true}));wrapper.add(core);
      wrapper.position.set(0,(1-i)*.64,0);wrapper.scale.setScalar(.02);
      return {wrapper,mesh,edges,decal,core};
    });
    const glowTexture=makeTexture((ctx,size)=>{const gradient=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);gradient.addColorStop(0,'#ffffff99');gradient.addColorStop(.25,'#ffffff50');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);});textures.push(glowTexture);
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(5.6,5.6),new THREE.MeshBasicMaterial({map:glowTexture,color:0xff7d21,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));glow.rotation.x=-Math.PI/2;glow.position.y=-1.6;scene.add(glow);
    const shockwave=new THREE.Mesh(new THREE.TorusGeometry(1.1,.018,8,96),new THREE.MeshBasicMaterial({color:0xffb45c,transparent:true,opacity:0,blending:THREE.AdditiveBlending}));shockwave.rotation.x=Math.PI/2;shockwave.position.y=-1.52;scene.add(shockwave);
    const moteGeometry=new THREE.BufferGeometry();const moteData=new Float32Array(48*3);
    for(let i=0;i<48;i++){moteData[i*3]=(random()-.5)*5;moteData[i*3+1]=(random()-.5)*3;moteData[i*3+2]=(random()-.5)*3;}
    moteGeometry.setAttribute('position',new THREE.BufferAttribute(moteData,3));
    const motes=new THREE.Points(moteGeometry,new THREE.PointsMaterial({size:.018,color:0xffb55d,transparent:true,opacity:.6,depthWrite:false}));scene.add(motes);
    const reduced={matches:false};
    const pointer={x:0,y:0};
    const move=e=>{if(reduced.matches)return;const rect=mount.getBoundingClientRect();pointer.x=(e.clientX-rect.left)/rect.width-.5;pointer.y=(e.clientY-rect.top)/rect.height-.5;};
    const leave=()=>{pointer.x=pointer.y=0;};
    mount.addEventListener('pointermove',move);mount.addEventListener('pointerleave',leave);
    const resize=()=>{const {width,height}=mount.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/Math.max(height,1);camera.position.set(3.4,2.7,6.9);if(camera.aspect<1.1)camera.position.multiplyScalar(1.15);camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(mount);resize();
    const colorA=new THREE.Color(0xffb34f),colorB=new THREE.Color(0x69e8ff),glassBase=new THREE.Color(0xd9f7ff),highlight=new THREE.Color(0xffffff),color=new THREE.Color();
    const position=new THREE.Vector3(),scale=new THREE.Vector3();
    let last=0,blend=modular?1:0,first=true,previousMode='',transition=0;
    const contextLost=e=>{e.preventDefault();setReady(false);renderer.setAnimationLoop(null);};
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    renderer.setAnimationLoop(time=>{
      if(document.hidden||mount.closest('.reveal[aria-hidden="true"]')){last=time;return;}
      const {modular:split,opened:open}=mode.current;
      const stateKey=`${split}-${open}-${mount.clientWidth}-${mount.clientHeight}`;
      const modeChanged=previousMode!==stateKey;
      if(reduced.matches&&!first&&!modeChanged)return;
      if(modeChanged)transition=0;
      previousMode=stateKey;
      const dt=Math.min((time-last)/1000,.05);last=time;
      const t=reduced.matches?0:time*.001;
      const damping=reduced.matches?1:1-Math.exp(-dt*5);
      transition=Math.min(1,transition+dt*1.8);
      blend=THREE.MathUtils.lerp(blend,split?1:0,damping);
      color.copy(colorA).lerp(colorB,blend);
      const cinematic=1-Math.pow(1-transition,3);
      group.rotation.y=THREE.MathUtils.lerp(group.rotation.y,pointer.x*.45+Math.sin(t*.46)*.2+(split?.16:-.12)*(1-cinematic),damping);
      group.rotation.x=THREE.MathUtils.lerp(group.rotation.x,pointer.y*.18+Math.sin(t*.33)*.035+(open&&!split?.07:0),damping);
      group.position.y=Math.sin(t*.8)*.05+(1-cinematic)*.12;
      const cameraZoom=(split?-.22:open?.15:0)+(1-cinematic)*.42;
      camera.position.x=THREE.MathUtils.lerp(camera.position.x,3.4+pointer.x*.18,damping);
      camera.position.y=THREE.MathUtils.lerp(camera.position.y,2.7-pointer.y*.12,damping);
      camera.position.z=THREE.MathUtils.lerp(camera.position.z,6.9+cameraZoom,damping);
      camera.lookAt(0,0,0);
      pieces.forEach(({wrapper,mesh,edges,decal,core},i)=>{
        if(split){position.set(i%2===0?-.64:.64,i<2?.64:-.64,i%2===0?.08:-.08);scale.setScalar(.99);}
        else {position.set(0,(1-i)*(open?1.03:.64),0);scale.set(1.95,i===3?.001:.64,1.95);}
        wrapper.position.lerp(position,damping);wrapper.scale.lerp(scale,damping);wrapper.rotation.z=THREE.MathUtils.lerp(wrapper.rotation.z,split?Math.sin(t*.45+i)*.025:0,damping);
        wrapper.rotation.x=THREE.MathUtils.lerp(wrapper.rotation.x,split?Math.cos(t*.35+i)*.018:0,damping);wrapper.visible=i<3||blend>.005;
        mesh.material=blend>.45?glassMaterial:stoneMaterial;
        if(blend>.45)glassMaterial.color.copy(glassBase).lerp(highlight,.08);
        edges.material.color.copy(color);edges.material.opacity=.42+blend*.5+Math.sin(t*2.2+i)*.08;
        const nextLabel=split?labels[i]:layerLabels[Math.min(i,2)];
        if(decal.material.map!==nextLabel){decal.material.map=nextLabel;decal.material.needsUpdate=true;}
        decal.material.opacity=THREE.MathUtils.lerp(decal.material.opacity,split||open?1:0,damping);
        decal.scale.set(split?.94:.55,split?.94:1.35,1);
        core.visible=split;core.rotation.set(t*.2,t*.3,0);core.material.opacity=.12;
      });
      glow.material.color.copy(color);glow.material.opacity=.35+Math.sin(t*.9)*.035;
      const pulse=Math.max(0,1-transition);
      shockwave.material.color.copy(color);shockwave.material.opacity=pulse*.85;shockwave.scale.setScalar(1+pulse*2.8);
      motes.material.color.copy(color);motes.rotation.y=t*.025;
      if(!reduced.matches){for(let i=0;i<48;i++){moteData[i*3+1]+=dt*.075;if(moteData[i*3+1]>1.8)moteData[i*3+1]=-1.7;}moteGeometry.attributes.position.needsUpdate=true;}
      renderer.render(scene,camera);
      if(first){first=false;setReady(true);}
    });
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();mount.removeEventListener('pointermove',move);mount.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});geometries.forEach(item=>item.dispose());materials.add(stoneMaterial);materials.add(glassMaterial);materials.forEach(item=>item.dispose());textures.forEach(item=>item.dispose());environmentTarget.dispose();renderer.dispose();renderer.domElement.remove();};
  }, []);

  return <div className={`architecture-render ${ready?'webgl-ready':''}`} data-mode={modular?'modular':opened?'open':'closed'}>
    <div className="architecture-canvas" ref={host}/><div className="architecture-fallback">{children}</div>
    <div className="scene-corners" aria-hidden="true"><i/><i/><i/><i/></div>
  </div>;
}
