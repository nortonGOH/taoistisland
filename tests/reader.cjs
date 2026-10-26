const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('fs');
(async () => {
 const launch = {headless:true};
 if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
  launch.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  launch.args = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
 }
 const browser = await chromium.launch(launch);
 const http=require('http'),path=require('path');
 const server=http.createServer((req,res)=>{
  const name=path.join(process.cwd(),req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
  try {res.setHeader('Content-Type', name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':name.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(name));}catch{res.statusCode=404;res.end('Not found');}
 });
 await new Promise(r=>server.listen(8766,'127.0.0.1',r));
 const base = 'http://127.0.0.1:8766/';
 fs.mkdirSync('test-results',{recursive:true});
 const data = JSON.parse(fs.readFileSync('islands.json'));
 async function scenario(name, options={}) {
  const context = await browser.newContext({viewport: options.mobile ? {width:390,height:844} : {width:1440,height:1000}});
  if (options.noThree) await context.route('**/vendor/three.min.js', r => r.abort());
  if (options.badData) await context.route('**/islands.json', r => r.fulfill({status:503,body:'unavailable'}));
  if (options.noWebgl) await context.addInitScript(() => {
   const original = HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext = function(type,...args) { return /webgl/i.test(type) ? null : original.call(this,type,...args); };
  });
  const page = await context.newPage(); const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto(base + (options.route || ''));
  await page.waitForFunction(()=>!document.getElementById('load-status').textContent.includes('正在載入'));
  if(options.badData) {
   assert.match(await page.locator('#load-status').innerText(),/資料載入失敗/);
   assert.equal(await page.getByRole('button',{name:'重新載入',exact:true}).count(),1);
  } else {
   assert.equal(await page.locator('#node-list button').count(),30);
   if(name==='normal') assert.match(await page.locator('#load-status').innerText(),/3D 已就緒/);
   if(options.noWebgl || options.noThree) assert(await page.locator('body').evaluate(el=>el.classList.contains('text-view')));
   if(options.route) assert.match(await page.locator('#drawer-title').innerText(),/三界/);
   // All 30 nodes remain readable, regardless of the camera or WebGL.
   for(const node of data) {
    await page.locator(`[data-node-id="${node.id}"]`).click();
    assert.equal(await page.locator('#drawer-title').innerText(), node.title);
    await page.locator('#btn-researcher').click();
    assert((await page.locator('#drawer-dynamic-content').innerText()).includes(node.researcher.searchTerms));
    await page.locator('#drawer-close').click();
   }
   await page.locator('#node-search').fill('玉京');
   const count = await page.locator('#node-list button').count(); assert(count>0 && count<30);
   await page.locator('#node-search').fill('不存在的詞xyz');
   assert.equal(await page.locator('#node-list button').count(),0);
   assert.match(await page.locator('#search-count').innerText(),/找不到/);
   await page.locator('#node-search').fill('');
   await page.locator('#node-group').selectOption('kalpa');
   assert.equal(await page.locator('#node-list button').count(),6);
   await page.locator('#node-group').selectOption('');
   await page.locator('[data-node-id="lingbao_daluo"]').click();
   await page.locator('#btn-beginner').click();
   await page.getByRole('button',{name:/步驟四/}).click();
   assert.equal(await page.locator('#narrative-modal').isVisible(),true);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#narrative-modal').isVisible(),false);
   await page.locator('#btn-course').click();
   assert.match(page.url(),/node=lingbao_daluo/);
   assert.match(page.url(),/mode=course/);
   await page.reload();
   await page.waitForFunction(()=>document.querySelector('#drawer-title').textContent.includes('第六層'));
   assert.equal(await page.locator('#btn-course').getAttribute('aria-pressed'),'true');
   await page.locator('#drawer-close').click();
   for(const name of ['focusOverview','focusYujingSacred','focusCelestialSymmetry','focusNineStrataGrid','focusZodiacDisk']) {
    await page.locator(`button[onclick="${name}()"]`).click();
    await page.keyboard.press('Escape');
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false);
   await page.screenshot({path:`test-results/${name}.png`,fullPage:false});
  }
  assert.deepEqual(errors,[],name+' has uncaught exceptions');
  console.log('PASS',name,await page.locator('#load-status').innerText());
  await context.close();
 }
 try {
  await scenario('no-webgl',{noWebgl:true,route:'#node=lingbao_three_realms&mode=researcher'});
  await scenario('no-three-mobile',{noThree:true,mobile:true});
  await scenario('data-error',{badData:true});
  await scenario('normal');
 } finally { await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exit(1)});
