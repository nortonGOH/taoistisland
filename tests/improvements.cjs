const fs=require('fs'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
const http=require('http'),path=require('path');const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);fs.readFile(f,(e,data)=>{if(e){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html');res.end(data);});});await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const b=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:960}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8766');await p.waitForFunction(()=>sceneReady);
await p.evaluate(()=>selectIslandById('proto_center'));await p.waitForTimeout(1000);
const central=await p.evaluate(()=>{
 const c=clickableMeshes.find(m=>m.userData.data?.id==='proto_center'&&m.isSprite);
 const s=clickableMeshes.find(m=>m.userData.data?.id==='proto_south'&&m.isSprite);
 function box(m){const pos=m.getWorldPosition(new THREE.Vector3());const point=pos.clone().project(camera);const d=pos.distanceTo(camera.position);const h=m.scale.y/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*d)*innerHeight;return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2,w:h*m.scale.x/m.scale.y,h};}
 return {center:box(c),south:box(s),view:camera.view};
});
assert(Math.abs(central.center.x-central.south.x)>(central.center.w+central.south.w)/2 || Math.abs(central.center.y-central.south.y)>(central.center.h+central.south.h)/2,'Center and south badge bounds overlap');
await p.screenshot({path:path.join(root,'test-results','central-focus-qa.png')});
await p.evaluate(()=>selectIslandById('lingbao_sanqing'));await p.waitForTimeout(1000);
const tri=await p.evaluate(()=>{
const g=scene.getObjectByName('sanqing-realms');const platforms=g.children.filter(o=>o.geometry?.type==='CylinderGeometry');return {vertices:platforms.map(o=>o.position.toArray()),triangle:!!g.getObjectByName('sanqing-triangle'),particles:sanqingFlows.length};});
assert(tri.vertices.length===3&&tri.triangle&&tri.particles===12);assert(new Set(tri.vertices.map(v=>v[2])).size===2);
await p.screenshot({path:path.join(root,'test-results','sanqing-triangle-qa.png')});
const keys=await p.evaluate(()=>ISLANDS_DATA.find(n=>n.id==='lingbao_sanqing').sanqing.realms.map(r=>r.key));
for(const key of keys){
 const point=await p.evaluate(key=>{const g=scene.getObjectByName('sanqing-realms');const label=g.children.find(o=>o.isSprite&&o.userData.sanqingKey===key&&o.scale.x>4);const v=label.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};},key);
 await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedSanqingKey),key);
 await p.waitForTimeout(850);
}

await p.evaluate(()=>openNarrativeModal());await p.screenshot({path:path.join(root,'test-results','cosmic-dialog-qa.png')});await p.keyboard.press('Escape');
assert(await p.locator('#narrative-modal').evaluate(e=>e.classList.contains('hidden')));
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>selectIslandById('proto_center'));await p.waitForTimeout(1000);
const mobile=await p.locator('#side-drawer').boundingBox();assert(mobile.width<=390&&mobile.y>350);await p.screenshot({path:path.join(root,'test-results','mobile-dialog-qa.png')});
await p.evaluate(()=>{closeDrawer();});assert(await p.evaluate(()=>camera.view.enabled===false));
await p.setViewportSize({width:1440,height:960});
await p.evaluate(()=>setTextView(true));
const ids=await p.evaluate(()=>ISLANDS_DATA.map(n=>n.id));
for(const id of ids)for(const mode of ['beginner','course','researcher']){await p.evaluate(({id,mode})=>{setReaderMode(mode);selectIslandById(id);},{id,mode});assert((await p.locator('#drawer-dynamic-content').innerText()).length>0);}
assert.deepEqual(errors,[]);console.log(JSON.stringify({central,tri,mobile,errors},null,2));await b.close();server.close();
})();
