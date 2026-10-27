/* Independent Shangqing teaching model. Positions are schematic, not a historical map. */
const SHANGQING_CENTER={x:38,y:0,z:-18};
const SHANGQING_HEAVENS=['鬱單無量天','上上禪善無量壽天','梵監須延天','寂然兜術天','波羅尼密不驕樂天','洞元化應聲天','靈化梵輔天','高虛清明天','無想無結無愛天'];
const shangqingFlows=[];
let selectedShangqingHeaven=null,selectedShangqingHouse=null,shangqingModel='nine',shangqingLinks=false;
function buildShangqingSpace(){
  const root=new THREE.Group();root.name='shangqing-independent-space';root.position.copy(SHANGQING_CENTER);scene.add(root);
  const overview=new THREE.Object3D();overview.position.y=11;root.add(overview);
  const register=(object,id,extra={},focus=object)=>{object.userData={data:ISLANDS_DATA.find(n=>n.id===id),focusContext:'shangqing',focusAxis:SHANGQING_CENTER,focusObject:focus,axisPart:!extra.spaceOverview,...extra,focusPos:focus.getWorldPosition(new THREE.Vector3())};if(object.isSprite)object.userData.markerMesh=object;clickableMeshes.push(object);return object;};
  function label(parent,lines,x,y,z,id,extra={},focus=null,width=5){const o=sanqingText(lines,'#c4b5fd',1024,300);o.scale.set(width,width*300/1024,1);o.position.set(x,y,z);parent.add(o);root.updateMatrixWorld(true);register(o,id,extra,focus||o);return o;}
  label(root,['上清經派・獨立宇宙模型','混沌太虛／九炁化生〔比較示意〕'],0,35,0,'shangqing_nine_heavens',{spaceOverview:true},overview,8);
  const qiSeed=new THREE.Group();qiSeed.name='shangqing-nine-qi';qiSeed.position.y=32.8;root.add(qiSeed);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const q=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),new THREE.MeshBasicMaterial({color:'#c4b5fd'}));q.position.set(Math.cos(a)*1.5,0,Math.sin(a)*1.5);qiSeed.add(q);}
  const axis=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-16,0),new THREE.Vector3(0,33,0)]),new THREE.LineDashedMaterial({color:'#a5b4fc',transparent:true,opacity:0.15,dashSize:0.4,gapSize:0.6,depthWrite:false}));axis.computeLineDistances();root.add(axis);
  const upper=new THREE.Group();upper.name='shangqing-nine-heavens';root.add(upper);
  const links=new THREE.Group();links.name='shangqing-register-links';links.visible=shangqingLinks;root.add(links);
  const earthGrid=new THREE.Group();earthGrid.name='shangqing-earth-grid';earthGrid.position.y=-8.2;earthGrid.rotation.x=-Math.PI/2;root.add(earthGrid);
  for(let i=0;i<9;i++){
    const y=i*3.4,r=6.6-i*0.23;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.055,6,64),new THREE.MeshBasicMaterial({color:'#818cf8',transparent:true,opacity:0.45}));ring.rotation.x=Math.PI/2;ring.position.y=y;ring.name='shangqing-heaven-ring-'+(i+1);upper.add(ring);root.updateMatrixWorld(true);register(ring,'shangqing_nine_heavens',{shangqingHeaven:i+1});
    label(upper,[`第 ${i+1} 天`,SHANGQING_HEAVENS[i]],0,y+0.8,r+0.8,'shangqing_nine_heavens',{shangqingHeaven:i+1},null,4.6);
    const gx=(i%3-1)*3.8,gy=(1-Math.floor(i/3))*3.8;
    const cell=new THREE.Group();cell.name='shangqing-nine-cell-'+(i+1);cell.position.set(gx,gy,0);earthGrid.add(cell);
    const tile=new THREE.Mesh(new THREE.BoxGeometry(3.2,3.2,0.2),new THREE.MeshBasicMaterial({color:'#9e8c6d',transparent:true,opacity:0.13,depthWrite:false}));
    tile.add(new THREE.LineSegments(new THREE.EdgesGeometry(tile.geometry),new THREE.LineBasicMaterial({color:'#d3bc92',transparent:true,opacity:0.7})));cell.add(tile);root.updateMatrixWorld(true);register(tile,'shangqing_earth_register',{shangqingEarth:i+1,horizontalSurface:true});
    label(cell,[`第 ${i+1} 壘`],0,1.12,0.24,'shangqing_earth_register',{shangqingEarth:i+1,horizontalSurface:true},null,2.1);
    for(let j=0;j<4;j++){
      const a=j*Math.PI/2+Math.PI/4,x=Math.cos(a)*r,z=Math.sin(a)*r;
      const top=new THREE.Mesh(new THREE.SphereGeometry(0.17,10,8),new THREE.MeshBasicMaterial({color:j===0?'#ddd6fe':'#67e8f9'}));top.position.set(x,y,z);top.name='shangqing-celestial-'+(i*4+j+1);upper.add(top);root.updateMatrixWorld(true);register(top,'shangqing_thirty_six',{shangqingHeaven:i+1,shangqingOrdinal:i*4+j+1});
      const bottom=new THREE.Mesh(new THREE.OctahedronGeometry(0.2),new THREE.MeshStandardMaterial({color:'#bda77c',roughness:0.6}));bottom.position.set(j%2===0?-0.64:0.64,j<2?0.28:-0.75,0.4);bottom.name='shangqing-earth-'+(i*4+j+1);cell.add(bottom);root.updateMatrixWorld(true);register(bottom,'shangqing_earth_register',{shangqingEarth:i+1,shangqingOrdinal:i*4+j+1,horizontalSurface:true});
      links.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([top.position.clone(),root.worldToLocal(bottom.getWorldPosition(new THREE.Vector3()))]),new THREE.LineBasicMaterial({color:'#a5b4fc',transparent:true,opacity:0.13,depthWrite:false})));
    }
  }
  label(root,['九玄三十六天','9 組 × 4 點：幾何分組示意'],-8.7,17,1,'shangqing_thirty_six',{},null,5);
  label(root,['九壘九宮格・三十六土皇','水平九宮・每宮四位'],0,-7.2,6.6,'shangqing_earth_register',{horizontalSurface:true},null,6);
  const comparison=new THREE.Group();comparison.name='shangqing-three-model';comparison.position.y=14;root.add(comparison);
  ['清微天','禹餘天','大赤天'].forEach((name,i)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(0.45,14,10),new THREE.MeshStandardMaterial({color:['#7dd3fc','#e2e8f0','#e9c46a'][i],emissive:'#64627a',emissiveIntensity:0.15}));o.position.set((i-1)*2.2,0,0);comparison.add(o);root.updateMatrixWorld(true);register(o,'shangqing_three_nine',{},o);label(comparison,[name],(i-1)*2.2,0.95,0,'shangqing_three_nine',{},null,2.4);});
  label(root,['三天／九天・比較模型','位格與文本層次分讀'],-8,29,1,'shangqing_three_nine',{},null,5);
  const body=new THREE.Group();body.name='shangqing-inner-body';body.position.set(11,11,10);body.rotation.y=Math.atan2(11,10);root.add(body);
  const glass=new THREE.MeshBasicMaterial({color:'#67e8f9',wireframe:true,transparent:true,opacity:0.16,depthWrite:false});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.85,3.2,10),glass);torso.name='shangqing-body-torso';torso.position.y=0.3;body.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.62,12,10),glass);head.name='shangqing-body-head';head.position.y=2.8;body.add(head);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.25,0.5,8),glass);neck.position.y=2.05;body.add(neck);
  function limb(name,from,to,radius){const delta=to.clone().sub(from),part=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),8),glass);part.name=name;part.position.copy(from).add(to).multiplyScalar(0.5);part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());part.userData.poseFrom=from.toArray();part.userData.poseTo=to.toArray();body.add(part);}
  for(const side of [-1,1]){
    limb('shangqing-body-arm-'+side,new THREE.Vector3(side*0.65,1.35,0),new THREE.Vector3(side*3.6,1.9,0),0.22);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.26,10,8),glass);hand.position.set(side*3.7,1.92,0);body.add(hand);
    limb('shangqing-body-leg-'+side,new THREE.Vector3(side*0.42,-1.3,0),new THREE.Vector3(side*1.9,-4.4,0),0.28);
    const foot=new THREE.Mesh(new THREE.SphereGeometry(0.31,10,8),glass);foot.scale.set(1.25,0.6,1);foot.position.set(side*2,-4.46,0.12);body.add(foot);
  }
  const housePoints=[[-0.32,2.7,0.55],[-0.16,3,0.55],[0,3.15,0.55],[0.16,3,0.55],[0.32,2.7,0.55]];
  for(let row=0;row<5;row++)for(const side of [-1,1])housePoints.push([side*0.26,1.55-row*0.55,0.7]);
  for(const side of [-1,1])for(let j=1;j<=6;j++){const t=j/6;housePoints.push([side*(0.65+2.95*t),1.35+0.55*t,0.32]);}
  for(const side of [-1,1])for(let j=1;j<=6;j++){const t=j/6;housePoints.push([side*(0.42+1.48*t),-1.3-3.1*t,0.35]);}
  housePoints.forEach((position,i)=>{
    const point=new THREE.Mesh(new THREE.SphereGeometry(0.095,8,6),new THREE.MeshBasicMaterial({color:'#a5f3fc'}));point.position.fromArray(position);point.name='shangqing-house-'+(i+1);body.add(point);root.updateMatrixWorld(true);register(point,'shangqing_inner_body',{shangqingHouse:i+1});
  });
  label(root,['身中三十九戶・大字人體','39 個象徵點・非解剖定位'],11,5.5,11,'shangqing_inner_body',{},body,5.5);
  const descent=new THREE.CatmullRomCurve3([new THREE.Vector3(0,24,0),new THREE.Vector3(5,21,0),new THREE.Vector3(9,16,6),new THREE.Vector3(11,11,10)]);
  const path=new THREE.Mesh(new THREE.TubeGeometry(descent,30,0.018,4,false),new THREE.MeshBasicMaterial({color:'#67e8f9',transparent:true,opacity:0.22,depthWrite:false}));path.name='shangqing-inner-descent';root.add(path);
  for(let i=0;i<7;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshBasicMaterial({color:'#a5f3fc'}));root.add(dot);shangqingFlows.push({dot,curve:descent,phase:i/7});}
  root.updateMatrixWorld(true);applyShangqingModel();
}
function applyShangqingModel(){const root=scene?.getObjectByName('shangqing-independent-space');if(!root)return;root.getObjectByName('shangqing-three-model').position.y=shangqingModel==='nine'?14:31;root.getObjectByName('shangqing-register-links').visible=shangqingLinks;for(let i=1;i<=9;i++)root.getObjectByName('shangqing-heaven-ring-'+i).material.opacity=selectedShangqingHeaven===i?0.95:0.45;for(let i=1;i<=39;i++){const dot=root.getObjectByName('shangqing-house-'+i);dot.material.color.set(selectedShangqingHouse===i?'#fde68a':'#a5f3fc');dot.scale.setScalar(selectedShangqingHouse===i?1.8:1);}}
function renderShangqingPanel(container){
  if(selectedIsland?.disk!=='shangqing')return;
  const panel=document.createElement('section');panel.className='sanqing-panel shangqing-panel';
  const add=(tag,text,parent=panel)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
  add('h3','上清經派：九天・天地名籍・身神');add('p','本座模型與靈寶六層主塔分立，各有自己的空間中心。圖像用來比較材料，不把兩套架構直接疊合。');
  const nav=add('div','');nav.className='shangqing-actions';
  for(const [id,name] of [['shangqing_nine_heavens','九天'],['shangqing_thirty_six','三十六天'],['shangqing_three_nine','三天／九天'],['shangqing_earth_register','天地名籍'],['shangqing_inner_body','三十九戶']]){const b=add('button',name,nav);b.type='button';b.setAttribute('aria-pressed',String(selectedIsland.id===id));b.addEventListener('click',()=>selectIslandById(id));}
  add('h4','九天名單與次序');
  if(selectedShangqingHeaven)add('p',`已選第 ${selectedShangqingHeaven} 天：${SHANGQING_HEAVENS[selectedShangqingHeaven-1]}`);
  const list=add('ol','');SHANGQING_HEAVENS.forEach((name,i)=>{const li=add('li','',list);const b=add('button',`${i+1}・${name}`,li);b.type='button';b.dataset.heaven=i+1;b.setAttribute('aria-pressed',String(selectedShangqingHeaven===i+1));b.addEventListener('click',()=>{const mesh=sceneReady&&!textView?clickableMeshes.find(m=>m.isSprite&&m.userData.shangqingHeaven===i+1):null;selectIsland(mesh?.userData||{data:ISLANDS_DATA.find(n=>n.id==='shangqing_nine_heavens'),shangqingHeaven:i+1});});});
  add('p','此名單依提供材料排列；同組天名亦見於靈寶《九天生神章經》系統，不能逕作全部早期上清經的統一名單。兜術／兜率、密／蜜及梵輔等字形須依底本核對；第八、九天所提梵迦摩夷、波梨答惒，先列為他系名稱比較線索，未確認與此二天完全同義。');
  add('h4','三天與九天：切換比較');const modes=add('div','');modes.className='shangqing-actions';
  for(const [key,title] of [['nine','九天骨幹／三天別號說'],['three','三天總攝／三炁生九炁']]){const b=add('button',title,modes);b.type='button';b.dataset.model=key;b.setAttribute('aria-pressed',String(shangqingModel===key));b.addEventListener('click',()=>{shangqingModel=key;if(sceneReady)applyShangqingModel();renderDrawer();});}
  add('p',shangqingModel==='nine'?'三天比較節點放入九天模型內，示意「別號／屬區」讀法；其經文定位與是否能證成九天高於三天，仍待底本與語境考證。':'三天比較節點升至九天之上，示意三炁各生三炁的總攝讀法；不是將所有上清材料改成同一晚出宇宙論。');
  add('p','三天總攝模式依提供的對應：始炁—清微天玉清境；元炁—禹餘天上清境；玄炁—大赤天太清境。此為特定模式的比較，不表示所有經典一致。');
  add('p','九組各四點＝36，以及九個主天另加27個分支＝36，在算術上都可成立；視覺分組不證明經典只有一種衍生算法。所提供《太真科》引文含「以木七，七名號真……乾木七」等疑似訛文，保留待核，不自行補字，也不依它演算三十六天。');
  add('h4','天地對應與名籍');add('p','本圖以36個光點表示天王數目，並將九壘排為3×3水平平面九宮格，每格保留四個土皇點。九宮格是閱讀用的視覺配置，不代表經文將九壘逐一對應洛書九宮或方位。文獻支持上下相應及仙籍上奏；不能把每對光線理解成已核實的逐名配屬，三十六國也不逕等於固定的現代地理國家。提供材料所述生死圖籍、青宮仙號的精確引文定位另待核。');
  const link=add('button',shangqingLinks?'隱藏天地對應示意線':'顯示天地對應示意線');link.type='button';link.dataset.action='register-links';link.setAttribute('aria-pressed',String(shangqingLinks));link.addEventListener('click',()=>{shangqingLinks=!shangqingLinks;if(sceneReady)applyShangqingModel();renderDrawer();});
  add('h4','三十九戶與徊風混合');add('p',selectedShangqingHouse?`已選象徵點 ${selectedShangqingHouse}／39；此編號只是介面定位，並非已核實的神名或器官對應。`:'選取大字人體上的光點，可檢視39個象徵位置。');
  add('p','《大洞真經》現存序文可見三十九帝皇迴真下映身中三十九戶與徊風混合之說；應區分傳本序文、經文與後世修法。天界至人身的流光僅示意下映關係，不是逐神逐戶的實際通路。模型雙臂展開、雙腿分開，39點分散於頭部、軀幹與四肢，配置僅為介面設計。此處的點位不作器官解剖圖，不將「辟非」逕定為心臟生理氣體，也不把修行敘述當成可實證的生理機制。');
  add('h4','考證狀態');
  const table=add('table','');for(const [title,status] of [
    ['《上清外國放品青童內文》〈高上九玄三十六天內音〉、雲笈七籤卷22','電子轉錄可見九壘、36土皇、上應36天、仙名上奏；字形與傳本差異待影像校核。'],
    ['《上清大洞真經》現存序文','電子轉錄可確認三十九戶、九天奇訣及徊風混合語彙；序文層次不能直接等同東晉原貌。'],
    ['《道教義樞》卷7相關材料','電子轉錄可確認九壘各四土皇；所提供三天別號說、太真科訛文及精確引文定位尚待核。'],
    ['東晉九天中心→劉宋三清升格','此為提供材料的歷史解釋框架；年代、文本關係與作者意圖需另證，未標為學界定論。'],
    ['「現象學翻轉」「天界摺疊於肉身」','現代分析語言，與古籍自身的存思、下映、徊風等語彙分開。']
  ]){const row=add('tr','',table);add('th',title,row);add('td',status,row);}
  add('p','引文與位置以電子轉錄初核，無法核對之原文不製成直接引文。模型不宣稱「九天高於三天」能由別號一語直接推出；不以單一路徑概括上清與靈寶的歷史。');
  container.prepend(panel);
}

function animateShangqing(time){const t=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:time*0.00006;for(const flow of shangqingFlows)flow.dot.position.copy(flow.curve.getPoint((t+flow.phase)%1));}

function openCosmologySpace(key){document.getElementById('node-group').value=key==='shangqing'?'shangqing':'cosmology_lingbao';document.getElementById('node-search').value='';renderNodeList();selectIslandById(key==='shangqing'?'shangqing_nine_heavens':'lingbao_daluo');}
