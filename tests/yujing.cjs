const fs=require('fs'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
const http=require('http'),path=require('path');const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);fs.readFile(f,(e,data)=>{if(e){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html');res.end(data);});});await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const b=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:960}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.emulateMedia({reducedMotion:'reduce'});await p.goto('http://127.0.0.1:8766');await p.waitForFunction(()=>sceneReady).catch(e=>{console.error('Scene initialization errors:',errors);throw e;});
await p.evaluate(()=>{cancelAnimationFrame(animationFrame);animationFrame=null;});
const layout=await p.evaluate(()=>{
 const g=scene.getObjectByName('yujing-sanctuary');
 return {figures:['yuqing','shangqing','taiqing'].map(key=>{const f=scene.getObjectByName('sanqing-deity-'+key);const v=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),f.rotation.y);return v.x*f.position.x+v.z*f.position.z;}),book:g.getObjectByName('yujing-scripture').position.y,palace:!!g.getObjectByName('yujing-purple-palace'),attendants:g.getObjectByName('yujing-attendants').children.length};
});assert(layout.figures.every(n=>n>0));assert.equal(layout.attendants,10);assert(layout.palace&&layout.book>3.5);
for(const part of ['scripture','palace','forest','ritual']){
 await p.evaluate(part=>selectIsland(clickableMeshes.find(m=>m.userData.yujingPart===part&&m.isMesh)?.userData || clickableMeshes.find(m=>m.userData.yujingPart===part).userData),part);
 const point=await p.evaluate(part=>{const o=clickableMeshes.find(m=>m.userData.yujingPart===part&&m.isMesh)||clickableMeshes.find(m=>m.userData.yujingPart===part&&m.isSprite);const v=o.getWorldPosition(new THREE.Vector3()).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};},part);await p.mouse.click(point.x,point.y);assert.equal(await p.evaluate(()=>selectedYujingPart),part);assert.equal(await p.locator('.yujing-panel').count(),1);assert.equal(await p.locator('.yujing-panel a[href]').count(),0);
}
await p.emulateMedia({reducedMotion:'no-preference'});
const motion=await p.evaluate(()=>{const g=scene.getObjectByName('yujing-attendants');animateYujingRitual(1000);const a=g.rotation.y;animateYujingRitual(3000);return g.rotation.y-a;});assert(motion>0);
await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>animateYujingRitual(5000));assert.equal(await p.evaluate(()=>scene.getObjectByName('yujing-attendants').rotation.y),0);
await p.evaluate(()=>{selectIslandById('lingbao_daluo');renderer.render(scene,camera);});

console.log('Outward Sanqing, scripture core, all four part selections, ritual motion and reduced-motion checks passed.');
assert.deepEqual(errors,[]);await b.close();server.close();})();
