/* Fifth-layer diagram: geometry is a teaching reconstruction, not an ancient image. */
let selectedSanqingKey = null;
let selectedFourBrahmaKey = null;
let selectedKalpaRealmKey = null;
const sanqingFlows = [];

function sanqingText(lines, color, width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(8,15,31,0.96)';
  ctx.fillRect(0,0,width,height);
  ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(5,5,width-10,height-10);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((line,i) => {
    ctx.font = `${i === 0 ? 'bold ' : ''}${i === 0 ? 65 : 45}px "Microsoft JhengHei", "Noto Sans CJK TC", sans-serif`;
    ctx.fillStyle = i === 0 ? color : '#f1f5f9';
    ctx.fillText(line,width/2, height*(i+0.6)/(lines.length+0.2),width-48);
  });
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.scale.set(5.5,5.5*height/width,1);
  sprite.renderOrder = 10;
  return sprite;
}

// Contemporary low-poly teaching figures; source references appear in the reading panel.
function createSanqingFigure(realm,register) {
  const figure=new THREE.Group();figure.name='sanqing-deity-'+realm.key;
  const body=new THREE.Group();body.position.y=-1.2;figure.add(body);
  const gold=new THREE.MeshStandardMaterial({color:'#e6c778',metalness:0.65,roughness:0.32});
  const robe=new THREE.MeshStandardMaterial({color:({yuqing:'#286b81',shangqing:'#64528f',taiqing:'#a17a26'})[realm.key],metalness:0.25,roughness:0.55,emissive:realm.color,emissiveIntensity:0.12});
  const skin=new THREE.MeshStandardMaterial({color:'#bc9276',roughness:0.8});
  const hair=new THREE.MeshStandardMaterial({color:realm.key==='taiqing'?'#e2e8f0':'#293342',roughness:0.8});
  const ink=new THREE.MeshBasicMaterial({color:'#293342'});
  function add(geo,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);body.add(m);register(m);m.userData.focusObject=figure;return m;}
  const sphere=(r,mat,x,y,z,sx=1,sy=1,sz=1)=>add(new THREE.SphereGeometry(r,12,8),mat,x,y,z,sx,sy,sz);
  add(new THREE.CylinderGeometry(0.95,1.05,0.18,32),gold,0,0.12,0);
  add(new THREE.TorusGeometry(0.94,0.035,8,48),gold,0,0.23,0).rotation.x=Math.PI/2;
  const profile=[[0,0.22],[0.72,0.25],[0.65,0.55],[0.49,0.86],[0.36,1.17],[0.23,1.4]].map(([r,y])=>new THREE.Vector2(r,y));
  add(new THREE.LatheGeometry(profile,20),robe,0,0,0);
  sphere(0.45,robe,-0.32,0.39,0.26,1.35,0.45,0.75);sphere(0.45,robe,0.32,0.39,0.26,1.35,0.45,0.75);
  for(const side of [-1,1]){
    const sleeve=sphere(0.26,robe,side*0.39,0.95,0.22,0.9,1.5,0.9);sleeve.rotation.z=side*0.45;
    sphere(0.095,skin,side*0.25,0.98,0.49,1,0.7,1);
    const trim=add(new THREE.TorusGeometry(0.115,0.018,6,20),gold,side*0.27,0.98,0.43);trim.rotation.x=0.6;
  }
  sphere(0.25,hair,0,1.63,-0.035,1.08,1.28,1);
  sphere(0.245,skin,0,1.63,0.075,1,1.18,0.88);
  sphere(0.045,skin,0,1.61,0.29,0.8,1.3,0.7);
  for(const side of [-1,1]){const eye=add(new THREE.TorusGeometry(0.045,0.01,4,12,Math.PI),ink,side*0.09,1.66,0.275);eye.rotation.z=Math.PI;}
  const beard=add(new THREE.ConeGeometry(0.145,realm.key==='taiqing'?0.57:0.42,16),hair,0,1.26,0.27);beard.rotation.z=Math.PI;
  add(new THREE.CylinderGeometry(0.23,0.26,0.13,20),gold,0,1.95,0);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;sphere(0.08,gold,Math.cos(a)*0.18,2.05,Math.sin(a)*0.18,0.75,1.8,0.75);}
  const halo=add(new THREE.TorusGeometry(0.61,0.025,6,32),new THREE.MeshBasicMaterial({color:realm.color,transparent:true,opacity:0.75,depthWrite:false}),0,1.6,-0.28);halo.name='deity-halo-'+realm.key;
  if(realm.key==='shangqing'){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-0.21,0.82,0.57),new THREE.Vector3(0,1.08,0.59),new THREE.Vector3(0.27,1.27,0.59)]);
    const stem=add(new THREE.TubeGeometry(curve,18,0.035,8,false),gold,0,0,0);stem.name='sanqing-attribute-ruyi';
    sphere(0.075,gold,0.27,1.27,0.59,1.3,0.7,0.5);sphere(0.055,gold,0.2,1.3,0.59);sphere(0.055,gold,0.34,1.3,0.59);
  } else if(realm.key==='taiqing'){
    const fan=new THREE.Shape();fan.moveTo(0,0);fan.absarc(0,0,0.38,Math.PI*0.12,Math.PI*0.88,false);fan.lineTo(0,0);
    const leaf=add(new THREE.ShapeGeometry(fan),new THREE.MeshStandardMaterial({color:'#f5e6bd',side:THREE.DoubleSide,roughness:0.8}),0.15,1.02,0.61);leaf.name='sanqing-attribute-fan';
    for(let i=0;i<7;i++){const a=Math.PI*(0.12+i*0.76/6);const curve=new THREE.LineCurve3(new THREE.Vector3(0.15,1.02,0.63),new THREE.Vector3(0.15+Math.cos(a)*0.38,1.02+Math.sin(a)*0.38,0.63));add(new THREE.TubeGeometry(curve,1,0.006,4,false),gold,0,0,0);}
  }
  return figure;
}

