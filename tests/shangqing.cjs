const fs=require('fs'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
const http=require('http'),path=require('path');const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);fs.readFile(f,(e,data)=>{if(e){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html');res.end(data);});});await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const b=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:960}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.emulateMedia({reducedMotion:'reduce'});await p.goto('http://127.0.0.1:8766');await p.waitForFunction(()=>sceneReady).catch(e=>{console.error('Scene initialization errors:',errors);throw e;});
await p.evaluate(()=>{cancelAnimationFrame(animationFrame);animationFrame=null;});
const geometry=await p.evaluate(()=>{const g=scene.getObjectByName('shangqing-independent-space');return{parent:g.parent.type,center:g.getWorldPosition(new THREE.Vector3()).toArray(),heavens:g.children.find(o=>o.name==='shangqing-nine-heavens').children.filter(o=>o.name.startsWith('shangqing-heaven-ring-')).length,celestial:clickableMeshes.filter(o=>o.name.startsWith('shangqing-celestial-')).length,earth:clickableMeshes.filter(o=>o.name.startsWith('shangqing-earth-')&&!o.name.includes('ring')).length,houses:clickableMeshes.filter(o=>o.name.startsWith('shangqing-house-')).length,nodes:ISLANDS_DATA.length};});
assert.deepEqual(geometry.center,[38,0,-18]);assert.equal(geometry.parent,'Scene');assert.equal(geometry.heavens,9);assert.equal(geometry.celestial,36);assert.equal(geometry.earth,36);assert.equal(geometry.houses,39);assert.equal(geometry.nodes,39);
await p.locator('#btn-space-shangqing').click();assert.equal(await p.evaluate(()=>selectedIsland.disk),'shangqing');assert.equal(await p.evaluate(()=>controls.target.x),38);
await p.locator('.shangqing-actions button[data-model="three"]').click();assert.equal(await p.evaluate(()=>scene.getObjectByName('shangqing-three-model').position.y),31);
await p.locator('.shangqing-actions button[data-model="nine"]').click();assert.equal(await p.evaluate(()=>scene.getObjectByName('shangqing-three-model').position.y),14);
await p.locator('[data-action="register-links"]').click();assert(await p.evaluate(()=>scene.getObjectByName('shangqing-register-links').visible));
for(const i of [1,5,9]){await p.locator('.shangqing-panel button[data-heaven="'+i+'"]').click();assert.equal(await p.evaluate(()=>selectedShangqingHeaven),i);assert.equal(await p.evaluate(()=>controls.target.x),38);}
for(const i of [1,20,39]){await p.evaluate(i=>selectIsland(scene.getObjectByName('shangqing-house-'+i).userData),i);const point=await p.evaluate(()=>{const v=focusedObject.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};});await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedShangqingHouse),i);}
for(const id of ['shangqing_nine_heavens','shangqing_thirty_six','shangqing_three_nine','shangqing_earth_register','shangqing_inner_body'])for(const mode of ['beginner','course','researcher']){await p.evaluate(({id,mode})=>{setReaderMode(mode);selectIslandById(id)},{id,mode});const text=await p.locator('#drawer-dynamic-content').innerText();assert(!text.includes('undefined'));assert.equal(await p.locator('#drawer-dynamic-content a[href]').count(),0);}
// The earth register lies on the x/z plane, with a raised camera for inspection.
await p.evaluate(()=>selectIslandById('shangqing_earth_register'));
assert(await p.evaluate(()=>camera.position.y>controls.target.y+9));
const flat=await p.evaluate(()=>{scene.updateMatrixWorld(true);return scene.getObjectByName('shangqing-earth-grid').children.map(c=>c.getWorldPosition(new THREE.Vector3()).y);});assert(Math.max(...flat)-Math.min(...flat)<1e-8);
await p.evaluate(()=>selectIslandById('lingbao_earth_realm'));
assert.equal(await p.locator('.sanguang-panel button[data-earth-part]').count(),14);
for(const part of ['sun','moon','star-east','star-south','star-center','star-west','star-north','mountain-east','mountain-south','mountain-center','mountain-west','mountain-north','elders','geography']){
 await p.locator('.sanguang-panel button[data-earth-part="'+part+'"]').click();
 assert.equal(await p.evaluate(()=>selectedEarthPart),part);assert.equal(await p.evaluate(()=>lastOrbitTransition.axisX),0);
 const pos=await p.evaluate(()=>focusedObject.getWorldPosition(new THREE.Vector3()).project(camera).toArray());assert(pos.every(Number.isFinite));assert(Math.abs(pos[0])<1&&Math.abs(pos[1])<1&&Math.abs(pos[2])<1);
}
for(const mode of ['beginner','course','researcher']){await p.evaluate(mode=>setReaderMode(mode),mode);const text=await p.locator('#drawer-dynamic-content').innerText();assert(!text.includes('undefined'));assert(text.includes('真文封嶽'));assert.equal(await p.locator('#drawer-dynamic-content a[href]').count(),0);}
await p.evaluate(()=>selectIslandById('lingbao_earth_realm'));
const landscape=await p.evaluate(()=>{renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');});fs.writeFileSync(path.join(root,'test-results','sanguang-canvas-qa.png'),Buffer.from(landscape.split(',')[1],'base64'));
await p.locator('#btn-space-lingbao').click();assert.equal(await p.evaluate(()=>controls.target.x),0);assert.equal(await p.evaluate(()=>selectedIsland.id),'lingbao_daluo');
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{selectIslandById('shangqing_nine_heavens');renderer.render(scene,camera);});assert.equal(await p.evaluate(()=>controls.target.x),38);
await p.setViewportSize({width:1440,height:960});await p.evaluate(()=>{selectIslandById('shangqing_nine_heavens');renderer.render(scene,camera);});const canvas=await p.evaluate(()=>{renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');});fs.writeFileSync(path.join(root,'test-results','shangqing-canvas-qa.png'),Buffer.from(canvas.split(',')[1],'base64'));
assert.deepEqual(errors,[]);console.log('Independent Shangqing: 9 heavens, 36+36 nodes, 39 body points, mode toggles, picking, 15 reading views, mobile and Lingbao return passed.');await b.close();server.close();})();
