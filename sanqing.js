/* Fifth-layer diagram: geometry is a teaching reconstruction, not an ancient image. */
let selectedSanqingKey = null;
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
  const focus = new THREE.Vector3(COSMOLOGY_CENTER.x,23.5,COSMOLOGY_CENTER.z+4.5);
  function clickable(object,key=null) {
    const index = data.sanqing.realms.findIndex(realm => realm.key === key);
    const target = key && index >= 0
      ? new THREE.Vector3(COSMOLOGY_CENTER.x + (index - 1) * 6.5, 22.5, COSMOLOGY_CENTER.z + 4.5)
      : focus;
    object.userData = {data,focusPos:target,sanqingKey:key};
    clickableMeshes.push(object);
    return object;
  }
  const sourcePos = new THREE.Vector3(0,4.3,0);
  const source = new THREE.Mesh(new THREE.SphereGeometry(0.56,32,24),new THREE.MeshStandardMaterial({color:'#fff7cc',emissive:'#facc15',emissiveIntensity:1.7,roughness:0.2}));
  source.position.copy(sourcePos); group.add(clickable(source));
  const sourceLabel=sanqingText(['一炁','化生三炁・分為三天'],'#fde68a',1024,300);
  sourceLabel.position.set(0,5.7,0); sourceLabel.scale.set(5,1.46,1); group.add(clickable(sourceLabel));
  data.sanqing.realms.forEach((realm,index)=>{
    const x=(index-1)*6.5;
    const center=new THREE.Vector3(x,0,0);
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.45,0.38,48),new THREE.MeshStandardMaterial({color:realm.color,transparent:true,opacity:0.48,metalness:0.5,roughness:0.25}));
    platform.position.copy(center); group.add(clickable(platform,realm.key));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(2.17,0.065,8,64),new THREE.MeshBasicMaterial({color:realm.color}));
    rim.rotation.x=Math.PI/2; rim.position.set(x,0.24,0);group.add(rim);
    // A symbolic sanctuary: four columns and a roof, without invented deity iconography.
    const sanctuary=new THREE.Group();sanctuary.position.set(x,0.25,0);group.add(sanctuary);
    const material=new THREE.MeshStandardMaterial({color:realm.color,emissive:realm.color,emissiveIntensity:0.25,metalness:0.4,roughness:0.25});
    for(const dx of [-0.85,0.85]) for(const dz of [-0.65,0.65]){
      const column=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.11,1.35,12),material);
      column.position.set(dx,0.68,dz);sanctuary.add(clickable(column,realm.key));
    }
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.65,0.6,4),material);
    roof.rotation.y=Math.PI/4;roof.position.y=1.65;sanctuary.add(clickable(roof,realm.key));
    const pearl=new THREE.Mesh(new THREE.SphereGeometry(0.32,24,16),new THREE.MeshStandardMaterial({color:'#fff',emissive:realm.color,emissiveIntensity:1.2}));
    pearl.position.y=0.7;sanctuary.add(clickable(pearl,realm.key));
    const curve=new THREE.CatmullRomCurve3([sourcePos.clone(),new THREE.Vector3(x*0.55,3.5,-0.3),new THREE.Vector3(x,2.6,0),new THREE.Vector3(x,1.95,0)]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,40,0.045,8,false),new THREE.MeshBasicMaterial({color:realm.color,transparent:true,opacity:0.7})));
    const qiLabel=sanqingText([realm.qi],realm.color,640,180);
    qiLabel.scale.set(2.3,0.65,1);qiLabel.position.set(x,2.8,0.5);group.add(clickable(qiLabel,realm.key));
    for(let i=0;i<4;i++) {
      const particle=new THREE.Mesh(new THREE.SphereGeometry(0.075,8,8),new THREE.MeshBasicMaterial({color:realm.color}));group.add(particle);
      sanqingFlows.push({particle,curve,phase:i/4});
    }
    const label=sanqingText([`${realm.heaven}・${realm.realm}`,`${realm.deity}（${realm.lord}）`,`《${realm.scripture}》十二部 → ${realm.audience}`],realm.color);
    label.position.set(x,-1.75,1.2);group.add(clickable(label,realm.key));
  });
  const foot=sanqingText(['第五層・三清勝境','三炁 → 三天三境 → 三洞經教'],'#cbd5e1',1024,260);
  foot.scale.set(6,1.52,1);foot.position.set(0,-4.1,0.8);group.add(clickable(foot));
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
  const help=document.createElement('p');help.textContent='點選境臺或其圖示，鏡頭會聚焦該境；點選一炁則呈現三境全貌。位置、色彩與宮殿造型為教學設計。';section.append(help);
  for(const realm of model.realms){
    const card=document.createElement('article');card.className='sanqing-card';card.dataset.realm=realm.key;card.dataset.selected=String(selectedSanqingKey===realm.key);card.style.setProperty('--realm-color',realm.color);
    const title=document.createElement('h4');title.textContent=`${realm.qi} → ${realm.heaven}・${realm.realm}`;card.append(title);
    const body=document.createElement('p');body.textContent=`尊神對應：${realm.deity}；原文稱「${realm.lord}」。`;card.append(body);
    const teaching=document.createElement('p');teaching.textContent=`出《${realm.scripture}》十二部，以教天中${realm.audience}。`;card.append(teaching);
    const focusButton=document.createElement('button');
    focusButton.type='button';focusButton.className='sanqing-focus';focusButton.textContent=`聚焦${realm.realm}`;
    focusButton.addEventListener('click',()=>{
      const item=clickableMeshes.find(mesh=>mesh.userData?.sanqingKey===realm.key);
      selectIsland(item?.userData || {data:selectedIsland,sanqingKey:realm.key});
    });
    card.append(focusButton);
    section.append(card);
  }
  const source=document.createElement('p');source.className='sanqing-citation';source.textContent=model.sourceLabel;section.append(source);
  const excerpt=document.createElement('blockquote');excerpt.className='sanqing-excerpt';excerpt.textContent=model.sourceExcerpt;section.append(excerpt);
  const note=document.createElement('p');note.className='sanqing-source-note';note.textContent=model.sourceNote;section.append(note);
  container.prepend(section);
}