function buildSanqingRealms(parent) {
  const data = ISLANDS_DATA.find(node => node.id === 'lingbao_sanqing');
  if (!data?.sanqing) return;
  const group = new THREE.Group();
  group.name = 'sanqing-realms';
  group.position.set(0,22,0);
  parent.add(group);
  const bridgeCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,28.4,0),new THREE.Vector3(0,27.2,0),new THREE.Vector3(0,25.7,0)]);
  const bridge=new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve,32,0.055,8,false),new THREE.MeshBasicMaterial({color:'#f5d58c',transparent:true,opacity:0.55}));
  bridge.name='daluo-sanqing-bridge';parent.add(bridge);
  const focus = new THREE.Vector3(COSMOLOGY_CENTER.x,23.5,COSMOLOGY_CENTER.z);
  function clickable(object,key=null) {
    object.userData = {data,focusPos:focus,sanqingKey:key,focusObject:object};
    if(object.isSprite) object.userData.markerMesh=object;
    clickableMeshes.push(object);
    return object;
  }
  const sourcePos = new THREE.Vector3(0,3.7,0);
  const source = new THREE.Mesh(new THREE.SphereGeometry(0.56,32,24),new THREE.MeshStandardMaterial({color:'#fff7cc',emissive:'#facc15',emissiveIntensity:1.7,roughness:0.2}));
  source.position.copy(sourcePos); group.add(clickable(source));
  const sourceLabel=sanqingText(['大羅一炁','三炁分化・模式 A 示意'],'#fde68a',1024,300);
  sourceLabel.position.set(0,4.9,0); sourceLabel.scale.set(5,1.46,1); group.add(clickable(sourceLabel));
  data.sanqing.realms.forEach((realm,index)=>{
    // One rear vertex and two forward vertices, all within the fifth layer.
    const vertices = [[0,0.35,-3.4],[-4.6,-0.25,3.2],[4.6,-0.25,3.2]];
    const [x,y,z] = vertices[index];
    const center=new THREE.Vector3(x,y,z);
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.45,0.38,48),new THREE.MeshStandardMaterial({color:realm.color,transparent:true,opacity:0.48,metalness:0.5,roughness:0.25}));
    platform.position.copy(center); group.add(clickable(platform,realm.key));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(2.17,0.065,8,64),new THREE.MeshBasicMaterial({color:realm.color}));
    rim.rotation.x=Math.PI/2; rim.position.set(x,y+0.24,z);group.add(rim);
    const figure=createSanqingFigure(realm,object=>clickable(object,realm.key));
    figure.position.set(x,y+1.45,z);figure.rotation.y=Math.atan2(x,z);group.add(figure);
    const curve=new THREE.CatmullRomCurve3([sourcePos.clone(),new THREE.Vector3(x*0.55,3.2,z*0.55),new THREE.Vector3(x,y+2.6,z),new THREE.Vector3(x,y+1.95,z)]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,40,0.045,8,false),new THREE.MeshBasicMaterial({color:realm.color,transparent:true,opacity:0.7})));
    const qiLabel=sanqingText([realm.qi],realm.color,640,180);
    qiLabel.scale.set(2.3,0.65,1);qiLabel.position.set(x,y+2.8,z+0.35);group.add(clickable(qiLabel,realm.key));
    for(let i=0;i<4;i++) {
      const particle=new THREE.Mesh(new THREE.SphereGeometry(0.075,8,8),new THREE.MeshBasicMaterial({color:realm.color}));group.add(particle);
      sanqingFlows.push({particle,curve,phase:i/4});
    }
    const label=sanqingText([`${realm.heaven}・${realm.realm}`,`${realm.deity}（${realm.lord}）`,`《${realm.scripture}》十二部 → ${realm.audience}`],realm.color);
    label.scale.set(4.25,2.125,1);
    label.position.set(x,y-1.55,z+1.0);group.add(clickable(label,realm.key));
  });
  const triangle = [new THREE.Vector3(0,0.08,-3.4),new THREE.Vector3(-4.6,-0.52,3.2),new THREE.Vector3(4.6,-0.52,3.2)];
  const frame = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(triangle),new THREE.LineBasicMaterial({color:'#a5b4fc',transparent:true,opacity:0.55}));
  frame.name='sanqing-triangle';group.add(frame);
  const foot=sanqingText(['第二層・三清勝境','三炁 → 三天三境 → 三洞經教'],'#cbd5e1',1024,260);
  foot.scale.set(6,1.52,1);foot.position.set(0,-4.1,4.0);group.add(clickable(foot));
}

