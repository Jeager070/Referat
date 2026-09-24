(async () => {
  const checks=[];
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const assert=(ok,message)=>{if(!ok)throw new Error(message);checks.push(message);};
  const click=name=>[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===name || el.getAttribute('aria-label')===name).click();
  const next=()=>click('Nächster Schritt'),prev=()=>click('Vorheriger Schritt');
  click('Der Monolith');await wait(2400);
  for(let i=0;i<4;i++){next();await wait(100);}await wait(1800);
  const scene=document.querySelector('.sequence-render'),canvas=scene.querySelector('canvas');
  assert(scene.dataset.status==='ready' && canvas,'The real WebGL glass scene is available');
  const frames=[];let sampling=true;
  function sample(){frames.push(document.querySelector('.sequence-render')===scene && scene.querySelector('canvas')===canvas && !document.querySelector('.hero-comparison'));if(sampling)requestAnimationFrame(sample);}
  requestAnimationFrame(sample);next();await wait(1800);sampling=false;
  assert(frames.length>0 && frames.every(Boolean),'The same canvas persists through every sampled Monolith-to-Modular frame');
  assert(scene.dataset.mode==='partition','Modular step 1 displays the partitioned glass body');
  const labels=[...scene.querySelectorAll('.module-label')],packed=labels.map(el=>el.style.transform);
  next();await wait(1800);
  assert(scene.dataset.mode==='split' && labels.every((el,i)=>el.style.transform!==packed[i]),'Step 2 moves all four projected module labels with their 3D bodies');
  assert(labels.every(el=>getComputedStyle(el).opacity==='1'),'All four module labels remain visible');
  next();await wait(1800);assert(scene.dataset.mode==='connected','Step 3 reaches the interface scene');
  next();await wait(1800);assert(getComputedStyle(scene.querySelector('.glass-deployment')).opacity==='1','Step 4 displays the shared deployment');
  const count=scene.dataset.frames;await wait(700);
  assert(scene.dataset.frames===count && scene.dataset.animating==='false','The GPU render loop stops completely while idle');
  for(let i=0;i<4;i++){prev();await wait(100);}await wait(1800);
  assert(scene.querySelector('canvas')===canvas && scene.dataset.mode==='monolith','Reverse navigation restores the monolith without recreating WebGL');
  for(let i=0;i<3;i++){next();await wait(40);prev();await wait(40);}next();await wait(1800);
  assert(scene.dataset.mode==='partition' && document.querySelectorAll('.slide').length===1,'Rapid forward/back navigation settles correctly');
  assert(document.documentElement.scrollWidth<=innerWidth,'The scene fits the viewport');
  click('C# in der Praxis');
  for(let i=0;i<30 && canvas.isConnected;i++)await wait(150);
  assert(!canvas.isConnected && document.querySelectorAll('canvas').length===0,'Leaving the architecture disposes and removes the canvas');
  return checks;
})()
