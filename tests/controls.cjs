const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),req.url==='/'?'index.html':req.url);try{res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(8767,'127.0.0.1',r));
 const launch={headless:true};
 if(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {launch.executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;launch.args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];}
 const browser=await chromium.launch(launch);
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8767/');
 await page.waitForFunction(()=>document.getElementById('load-status').textContent.includes('3D 已就緒'));
 await page.locator('#btn-text-view').click();assert(await page.locator('body').evaluate(el=>el.classList.contains('text-view')));
 await page.locator('[data-node-id="lingbao_daluo"]').click();
 await page.locator('#drawer-close').click();
 await page.setViewportSize({width:1200,height:800});
 await page.locator('#btn-text-view').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('text-view')),false);
 await page.locator('[data-node-id="lingbao_three_realms"]').click();assert.match(await page.locator('#drawer-title').innerText(),/三界/);
 await page.locator('#canvas-container canvas').dispatchEvent('webglcontextlost',{cancelable:true});
 assert(await page.locator('body').evaluate(el=>el.classList.contains('text-view')));
 assert.match(await page.locator('#load-status').innerText(),/顯示已中斷/);
 assert.deepEqual(errors,[]);
 console.log('PASS healthy 3D → text → resized 3D → context-lost text');
 } finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
