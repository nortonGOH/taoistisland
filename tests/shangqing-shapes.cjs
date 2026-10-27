const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');const THREE=require(path.join(root,'vendor/three.min.js'));
const context={THREE,scene:new THREE.Scene(),clickableMeshes:[],ISLANDS_DATA:JSON.parse(fs.readFileSync(path.join(root,'islands.json'),'utf8')),window:{matchMedia:()=>({matches:true})},sanqingText:()=>new THREE.Sprite(new THREE.SpriteMaterial({transparent:true}))};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'shangqing.js'),'utf8')+'\nbuildShangqingSpace();',context);
const scene=context.scene,grid=scene.getObjectByName('shangqing-earth-grid');assert(grid);assert.equal(grid.children.length,9);
assert.equal(new Set(grid.children.map(c=>c.position.x)).size,3);assert.equal(new Set(grid.children.map(c=>c.position.y)).size,3);assert(grid.children.every(c=>c.position.z===0));
for(const cell of grid.children)assert.equal(cell.children.filter(c=>/^shangqing-earth-\d+$/.test(c.name)).length,4);
const earth=context.clickableMeshes.filter(m=>/^shangqing-earth-\d+$/.test(m.name));assert.equal(earth.length,36);
const links=scene.getObjectByName('shangqing-register-links');scene.updateMatrixWorld(true);
for(let i=0;i<36;i++){const end=new THREE.Vector3().fromBufferAttribute(links.children[i].geometry.attributes.position,1).add(new THREE.Vector3(38,0,-18));assert(end.distanceTo(earth[i].getWorldPosition(new THREE.Vector3()))<1e-5,'Link misses relocated earth node');}
const body=scene.getObjectByName('shangqing-inner-body');const points=body.children.filter(m=>m.name.startsWith('shangqing-house-'));assert.equal(points.length,39);
assert.equal(points.filter(p=>p.position.y>2.4).length,5);assert.equal(points.filter(p=>Math.abs(p.position.x)<0.3&&p.position.y<2&&p.position.y>-.8).length,10);assert.equal(points.filter(p=>Math.abs(p.position.x)>1&&p.position.y>1).length,12);assert.equal(points.filter(p=>p.position.y< -1.3).length,12);
for(const side of [-1,1]){const arm=body.getObjectByName('shangqing-body-arm-'+side),leg=body.getObjectByName('shangqing-body-leg-'+side);assert(Math.abs(arm.userData.poseTo[0])>3);assert(Math.abs(leg.userData.poseTo[0])>1.8);assert(leg.userData.poseTo[1]< -4);}
assert(points.every(p=>p.userData.data.id==='shangqing_inner_body'&&p.userData.shangqingHouse));
assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes("openCosmologySpace('lingbao')\">靈寶經派"));
const report={cells:grid.children.map(c=>({name:c.name,position:c.position.toArray()})),bodyPoints:points.map(p=>p.position.toArray()),limbs:body.children.filter(o=>o.userData.poseFrom).map(o=>({name:o.name,from:o.userData.poseFrom,to:o.userData.poseTo}))};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results','shangqing-shapes.json'),JSON.stringify(report));console.log('Passed: renamed menu, 3×3 cells, 36 earth nodes, 36 matching links, four spread limbs and 39 selectable body points.');