function animateSanqingFlow(time) {
  const t=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:time*0.00012;
  sanqingFlows.forEach(({particle,curve,phase})=>particle.position.copy(curve.getPoint((t+phase)%1)));
}

function renderSanqingPanel(container) {
  const model=selectedIsland?.sanqing;
  if(!model) return;
  const section=document.createElement('section');section.className='sanqing-panel';
  const heading=document.createElement('h3');heading.textContent='一炁化三炁・三天三境對應';section.append(heading);
  const help=document.createElement('p');help.textContent='點選 3D 境臺可對照下方內容；三座境臺以前後錯落的立體三角呈現，仍屬靈寶第二層。三角配置、位置、色彩與尊神坐像為當代教學設計，不代表經文記載的方位、尊卑或特定時代造像。';section.append(help);
  const iconography=document.createElement('p');iconography.className='evidence-note';iconography.textContent='造型辨識：元始天尊採虛拈虛捧手勢示意；靈寶天尊持如意；道德天尊持扇。冠飾、道袍、頭光與坐姿為簡化設計。參考國史館臺灣文獻館《臺灣民俗文物辭典》「三清道祖」（辭條 1255）、國立臺灣歷史博物館〈靈寶天尊畫像掛軸〉（2003.001.0997）及國立歷史博物館〈天清三寶天尊〉（07395）。持物、造像與排列有文本及時代差異；本圖未複製館藏圖像，也非歷史造像復原。';section.append(iconography);
  for(const realm of model.realms){
    const card=document.createElement('article');card.className='sanqing-card';card.dataset.realm=realm.key;card.dataset.selected=String(selectedSanqingKey===realm.key);card.style.setProperty('--realm-color',realm.color);
    const title=document.createElement('h4');title.textContent=`${realm.qi} → ${realm.heaven}・${realm.realm}`;card.append(title);
    const body=document.createElement('p');body.textContent=`尊神對應：${realm.deity}；原文稱「${realm.lord}」。`;card.append(body);
    const teaching=document.createElement('p');teaching.textContent=`出《${realm.scripture}》十二部，以教天中${realm.audience}。`;card.append(teaching);
    section.append(card);
  }
  const source=document.createElement('p');source.className='source-record';source.textContent='文獻出處：'+model.sourceLabel;section.append(source);
  const note=document.createElement('p');note.className='sanqing-source-note';note.textContent=model.sourceNote;section.append(note);
  container.prepend(section);
}

function buildFourBrahmaPalaces(parent) {
  const data=ISLANDS_DATA.find(n=>n.id==='lingbao_four_brahma');
  if(!data?.fourBrahma) return;
  const group=new THREE.Group();group.name='four-brahma-palaces';group.position.y=16;
  parent.add(group);
  data.fourBrahma.realms.forEach(realm=>{
    const palace=new THREE.Group();palace.position.fromArray(realm.position);group.add(palace);
    function register(object){
      object.userData={data,fourBrahmaKey:realm.key,focusObject:object,focusPos:new THREE.Vector3(COSMOLOGY_CENTER.x+realm.position[0],COSMOLOGY_CENTER.y+16,COSMOLOGY_CENTER.z+realm.position[2])};
      if(object.isSprite) object.userData.markerMesh=object;
      clickableMeshes.push(object);palace.add(object);return object;
    }
    const material=new THREE.MeshStandardMaterial({color:realm.color,emissive:realm.color,emissiveIntensity:0.18,metalness:0.25,roughness:0.35});
    const base=register(new THREE.Mesh(new THREE.CylinderGeometry(0.85,1,0.2,32),material));base.position.y=0.35;
    for(const x of [-0.48,0.48])for(const z of [-0.36,0.36]){const pillar=register(new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.07,0.85,10),material));pillar.position.set(x,0.85,z);}
    const roof=register(new THREE.Mesh(new THREE.ConeGeometry(1.05,0.4,4),material));roof.rotation.y=Math.PI/4;roof.position.y=1.45;
    const label=sanqingText([`${realm.direction}・${realm.palace}`,realm.heaven],realm.color,1024,380);
    label.scale.set(2.6,0.96,1);label.position.set(0,2.3,0);register(label);
  });
}

