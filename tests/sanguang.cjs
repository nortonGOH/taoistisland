const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),THREE=require(path.join(root,'vendor/three.min.js'));
const context={THREE,scene:new THREE.Scene(),clickableMeshes:[],ISLANDS_DATA:JSON.parse(fs.readFileSync(path.join(root,'islands.json'),'utf8')),sanqingText:()=>new THREE.Sprite(new THREE.SpriteMaterial({transparent:true}))};
vm.createContext(context);const tower=new THREE.Group();tower.position.set(0,0,-18);context.scene.add(tower);context.tower=tower;
vm.runInContext(fs.readFileSync(path.join(root,'sanguang.js'),'utf8')+'\nbuildSanguangRealm(tower);',context);
const group=tower.getObjectByName('lingbao-sanguang-landscape');assert.equal(group.position.y,-6);
for(const [key,count] of [['east',9],['south',3],['center',4],['west',7],['north',5]]){
 const planet=group.getObjectByName('sanguang-planet-'+key);assert(planet);
 for(const kind of ['gate','guard','ray'])assert.equal(planet.children.filter(o=>o.name.startsWith('sanguang-'+kind+'-'+key+'-')).length,count);
 assert(group.getObjectByName('sanguang-mountain-'+key));assert(group.getObjectByName('sanguang-sealed-text-'+key));assert(group.getObjectByName('sanguang-five-elder-'+key));
}
for(const name of ['sun','moon'])assert(group.getObjectByName('sanguang-'+name));
for(const o of context.clickableMeshes){assert.equal(o.userData.data.id,'lingbao_earth_realm');assert(o.userData.axisPart);assert(o.userData.focusObject.isObject3D);assert(o.userData.focusPos.toArray().every(Number.isFinite));}
const parts=new Set(context.clickableMeshes.filter(o=>o.isSprite).map(o=>o.userData.earthPart));assert.equal(parts.size,14);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('renderSanguangPanel(contentBox)'));assert(html.includes('selectedEarthPart = userData.earthPart'));assert(html.includes('userData.horizontalSurface?10'));
console.log('Passed: layer 4 placement, sun/moon, 28 gates + guards + rays, 5 mountain texts, 5 elders, 14 selectable reading/view parts.');
