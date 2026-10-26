/* Fifth-layer diagram: geometry is a teaching reconstruction, not an ancient image. */
let selectedSanqingKey = null;
let selectedFourBrahmaKey = null;
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

function buildSanqingRealms(parent) {
  const data = ISLANDS_DATA.find(node => node.id === 'lingbao_sanqing');
  if (!data?.sanqing) return;
  const group = new THREE.Group();
  group.name = 'sanqing-realms';
  group.position.set(0,22,4.5);
  parent.add(group);
  const bridgeCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,28.4,2.5),new THREE.Vector3(0,27.2,3.6),new THREE.Vector3(0,25.7,4.7)]);
  const bridge=new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve,32,0.055,8,false),new THREE.MeshBasicMaterial({color:'#f5d58c',transparent:true,opacity:0.55}));
  bridge.name='daluo-sanqing-bridge';parent.add(bridge);
  const focus = new THREE.Vector3(COSMOLOGY_CENTER.x,23.5,COSMOLOGY_CENTER.z+4.5);
  function clickable(object,key=null) {
    object.userData = {data,focusPos:focus,sanqingKey:key,focusObject:object};
    if(object.isSprite) object.userData.markerMesh=object;
    clickableMeshes.push(object);
    return object;
  }
  const sourcePos = new THREE.Vector3(0,3.7,0.2);
  const source = new THREE.Mesh(new THREE.SphereGeometry(0.56,32,24),new THREE.MeshStandardMaterial({color:'#fff7cc',emissive:'#facc15',emissiveIntensity:1.7,roughness:0.2}));
  source.position.copy(sourcePos); group.add(clickable(source));
  const sourceLabel=sanqingText(['大羅一炁','三炁分化・模式 A 示意'],'#fde68a',1024,300);
  sourceLabel.position.set(0,4.9,0.2); sourceLabel.scale.set(5,1.46,1); group.add(clickable(sourceLabel));
  data.sanqing.realms.forEach((realm,index)=>{
    // One rear vertex and two forward vertices, all within the fifth layer.
    const vertices = [[0,0.35,-3.4],[-4.6,-0.25,3.2],[4.6,-0.25,3.2]];
    const [x,y,z] = vertices[index];
    const center=new THREE.Vector3(x,y,z);
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.45,0.38,48),new THREE.MeshStandardMaterial({color:realm.color,transparent:true,opacity:0.48,metalness:0.5,roughness:0.25}));
    platform.position.copy(center); group.add(clickable(platform,realm.key));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(2.17,0.065,8,64),new THREE.MeshBasicMaterial({color:realm.color}));
    rim.rotation.x=Math.PI/2; rim.position.set(x,y+0.24,z);group.add(rim);
    // A symbolic sanctuary: four columns and a roof, without invented deity iconography.
    const sanctuary=new THREE.Group();sanctuary.position.set(x,y+0.25,z);group.add(sanctuary);
    const material=new THREE.MeshStandardMaterial({color:realm.color,emissive:realm.color,emissiveIntensity:0.25,metalness:0.4,roughness:0.25});
    for(const dx of [-0.85,0.85]) for(const dz of [-0.65,0.65]){
      const column=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.11,1.35,12),material);
      column.position.set(dx,0.68,dz);sanctuary.add(clickable(column,realm.key));
    }
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.65,0.6,4),material);
    roof.rotation.y=Math.PI/4;roof.position.y=1.65;sanctuary.add(clickable(roof,realm.key));
    const pearl=new THREE.Mesh(new THREE.SphereGeometry(0.32,24,16),new THREE.MeshStandardMaterial({color:'#fff',emissive:realm.color,emissiveIntensity:1.2}));
    pearl.position.y=0.7;sanctuary.add(clickable(pearl,realm.key));
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
  const foot=sanqingText(['第五層・三清勝境','三炁 → 三天三境 → 三洞經教'],'#cbd5e1',1024,260);
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
  const help=document.createElement('p');help.textContent='點選 3D 境臺可對照下方內容；三座境臺以前後錯落的立體三角呈現，仍屬靈寶第五層。三角配置、位置、色彩與宮殿造型為教學設計，不代表經文記載的方位或尊卑。';section.append(help);
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
  add(panel,'p','第六層：大羅天 → 第五層：三清勝境；層號是本介面的教學分類。','evidence-note');
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