function renderFourBrahmaPanel(container) {
  const model=selectedIsland?.fourBrahma;if(!model)return;
  const panel=document.createElement('section');panel.className='four-brahma-panel';
  const title=document.createElement('h3');title.textContent='四種民天・四宮對照';panel.append(title);
  const intro=document.createElement('p');intro.textContent=model.hierarchy.join(' ↓ ');intro.className='hierarchy-strip';panel.append(intro);
  const grid=document.createElement('div');grid.className='four-brahma-grid';
  for(const realm of model.realms){
    const card=document.createElement('article');card.className='four-brahma-card';card.dataset.selected=String(selectedFourBrahmaKey===realm.key);card.style.setProperty('--realm-color',realm.color);
    const heading=document.createElement('h4');heading.textContent=`${realm.direction}・${realm.palace}`;card.append(heading);
    const text=document.createElement('p');text.textContent=realm.heaven;card.append(text);grid.append(card);
  }
  panel.append(grid);
  if(model.salvation){
    const section=document.createElement('section');section.className='salvation-path';
    const title=document.createElement('h4');title.textContent=model.salvation.title;section.append(title);
    const list=document.createElement('ol');for(const text of model.salvation.path){const li=document.createElement('li');li.textContent=text;list.append(li);}section.append(list);
    const caution=document.createElement('p');caution.className='evidence-note';caution.textContent=model.salvation.note;section.append(caution);panel.append(section);
  }
  const note=document.createElement('p');note.className='evidence-note';note.textContent=model.note;panel.append(note);
  if(currentMode==='course'){
    const h=document.createElement('h4');h.textContent='建議研讀順序';panel.append(h);
    const list=document.createElement('ol');
    for(const item of ['畫出二十八天、四種民天、三清與大羅的層級','將四天與四宮逐項對讀，檢查方位依據','比較三災與清淨炁的正文、注疏所指','區分避劫受迎、劫後下化與現代種子庫比喻']){const li=document.createElement('li');li.textContent=item;list.append(li);}panel.append(list);
  }
  if(currentMode==='researcher'){
    for(const source of model.sources){const card=document.createElement('article');card.className='source-record';
      const heading=document.createElement('h4');heading.textContent=source.label;card.append(heading);
      const scope=document.createElement('p');scope.textContent=source.scope;card.append(scope);
      const status=document.createElement('p');status.className='evidence-note';status.textContent=source.status;card.append(status);panel.append(card);
    }
  }
  container.prepend(panel);
}

function renderCosmogonyPanel(container) {
  const model=selectedIsland?.cosmogony;if(!model)return;
  const panel=document.createElement('section');panel.className='cosmogony-panel';
  const add=(parent,tag,text,className)=>{const element=document.createElement(tag);element.textContent=text;if(className)element.className=className;parent.append(element);return element;};
  add(panel,'h3',model.title);add(panel,'p',model.sourceSummary,'hierarchy-strip');
  add(panel,'p','第一層：大羅天 → 第二層：三清勝境；層號是本介面的教學分類。','evidence-note');
  for(const pattern of model.models){
    const card=add(panel,'section','', 'cosmogony-model');card.dataset.model=pattern.key;
    add(card,'h4',pattern.title);add(card,'p',pattern.sequence,'model-sequence');
    const wrap=add(card,'div','','comparison-scroll');const table=document.createElement('table');wrap.append(table);
    const caption=document.createElement('caption');caption.textContent=pattern.key==='A'?'3D 三境沿用此組炁名；色象另列，不冒充模型配色。':'此組炁名配天與模式 A 不同；不混入同一 3D 對應。';table.append(caption);
    const head=document.createElement('thead');table.append(head);const row=document.createElement('tr');head.append(row);
    for(const heading of ['炁名','色象','天境']){const th=add(row,'th',heading);th.scope='col';}
    const body=document.createElement('tbody');table.append(body);
    for(const item of pattern.rows){const row=document.createElement('tr');body.append(row);for(const text of item.slice(0,3))add(row,'td',text);}
    if(pattern.key==='A'){
      const teaching=add(card,'div','','teaching-links');
      for(const item of pattern.rows)add(teaching,'p',`${item[0]} → ${item[3]} → ${item[4]}`);
    }
    if(currentMode!=='beginner'){add(card,'p',pattern.source,'source-record');add(card,'p',pattern.note,'evidence-note');}
  }
  const nine=add(panel,'section','','nine-qi-panel');add(nine,'h4','九炁九天・前三章例');
  for(const item of model.nineExamples)add(nine,'p',`${item.heaven} → ${item.qi}`);
  for(const entry of model.numbers){const card=add(panel,'section','','counting-card');add(card,'h4',entry.label);add(card,'p',entry.formula,'model-sequence');add(card,'p',entry.note);}
  if(currentMode==='researcher')for(const source of model.sources){const card=add(panel,'article','','source-record');add(card,'h4',source.title);add(card,'p',source.finding);add(card,'p',source.status,'evidence-note');}
  add(panel,'p',model.note,'evidence-note');container.prepend(panel);
}

