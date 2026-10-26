const fs=require('fs'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
const http=require('http'),path=require('path');const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);fs.readFile(f,(e,data)=>{if(e){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html');res.end(data);});});await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const b=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:960}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8766');await p.waitForFunction(()=>sceneReady).catch(e=>{console.error('Scene initialization errors:',errors);throw e;});
assert.equal(await p.locator('#load-status').isVisible(),false);
for(const width of [1440,390]){
 await p.setViewportSize({width,height:960});
 if(await p.locator('#left-panel-trigger').isVisible())await p.locator('#left-panel-trigger').click();
 await p.locator('#btn-toggle-left').click();await p.waitForFunction(()=>document.getElementById('left-panel').getBoundingClientRect().right<=0);
 const bounds=await p.locator('#left-panel').boundingBox();assert(bounds.x+bounds.width<=0,'Panel remains on screen');
 assert(await p.locator('#left-panel-trigger').isVisible());
 await p.locator('#left-panel-trigger').click();await p.waitForFunction(()=>document.getElementById('left-panel').getBoundingClientRect().x>=0);
}
await p.setViewportSize({width:1440,height:960});
const core=await p.evaluate(()=>{const g=scene.getObjectByName('sanqing-realms');return {localZ:g.position.z,worldZ:g.getWorldPosition(new THREE.Vector3()).z,axisZ:COSMOLOGY_CENTER.z};});assert.equal(core.localZ,0);assert.equal(core.worldZ,core.axisZ);
for(const id of ['proto_center','proto_east','proto_south','proto_west','proto_north']) {
 await p.evaluate(id=>selectIslandById(id),id);await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
 const point=await p.evaluate(()=>{const v=focusedObject.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};});
 await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedIsland.id),id);
 assert.equal(await p.evaluate(()=>lastOrbitTransition.kind),'axis-orbit');
}
const axis=await p.evaluate(()=>{const a=scene.getObjectByName('lingbao-transparent-axis'),g=scene.getObjectByName('lingbao-axis-guide');return {opacity:a.material.opacity,depthWrite:a.material.depthWrite,guideOpacity:g.material.opacity,selectable:clickableMeshes.includes(a)||clickableMeshes.includes(g)};});assert.equal(axis.opacity,0.035);assert.equal(axis.depthWrite,false);assert.equal(axis.guideOpacity,0.18);assert.equal(axis.selectable,false);
// Relocation shares the tower axis; the prototype moves into its third/fourth-layer junction.
const layout=await p.evaluate(()=>{
 const wheel=scene.getObjectByName('lingbao-kalpa-wheel'),tower=scene.getObjectByName('lingbao-six-layers'),proto=scene.getObjectByName('five-qi-prototype');
 return {wheel:wheel.getWorldPosition(new THREE.Vector3()).toArray(),tower:tower.getWorldPosition(new THREE.Vector3()).toArray(),parent:wheel.parent.name,protoParent:proto.parent.name,proto:proto.getWorldPosition(new THREE.Vector3()).toArray(),layers:[1,2,3].map(i=>scene.getObjectByName('tower-layer-'+i).getWorldPosition(new THREE.Vector3()).y),nodes:ISLANDS_DATA.length};
});
assert.deepEqual(layout.wheel,[0,0,-18]);assert.equal(layout.parent,'lingbao-six-layers');assert.deepEqual(layout.proto,[0,-2.6,-18]);
assert.equal(layout.protoParent,'lingbao-six-layers');
assert.deepEqual(layout.layers,[0.6,5.6,10.6]);assert.equal(layout.nodes,34);
console.log('Wheel moved to the tower; five-qi prototype moved inside the tower.');
// Six macro layers are numbered top-down; the qi network crosses all six through the relocated disk.
const across=await p.evaluate(()=>{
 const source=ISLANDS_DATA.find(n=>n.id==='proto_center').wuqiAcross;
 const group=scene.getObjectByName('wuqi-across-six-layers');
 return {levels:source.layers.map(l=>[l.rank,ISLANDS_DATA.find(n=>n.id===l.id).spaceLayer]),flows:group.children.filter(o=>o.name.startsWith('wuqi-flow-')).length,points:group.children.filter(o=>o.userData.towerWuqiLayer).length,proto:scene.getObjectByName('five-qi-prototype').getWorldPosition(new THREE.Vector3()).toArray()};
});assert.deepEqual(across.levels,[[1,1],[2,2],[3,3],[4,4],[5,5],[6,6]]);assert.equal(across.flows,5);assert.equal(across.points,25);assert.deepEqual(across.proto,[0,-2.6,-18]);
for(const rank of [2,3,4,5,6]){
 await p.evaluate(rank=>selectIsland(scene.getObjectByName('wuqi-proto_north-layer-'+rank).userData),rank);await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
 assert.equal(await p.locator('.wuqi-layer-list button[data-selected="true"]').getAttribute('data-rank'),String(rank));
 assert.equal(await p.locator('.wuqi-across-panel tbody tr[data-selected="true"]').getAttribute('data-direction'),'proto_north');
 assert.equal(await p.evaluate(()=>scene.getObjectByName('wuqi-flow-proto_north').material.opacity),0.8);
 const point=await p.evaluate(()=>{const v=focusedObject.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};});await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedWuqiLayer),rank);
}
await p.screenshot({path:path.join(root,'test-results','wuqi-across-qa.png')});
console.log('Six top-down layers, five streams, 25 cross-layer points and relocated prototype passed.');
await p.evaluate(()=>closeDrawer());assert.equal(await p.evaluate(()=>scene.getObjectByName('wuqi-flow-proto_north').material.opacity),0.25);
// The kalpa wheel now contains all 28 heavens in three internal tiers.
await p.evaluate(()=>selectIslandById('kalpa_center'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
assert.equal(await p.locator('.kalpa-realm-row').count(),3);
assert(await p.evaluate(()=>clickableMeshes.filter(m=>m.isSprite&&m.userData.kalpaRealmKey).every(m=>m.visible)));
const tickCount=await p.evaluate(()=>{const group=scene.getObjectByName('kalpa-three-realms');return ['desire','form','formless'].map(key=>group.getObjectByName('kalpa-ticks-'+key).geometry.attributes.position.count/2);});
assert.deepEqual(tickCount,[6,18,4]);assert(await p.evaluate(()=>!!scene.getObjectByName('kalpa-boundary-ring')));
for(const key of ['desire','form','formless']){
 await p.evaluate(key=>selectIsland(clickableMeshes.find(m=>m.isSprite&&m.userData.kalpaRealmKey===key).userData),key);await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
 const point=await p.evaluate(()=>{const v=focusedObject.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};});
 await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedKalpaRealmKey),key);
 assert.equal(await p.locator('.kalpa-realm-row[data-selected="true"]').count(),1);
}
await p.evaluate(()=>selectIslandById('kalpa_center'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
await p.screenshot({path:path.join(root,'test-results','kalpa-boundary-qa.png')});
await p.locator('.kalpa-related-actions button').filter({hasText:'查看四種民天'}).click();assert.equal(await p.evaluate(()=>selectedIsland.id),'lingbao_four_brahma');
console.log('Kalpa 6/18/4 tiers, boundary, picking and related navigation passed.');
await p.evaluate(()=>selectIslandById('proto_center'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
const central=await p.evaluate(()=>{
 const c=clickableMeshes.find(m=>m.userData.data?.id==='proto_center'&&m.isSprite);
 const s=clickableMeshes.find(m=>m.userData.data?.id==='proto_south'&&m.isSprite);
 function box(m){const pos=m.getWorldPosition(new THREE.Vector3());const point=pos.clone().project(camera);const d=pos.distanceTo(camera.position);const h=m.scale.y/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*d)*innerHeight;return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2,w:h*m.scale.x/m.scale.y,h};}
 return {center:box(c),south:box(s),view:camera.view};
});
assert(Math.abs(central.center.x-central.south.x)>(central.center.w+central.south.w)/2 || Math.abs(central.center.y-central.south.y)>(central.center.h+central.south.h)/2,'Center and south badge bounds overlap');
await p.screenshot({path:path.join(root,'test-results','central-focus-qa.png')});
await p.evaluate(()=>selectIslandById('lingbao_sanqing'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
const tri=await p.evaluate(()=>{
const g=scene.getObjectByName('sanqing-realms');const platforms=g.children.filter(o=>o.geometry?.type==='CylinderGeometry');return {vertices:platforms.map(o=>o.position.toArray()),triangle:!!g.getObjectByName('sanqing-triangle'),particles:sanqingFlows.length};});
assert(tri.vertices.length===3&&tri.triangle&&tri.particles===12);assert(new Set(tri.vertices.map(v=>v[2])).size===2);
await p.screenshot({path:path.join(root,'test-results','sanqing-triangle-qa.png')});
const keys=await p.evaluate(()=>ISLANDS_DATA.find(n=>n.id==='lingbao_sanqing').sanqing.realms.map(r=>r.key));
for(const key of keys){
 await p.evaluate(()=>selectIslandById('lingbao_sanqing'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
 const point=await p.evaluate(key=>{const g=scene.getObjectByName('sanqing-realms');const label=g.children.find(o=>o.isSprite&&o.userData.sanqingKey===key&&o.scale.x>4);const v=label.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};},key);
 await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedSanqingKey),key);
 await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
}

await p.evaluate(()=>closeDrawer());await p.locator('#btn-course').click();
assert(await p.evaluate(()=>!!selectedIsland && currentMode==='course'));
await p.evaluate(()=>setReaderMode('beginner'));
for(const key of ['east','south','west','north']){
 await p.evaluate(key=>{const marker=clickableMeshes.find(m=>m.isSprite&&m.userData.fourBrahmaKey===key);selectIsland(marker.userData);},key);
 await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
 const point=await p.evaluate(()=>{const v=focusedObject.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2,depthTest:focusedObject.material.depthTest};});
 assert(!point.depthTest);await p.mouse.click(point.x,point.y);
 assert.equal(await p.evaluate(()=>selectedFourBrahmaKey),key);
 assert.equal(await p.locator('.four-brahma-card[data-selected="true"]').count(),1);
}
console.log('Mode with no selection and all four palace icons passed.');
// The tower camera follows an arc about the same vertical axis, never a straight chord.
const orbit=await p.evaluate(async()=>{
 closeDrawer();camera.position.set(COSMOLOGY_CENTER.x+20,30,COSMOLOGY_CENTER.z);controls.target.set(COSMOLOGY_CENTER.x,18,COSMOLOGY_CENTER.z);controls.update();
 selectIslandById('lingbao_four_brahma');const trajectory=[];
 await new Promise(resolve=>{function sample(){trajectory.push({x:camera.position.x,z:camera.position.z});if(focusCameraTween?.isPlaying())requestAnimationFrame(sample);else resolve();}requestAnimationFrame(sample);});
 return {transition:lastOrbitTransition,trajectory,target:controls.target.toArray(),axis:[COSMOLOGY_CENTER.x,COSMOLOGY_CENTER.y,COSMOLOGY_CENTER.z]};
});
assert.equal(orbit.transition.kind,'axis-orbit');assert(Math.abs(orbit.target[0]-orbit.axis[0])<0.01&&Math.abs(orbit.target[2]-orbit.axis[2])<0.01);
assert(orbit.trajectory.length>3);
for(const point of orbit.trajectory)assert(Math.hypot(point.x-orbit.axis[0],point.z-orbit.axis[2])>=Math.min(20,orbit.transition.endRadius)-0.2,'Camera cut across the axis instead of orbiting');
for(const id of ['lingbao_sanqing','lingbao_daluo']){
 await p.evaluate(id=>selectIslandById(id),id);await p.waitForFunction(()=>!focusCameraTween?.isPlaying());
 assert.equal(await p.locator('.cosmogony-model').count(),2);
 assert.equal(await p.locator('.counting-card').count(),3);
 assert.equal(await p.locator('#drawer-dynamic-content a[href]').count(),0);
}
await p.screenshot({path:path.join(root,'test-results','daluo-cosmogony-qa.png')});
console.log('Central-axis arc and two distinct cosmogony models passed.');
// Fourth-layer data, no outbound navigation, and true reading-mode tabs.
await p.evaluate(()=>selectIslandById('lingbao_four_brahma'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
assert.equal(await p.locator('.four-brahma-card').count(),4);
assert.equal(await p.locator('#drawer-dynamic-content a[href]').count(),0);
for(const mode of ['beginner','course','researcher']){
 await p.locator('#btn-'+mode).click();
 assert.equal(await p.locator('#btn-'+mode).getAttribute('aria-selected'),'true');
 assert.equal(await p.locator('#drawer-dynamic-content').getAttribute('aria-labelledby'),'btn-'+mode);
}
assert.equal(await p.locator('.four-brahma-panel .source-record').count(),3);
await p.locator('#btn-researcher').press('Home');assert.equal(await p.evaluate(()=>currentMode),'beginner');
await p.screenshot({path:path.join(root,'test-results','four-brahma-qa.png')});
const originalLabels=await p.evaluate(()=>clickableMeshes.filter(m=>m.isSprite).map(m=>({id:m.userData.data?.id,y:m.userData.floatBaseY,local:m.position.y})).filter(m=>m.id==='proto_south'));
assert(originalLabels.every(m=>Math.abs(m.local-m.y)<0.05),'Local float origins drifted');
await p.evaluate(()=>openNarrativeModal());await p.screenshot({path:path.join(root,'test-results','cosmic-dialog-qa.png')});await p.keyboard.press('Escape');
assert(await p.locator('#narrative-modal').evaluate(e=>e.classList.contains('hidden')));
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>selectIslandById('proto_center'));await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
const mobile=await p.locator('#side-drawer').boundingBox();assert(mobile.width<=390&&mobile.y>350);await p.screenshot({path:path.join(root,'test-results','mobile-dialog-qa.png')});
await p.evaluate(()=>{closeDrawer();});assert(await p.evaluate(()=>camera.view.enabled===false));
await p.setViewportSize({width:1440,height:960});
const focusChecks=[];
for(const id of await p.evaluate(()=>ISLANDS_DATA.map(n=>n.id))){
 await p.evaluate(id=>selectIslandById(id),id);await p.waitForFunction(()=>!focusCameraTween?.isPlaying());await p.waitForTimeout(120);
 const check=await p.evaluate(()=>{
  const o=focusedObject;const v=o?.getWorldPosition(new THREE.Vector3()).project(camera);
  const rect=document.getElementById('side-drawer').getBoundingClientRect();
  return {id:selectedIsland.id,x:v?(v.x+1)*innerWidth/2:null,y:v?(1-v.y)*innerHeight/2:null,right:rect.left,visible:o?.visible,depthTest:o?.isSprite?o.material.depthTest:false};
 });
 assert(check.visible && !check.depthTest,JSON.stringify(check));
 assert(check.x>0 && check.x<check.right && check.y>0 && check.y<960,JSON.stringify(check));focusChecks.push(check);
}
console.log('Focused '+focusChecks.length+' nodes in available scene area.');
await p.evaluate(()=>setTextView(true));

const ids=await p.evaluate(()=>ISLANDS_DATA.map(n=>n.id));
for(const id of ids)for(const mode of ['beginner','course','researcher']){await p.evaluate(({id,mode})=>{setReaderMode(mode);selectIslandById(id);},{id,mode});assert((await p.locator('#drawer-dynamic-content').innerText()).length>0);assert.equal(await p.locator('#drawer-dynamic-content a[href]').count(),0);}
assert.deepEqual(errors,[]);console.log(JSON.stringify({central,tri,mobile,errors},null,2));await b.close();server.close();
})();