function buildKalpaBoundary(parent,data) {
  if(!data?.kalpaBoundary)return null;
  const group=new THREE.Group();group.name='kalpa-three-realms';group.position.y=0.6;parent.add(group);
  data.kalpaBoundary.realms.forEach((realm,index)=>{
    const radius=7.0-index*0.7, y=index*5;
    const realmData=ISLANDS_DATA.find(n=>n.id===realm.nodeId)||data;
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,0.14,64),new THREE.MeshStandardMaterial({color:realm.color,transparent:true,opacity:0.28,roughness:0.5,metalness:0.15}));
    platform.position.y=y;platform.name="tower-layer-"+(index+1);group.add(platform);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,0.032,6,64),new THREE.MeshBasicMaterial({color:realm.color}));ring.rotation.x=Math.PI/2;ring.position.y=y+0.09;group.add(ring);
    const tickPositions=[];
    for(let i=0;i<realm.count;i++){
      const angle=i*Math.PI*2/realm.count;
      tickPositions.push(new THREE.Vector3(Math.cos(angle)*(radius-0.2),y+0.1,Math.sin(angle)*(radius-0.2)),new THREE.Vector3(Math.cos(angle)*radius,y+0.1,Math.sin(angle)*radius));
    }
    const ticks=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPositions),new THREE.LineBasicMaterial({color:realm.color}));ticks.name='kalpa-ticks-'+realm.key;group.add(ticks);
    const label=sanqingText([`第三層・${realm.name} ${realm.count}天`],realm.color,768,200);label.scale.set(3.2,0.83,1);label.position.set(0,y+0.35,radius+0.3);group.add(label);
    const userData={data:realmData,kalpaRealmKey:realm.key,markerMesh:label,focusObject:label,focusPos:new THREE.Vector3(KALPA_CENTER.x,KALPA_CENTER.y+0.6+y,KALPA_CENTER.z+radius+0.3)};
    platform.userData=userData;label.userData=userData;clickableMeshes.push(platform,label);
  });
  const boundary=new THREE.Mesh(new THREE.TorusGeometry(5.3,0.065,8,96),new THREE.MeshBasicMaterial({color:'#f5d58c',transparent:true,opacity:0.8}));boundary.rotation.x=Math.PI/2;boundary.position.y=12.8;boundary.name='kalpa-boundary-ring';group.add(boundary);
  const label=sanqingText(['劫運斷界〔示意〕','三界二十八天 → 種民避劫'],'#f5d58c',1024,300);label.scale.set(3.2,0.94,1);label.position.set(0,13.3,5.6);group.add(label);
  label.userData={data,focusObject:label,markerMesh:label,focusPos:new THREE.Vector3(KALPA_CENTER.x,KALPA_CENTER.y+13.9,KALPA_CENTER.z+5.6)};boundary.userData=label.userData;clickableMeshes.push(boundary,label);
  return group;
}

function renderKalpaBoundaryPanel(container) {
  const model=selectedIsland?.kalpaBoundary;if(!model)return;
  const panel=document.createElement('section');panel.className='kalpa-boundary-panel';
  const add=(parent,tag,text,cls)=>{const item=document.createElement(tag);item.textContent=text;if(cls)item.className=cls;parent.append(item);return item;};
  add(panel,'h3',model.title);
  const stack=add(panel,'div','','kalpa-realm-stack');
  for(const realm of [...model.realms].reverse()){
    const row=add(stack,'div',`${realm.name}・${realm.count}天`,'kalpa-realm-row');row.style.setProperty('--realm-color',realm.color);row.dataset.realm=realm.key;row.dataset.selected=String(selectedKalpaRealmKey===realm.key);
  }
  add(panel,'p','6 ＋ 18 ＋ 4 ＝ 28 天・統稱三界','model-sequence');
  add(panel,'p',model.inside);
  add(panel,'p',model.boundary,'boundary-divider');
  add(panel,'p',model.outside);
  const actions=add(panel,'div','','kalpa-related-actions');
  for(const [id,text] of [['lingbao_three_realms','查看三界層'],['lingbao_four_brahma','查看四種民天']]){
    const button=add(actions,'button',text);button.type='button';button.addEventListener('click',()=>selectIslandById(id));
  }
  if(currentMode!=='beginner'){
    add(panel,'h4','劫名與功能分讀');
    for(const stage of model.stages)add(panel,'p',`${stage.name}：${stage.function}`);
    add(panel,'p',model.nameNote,'evidence-note');
  }
  if(currentMode==='researcher')for(const source of model.sources){const card=add(panel,'article','','source-record');add(card,'h4',source.title);add(card,'p',source.finding);add(card,'p',source.status,'evidence-note');}
  add(panel,'p',model.scopeNote,'evidence-note');container.prepend(panel);
}

function renderUpperSynthesisPanel(container) {
  const model=selectedIsland?.upperSynthesis;if(!model)return;
  const panel=document.createElement('section');panel.className='upper-synthesis-panel';
  for(const [tag,text] of [['h3',model.title],['p',model.history],['p',model.practice]]){const item=document.createElement(tag);item.textContent=text;panel.append(item);}
  if(currentMode!=='beginner')for(const text of [model.evidence,model.limits]){const item=document.createElement('p');item.className='evidence-note';item.textContent=text;panel.append(item);}
  container.prepend(panel);
}

let selectedWuqiLayer=null;
function buildWuqiAcross(parent) {
  const model=ISLANDS_DATA.find(n=>n.id==='proto_center')?.wuqiAcross;if(!model)return;
  const group=new THREE.Group();group.name='wuqi-across-six-layers';parent.add(group);
  const sourcePoint=new THREE.Vector3(0,31,0);
  const source=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12),new THREE.MeshBasicMaterial({color:'#fff2cc'}));source.position.copy(sourcePoint);group.add(source);
  source.userData={data:ISLANDS_DATA.find(n=>n.id==='lingbao_daluo'),focusContext:'tower',focusObject:source,focusPos:sourcePoint.clone().add(new THREE.Vector3(COSMOLOGY_CENTER.x,COSMOLOGY_CENTER.y,COSMOLOGY_CENTER.z))};clickableMeshes.push(source);
  const angles={proto_east:0,proto_south:-Math.PI/2,proto_west:Math.PI,proto_north:Math.PI/2,proto_center:Math.PI/4};
  for(const direction of model.directions){
    const angle=angles[direction.id], center=direction.id==='proto_center';
    const points=[sourcePoint.clone()];
    for(const layer of model.layers.slice(1)){
      const radius=center?0.65:layer.rank===2?4.4:layer.rank===6?9.0:8.6;
      if(layer.rank===4)points.push(new THREE.Vector3(center?0:Math.cos(angle)*4.5,PROTO_HEIGHT,center?0:-Math.sin(angle)*4.5));
      const point=new THREE.Vector3(Math.cos(angle)*radius,layer.y,-Math.sin(angle)*radius);points.push(point);
      const dot=new THREE.Mesh(new THREE.SphereGeometry(layer.rank===3 || layer.rank===4?0.23:0.14,10,8),new THREE.MeshBasicMaterial({color:direction.color}));dot.position.copy(point);dot.name=`wuqi-${direction.id}-layer-${layer.rank}`;group.add(dot);
      dot.userData={data:ISLANDS_DATA.find(n=>n.id===direction.id),focusContext:'tower',towerWuqiKey:direction.id,towerWuqiLayer:layer.rank,focusObject:dot,focusPos:point.clone().add(new THREE.Vector3(COSMOLOGY_CENTER.x,COSMOLOGY_CENTER.y,COSMOLOGY_CENTER.z))};clickableMeshes.push(dot);
    }
    const flow=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),90,0.023,5,false),new THREE.MeshBasicMaterial({color:direction.color,transparent:true,opacity:0.25,depthWrite:false}));flow.name='wuqi-flow-'+direction.id;flow.userData.wuqiFlow=true;group.add(flow);
  }
}
function highlightWuqiAcross() {
  const group=scene?.getObjectByName('wuqi-across-six-layers');if(!group)return;
  for(const direction of ISLANDS_DATA.find(n=>n.id==='proto_center').wuqiAcross.directions){
    const flow=group.getObjectByName('wuqi-flow-'+direction.id);flow.material.opacity=selectedIsland?.id===direction.id?0.8:0.25;
  }
}
function renderWuqiAcrossPanel(container) {
  const model=selectedIsland?.wuqiAcross;if(!model)return;
  const panel=document.createElement('details');panel.className='wuqi-across-panel';panel.open=selectedIsland.disk==='proto_lingbao'||selectedIsland.id==='lingbao_earth_realm'||currentMode==='researcher';
  const add=(parent,tag,text,cls)=>{const item=document.createElement(tag);item.textContent=text;if(cls)item.className=cls;parent.append(item);return item;};
  add(panel,'summary',model.title);add(panel,'p',model.placement,'hierarchy-strip');add(panel,'p',model.interpretation,'evidence-note');add(panel,'p','由上而下編號；第三層天界、第四層天—地—人對應為重點顯化區。','hierarchy-strip');
  const stack=add(panel,'div','','wuqi-layer-list');
  for(const layer of model.layers){const button=add(stack,'button',`${layer.rank}・${layer.name}`);button.type='button';button.dataset.rank=layer.rank;button.dataset.selected=String(selectedWuqiLayer===layer.rank);button.addEventListener('click',()=>selectIslandById(layer.id));add(stack,'p',layer.role);}
  const wrap=add(panel,'div','','comparison-scroll');const table=add(wrap,'table','');add(table,'caption','五星・五嶽・五臟對照：山名與完整配對仍須核對版本。');
  const head=add(table,'thead',''), tr=add(head,'tr','');for(const text of ['方位／天氣','五星','五嶽','五臟']){const th=add(tr,'th',text);th.scope='col';}
  const body=add(table,'tbody','');
  for(const direction of model.directions){const row=add(body,'tr','');row.dataset.direction=direction.id;row.dataset.selected=String(selectedIsland.id===direction.id);add(row,'td',direction.direction+'・'+direction.qi);add(row,'td',direction.planet);add(row,'td',direction.mountain);add(row,'td',direction.organ);}
  add(panel,'h4','第三層・五方國土〔提供材料，逐項待核〕');for(const direction of model.directions)add(panel,'p',`${direction.direction}：${direction.kingdom}`);
  add(panel,'h4','中央氣數・分文本保留');for(const entry of model.numbers)add(panel,'p',`${entry.value}：${entry.context}`);
  add(panel,'h4','金允中模式・青黃白／三境／三田');for(const entry of model.jinYunzhong)add(panel,'p',`${entry.color} → ${entry.realm} → ${entry.field} → ${entry.organ}`);
  add(panel,'p','此組青黃白出自齋壇存炁語境，不以相同顏色之名強行合併三炁模式 A、B。','evidence-note');
  if(currentMode==='researcher')for(const source of model.sources){const card=add(panel,'article','','source-record');add(card,'h4',source.title);add(card,'p',source.finding);add(card,'p',source.status,'evidence-note');}
  add(panel,'p',model.note,'evidence-note');container.prepend(panel);
}

let selectedYujingPart=null;
function buildYujingCore(group,data,baseY){
  const gold=new THREE.MeshStandardMaterial({color:'#bfa461',metalness:0.6,roughness:0.35});
  const jade=new THREE.MeshStandardMaterial({color:'#40566f',metalness:0.35,roughness:0.4});
  const book=new THREE.Group();book.name='yujing-scripture';book.position.set(0,4.15,0);group.add(book);
  const palace=new THREE.Group();palace.name='yujing-purple-palace';palace.position.y=3;group.add(palace);
  const attendants=new THREE.Group();attendants.name='yujing-attendants';attendants.position.y=2.2;group.add(attendants);
  function register(object,part,focus){object.userData={data,yujingPart:part,axisPart:part!=='overview',focusContext:'tower',focusObject:focus,focusPos:new THREE.Vector3(COSMOLOGY_CENTER.x,baseY+focus.position.y,COSMOLOGY_CENTER.z)};if(object.isSprite)object.userData.markerMesh=object;clickableMeshes.push(object);return object;}
  function mesh(parent,geo,mat,x,y,z,part,focus){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);register(m,part,focus);return m;}
  // Open architecture keeps the scripture visible within the upper sanctuary.
  mesh(palace,new THREE.CylinderGeometry(1.65,1.85,0.22,8),jade,0,0.26,0,'palace',palace);
  for(const x of [-1.25,1.25])for(const z of [-1.25,1.25])mesh(palace,new THREE.CylinderGeometry(0.07,0.09,3.1,10),gold,x,0.4,z,'palace',palace);
  const roofMaterial=gold.clone();roofMaterial.transparent=true;roofMaterial.opacity=0.2;roofMaterial.depthWrite=false;
  const roof=mesh(palace,new THREE.ConeGeometry(2.0,0.7,4),roofMaterial,0,2.28,0,'palace',palace);roof.rotation.y=Math.PI/4;roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(roof.geometry),new THREE.LineBasicMaterial({color:'#d4bd7e',transparent:true,opacity:0.65})));
  mesh(palace,new THREE.CylinderGeometry(0.6,0.8,0.22,8),gold,0,0.56,0,'scripture',book);
  for(let i=0;i<3;i++){
    const leaf=mesh(book,new THREE.BoxGeometry(0.34,1.08,0.09),new THREE.MeshStandardMaterial({color:['#79c6cf','#b8b1dc','#d7c38a'][i],emissive:'#e6dcb1',emissiveIntensity:0.16,metalness:0.3,roughness:0.4}),(i-1)*0.4,0,0,'scripture',book);
    for(let row=0;row<3;row++)mesh(book,new THREE.BoxGeometry(0.18,0.012,0.012),gold,(i-1)*0.4,0.25-row*0.21,0.055,'scripture',book);
  }
  const bookLabel=sanqingText(['三寶神經','七寶玄臺・藏經核心'],'#fde68a',1024,300);bookLabel.scale.set(3.2,0.94,1);bookLabel.position.set(0,3.5,2.0);group.add(register(bookLabel,'scripture',book));
  const labels=[['無上大羅天／極致虛空','超越性場域・非實體天幕',0,6.3,-1,'overview'],['玄都玉京山・七寶城闕','中央藏經・八方寶林',0,-0.55,6.2,'overview'],['紫微上宮／劫仞臺','元始／大道君治所說〔待核〕',-4.1,3.2,1.5,'palace'],['七寶騫林／靈禽神獸','八樹覆八方・靈風成宮商',4.1,3.2,1.5,'forest']];
  labels.forEach(([a,b,x,y,z,part])=>{const label=sanqingText([a,b],'#d6d3ed',1024,280);label.scale.set(3.7,1.01,1);label.position.set(x,y,z);group.add(register(label,part,label));});
  for(let i=0;i<10;i++){
    const a=i*Math.PI*2/10,person=new THREE.Group();person.name='yujing-worshipper-'+i;person.position.set(Math.cos(a)*3.05,0,Math.sin(a)*3.05);person.rotation.y=Math.atan2(-person.position.x,-person.position.z);attendants.add(person);
    mesh(person,new THREE.ConeGeometry(0.16,0.43,8),new THREE.MeshStandardMaterial({color:'#a7b8d1',roughness:0.7}),0,0.2,0,'ritual',attendants);
    mesh(person,new THREE.SphereGeometry(0.085,10,8),gold,0,0.48,0,'ritual',attendants);
    mesh(person,new THREE.BoxGeometry(0.22,0.065,0.09),gold,0,0.31,0.12,'ritual',attendants);
  }
  const ritualLabel=sanqingText(['聖眾旋繞玄臺・誦詠朝禮','十方代表造型・環行示意'],'#cbd5e1',1024,260);ritualLabel.scale.set(4.4,1.12,1);ritualLabel.position.set(0,1.4,4.0);group.add(register(ritualLabel,'ritual',attendants));
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(3+i*0.65,0.015,4,64),new THREE.MeshBasicMaterial({color:'#a5b4fc',transparent:true,opacity:0.16,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=1.6+i*0.14;ring.name='yujing-wind-'+i;group.add(ring);}
  group.userData.ritualGroup=attendants;
}
function animateYujingRitual(time){
  const group=scene?.getObjectByName('yujing-sanctuary');if(!group)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  group.userData.ritualGroup.rotation.y=reduced?0:time*0.00004;
  for(let i=0;i<3;i++){const ring=group.getObjectByName('yujing-wind-'+i);ring.material.opacity=reduced?0.16:0.1+0.08*(1+Math.sin(time*0.0007+i));}
}
function renderYujingPanel(container){
  if(selectedIsland?.id!=='lingbao_daluo')return;
  const panel=document.createElement('section');panel.className='sanqing-panel yujing-panel';
  const add=(tag,text,parent=panel)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
  add('h3','玉京山：藏經核心與宇宙朝禮');
  const map=add('div','');map.className='yujing-map';
  add('p','無上大羅天／極致虛空',map);add('p','玄都玉京山・七寶城闕',map);
  const branches=add('div','',map);branches.className='yujing-branches';add('p','紫微上宮／劫仞臺：藏經；元始／大道君治所說待逐文本對讀',branches);add('p','七寶騫林／靈禽神獸：八方寶林、宮商之音',branches);
  const descriptions={overview:'玉京山神聖景觀總覽。',scripture:'天書置於上層中央開放式宮闕內；三片玉簡為三寶神經的象徵，並非卷數或古文字復原。',palace:'紫微上宮與劫仞臺並列作閱讀索引，並不宣稱二名完全同義或固定建築平面。',forest:'八方各一株寶樹；光環表達靈風與宮商之音，未自動播放音樂。',ritual:'十組代表造型面向中央，環行朝禮；不將十方理解為只有十位尊神。環行速度與人數屬視覺設計。'};
  add('p',descriptions[selectedYujingPart||'overview']);
  add('h4','原文與詮釋分層');
  add('p','《洞玄靈寶玉京山步虛經》電子轉錄見「上有玉京金闕七寶玄臺紫微上宮，中有三寶神經」，並述八方寶樹、聖眾旋繞七寶玄臺三周匝與靈風成宮商。天書的核心地位有文本依據；本圖的精確高度、左右分支與建築層次為教學安排，不能由「中有」逕推唯一的最高物理座標。');
  add('p','治所須分文本：《步虛經》此段作太上無極虛皇天尊之治；《度人上品妙經四註》相關注解另見高上玉皇及劫仞臺之說。使用者提出的元始天尊／大道君治所，須逐文本對讀，不直接覆蓋上述差異。');
  add('p','「朝衛靈文於玉山之中」依使用者提供材料作主題提示；完整底本與具體段落尚待核對。朝衛靈文與《步虛經》旋繞玄臺之描寫分列，不將一匝與三周匝合成同一儀程。電子轉錄初核，底本影像與異文待核。');
  container.prepend(panel);
}
