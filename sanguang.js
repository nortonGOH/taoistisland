/* Fourth-layer teaching landscape. Spatial sizes are schematic; source traditions remain distinct. */
let selectedEarthPart=null;
const SANGUANG_DIRECTIONS=[
  {key:'east',direction:'東',star:'歲星',element:'木',gates:9,color:'#34d399',mountain:'泰山',text:'青帝文',ruler:'青皇真君',guard:'九青帝',light:'九百萬丈',x:10,z:0},
  {key:'south',direction:'南',star:'熒惑',element:'火',gates:3,color:'#f87171',mountain:'衡山／霍山',text:'赤帝文',ruler:'南真上皇君',guard:'三赤帝',light:'三百萬丈',x:0,z:10},
  {key:'center',direction:'中',star:'鎮星',element:'土',gates:4,color:'#facc15',mountain:'嵩山',text:'黃帝文',ruler:'鎮元黃真君',guard:'四黃帝',light:'四百萬丈',x:0,z:0},
  {key:'west',direction:'西',star:'太白',element:'金',gates:7,color:'#f8fafc',mountain:'華山',text:'白帝文',ruler:'西真上皇道君',guard:'七白帝',light:'七百萬丈',x:-10,z:0},
  {key:'north',direction:'北',star:'辰星',element:'水',gates:5,color:'#38bdf8',mountain:'恆山〔另見常山〕',text:'黑帝文',ruler:'北真上皇',guard:'五黑帝',light:'五百萬丈',x:0,z:-10}
];
function buildSanguangRealm(tower){
  const root=new THREE.Group();root.name='lingbao-sanguang-landscape';root.position.y=-6;tower.add(root);
  const data=ISLANDS_DATA.find(n=>n.id==='lingbao_earth_realm');
  function register(o,part,focus=o){root.updateWorldMatrix(true,true);o.userData={data,earthPart:part,axisPart:true,focusContext:'tower',focusObject:focus,focusPos:focus.getWorldPosition(new THREE.Vector3())};if(o.isSprite)o.userData.markerMesh=o;clickableMeshes.push(o);return o;}
  function label(parent,lines,x,y,z,color,part,width=3.6){const o=sanqingText(lines,color,1024,300);o.scale.set(width,width*300/1024,1);o.position.set(x,y,z);parent.add(o);register(o,part);return o;}
  function add(parent,geo,mat,x,y,z,part,focus){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);register(o,part,focus||o);return o;}
  const ocean=new THREE.Mesh(new THREE.CylinderGeometry(12.5,12.5,0.08,64),new THREE.MeshStandardMaterial({color:'#11263f',transparent:true,opacity:0.36,depthWrite:false,roughness:0.35}));ocean.name='sanguang-shenzhou-sea';ocean.position.y=-0.3;root.add(ocean);
  const sky=new THREE.Group();sky.name='sanguang-sky';root.add(sky);
  for(const d of SANGUANG_DIRECTIONS){
    const planet=new THREE.Group();planet.name='sanguang-planet-'+d.key;planet.position.set(d.x,2.2,d.z);sky.add(planet);
    const glow=new THREE.MeshBasicMaterial({color:d.color});
    const orb=add(planet,new THREE.SphereGeometry(0.48,20,14),new THREE.MeshStandardMaterial({color:d.key==='north'?'#091421':d.color,emissive:d.color,emissiveIntensity:0.26,roughness:0.25}),0,0,0,'star-'+d.key);orb.name='sanguang-star-'+d.key;
    const halo=add(planet,new THREE.TorusGeometry(0.75,0.028,6,40),glow,0,0,0,'star-'+d.key,orb);halo.rotation.x=Math.PI/2;
    for(let i=0;i<d.gates;i++){
      const angle=i*Math.PI*2/d.gates,x=Math.cos(angle)*1.22,z=Math.sin(angle)*1.22;
      const gate=new THREE.Group();gate.name=`sanguang-gate-${d.key}-${i+1}`;gate.position.set(x,0,z);gate.rotation.y=-angle;planet.add(gate);
      for(const side of [-1,1])add(gate,new THREE.BoxGeometry(0.055,0.47,0.055),glow,side*0.16,0,0,'star-'+d.key,orb);
      add(gate,new THREE.BoxGeometry(0.4,0.065,0.07),glow,0,0.25,0,'star-'+d.key,orb);
      const guard=add(planet,new THREE.OctahedronGeometry(0.09),glow,x*1.17,0.12,z*1.17,'star-'+d.key,orb);guard.name=`sanguang-guard-${d.key}-${i+1}`;
      const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0,z),new THREE.Vector3(x*1.6,-0.5,z*1.6)]),new THREE.LineBasicMaterial({color:d.color,transparent:true,opacity:0.4,depthWrite:false}));ray.name=`sanguang-ray-${d.key}-${i+1}`;planet.add(ray);
    }
    label(planet,[`${d.direction}方${d.star}・${d.element}精`,`${d.gates}門・${d.guard}`],0,1.1,0,d.color,'star-'+d.key);
    const land=new THREE.Group();land.name='sanguang-mountain-'+d.key;land.position.set(d.x*0.73,0.15,d.z*0.73);root.add(land);
    const stone=new THREE.MeshStandardMaterial({color:'#27394b',roughness:0.9});
    add(land,new THREE.ConeGeometry(1.05,1.5,5),stone,0,0.55,0,'mountain-'+d.key);
    const cave=add(land,new THREE.TorusGeometry(0.25,0.055,6,20),new THREE.MeshBasicMaterial({color:d.color}),0,0.1,0.62,'mountain-'+d.key);cave.name='sanguang-cave-'+d.key;
    const tablet=add(land,new THREE.BoxGeometry(0.24,0.36,0.04),new THREE.MeshBasicMaterial({color:d.color}),0,0.06,0.65,'mountain-'+d.key);tablet.name='sanguang-sealed-text-'+d.key;
    // A plain red mark denotes a sealed scripture, not a reconstructed talisman.
    add(land,new THREE.BoxGeometry(0.025,0.23,0.008),new THREE.MeshBasicMaterial({color:'#ef4444'}),0,0.06,0.676,'mountain-'+d.key);
    label(land,[`${d.direction}嶽・${d.mountain}`,`${d.text}・洞室安鎮`],0,-0.7,1,d.color,'mountain-'+d.key,3.5);
    const elder=new THREE.Group();elder.name='sanguang-five-elder-'+d.key;elder.position.set(d.x*0.48+(d.key==='center'?1.5:0),0.4,d.z*0.48);elder.rotation.y=Math.atan2(-elder.position.x,-elder.position.z);root.add(elder);
    const robe=new THREE.MeshStandardMaterial({color:d.key==='north'?'#102539':d.color,roughness:0.6});
    add(elder,new THREE.CylinderGeometry(0.22,0.4,0.7,8),robe,0,0.25,0,'elders',elder);
    add(elder,new THREE.SphereGeometry(0.18,10,8),new THREE.MeshStandardMaterial({color:'#baa48b'}),0,0.78,0,'elders',elder);
    add(elder,new THREE.BoxGeometry(0.34,0.13,0.23),new THREE.MeshStandardMaterial({color:'#b89b55',metalness:0.5,roughness:0.4}),0,0.98,0,'elders',elder);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(d.x,1.7,d.z),new THREE.Vector3(d.x*0.73,1.3,d.z*0.73)]),new THREE.LineDashedMaterial({color:d.color,transparent:true,opacity:0.23,dashSize:0.15,gapSize:0.18,depthWrite:false}));line.computeLineDistances();line.name='sanguang-star-mountain-'+d.key;root.add(line);
  }
  for(const [key,name,x,color] of [['sun','日',-6,'#fbbf24'],['moon','月',6,'#c7d2fe']]){
    const orb=add(sky,new THREE.SphereGeometry(0.65,20,14),new THREE.MeshBasicMaterial({color}),x,4.1,-7,key);orb.name='sanguang-'+key;
    if(key==='moon'){const shadow=new THREE.Mesh(new THREE.SphereGeometry(0.6,20,14),new THREE.MeshBasicMaterial({color:'#172239'}));shadow.position.set(0.27,0.07,0.18);orb.add(shadow);}
    label(sky,[name+'光',key==='sun'?'陽精・日輪':'陰精・月輪'],x,5.3,-7,color,key,2.6);
  }
  label(root,['五老帝君朝真','朝向中軸・儀式示意'],4,1.5,4,'#e9c46a','elders',4);
  label(root,['神州・三島十洲・洞天福地','海中仙境與洞府分層閱讀'],0,-0.8,12.6,'#93c5fd','geography',6);
  root.updateWorldMatrix(true,true);
}
function renderSanguangPanel(container){
  if(selectedIsland?.id!=='lingbao_earth_realm')return;
  const panel=document.createElement('section');panel.className='sanqing-panel sanguang-panel';
  const add=(tag,text,parent=panel)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
  add('h3','第四層・三光之天與神州大地');
  add('p','天穹以日、月、星三類光明構成「三光」，此處星類重點展開五星；不是把三光解成三顆天體。下方為神州五嶽與海中仙境，天—地—人的聯繫見五星、五嶽、五臟對照。');
  const nav=add('div','');nav.className='shangqing-actions';
  function button(title,part){const b=add('button',title,nav);b.type='button';b.dataset.earthPart=part;b.setAttribute('aria-pressed',String(selectedEarthPart===part));b.addEventListener('click',()=>{const object=sceneReady&&!textView?clickableMeshes.find(o=>o.isSprite&&o.userData.earthPart===part):null;selectIsland(object?.userData||{data:ISLANDS_DATA.find(n=>n.id==='lingbao_earth_realm'),earthPart:part});});}
  button('日','sun');button('月','moon');for(const d of SANGUANG_DIRECTIONS)button(d.star,'star-'+d.key);for(const d of SANGUANG_DIRECTIONS)button(d.mountain,'mountain-'+d.key);button('五老朝真','elders');button('洞天福地','geography');
  const d=SANGUANG_DIRECTIONS.find(d=>selectedEarthPart==='star-'+d.key||selectedEarthPart==='mountain-'+d.key);
  if(d)add('p',`已選${d.direction}方：${d.star}／${d.mountain}。${d.gates}門、${d.guard}備衛；所奉尊神依《八素真經》電子轉錄標作${d.ruler}。${d.text}封嶽與星中守門帝分屬不同文本敘事。`);
  if(selectedEarthPart==='sun'||selectedEarthPart==='moon')add('p',selectedEarthPart==='sun'?'日輪以暖金色表示陽精，與月及五星共同展開三光景觀。':'月輪以銀藍色與暗面表示陰精，月相僅作辨識設計，不是特定日期的天文推算。');
  add('h4','五星的圓鏡、宮門與守衛');
  const table=add('table','');const head=add('tr','',table);for(const t of ['方位／星曜','宮門／備衛','奉衛尊神','光垂〔經文尺度〕'])add('th',t,head);
  for(const item of SANGUANG_DIRECTIONS){const row=add('tr','',table);for(const t of [item.direction+'・'+item.star+'／'+item.element+'精',item.gates+'門／'+item.guard,item.ruler,item.light])add('td',t,row);}
  add('p','圓鏡、門界、鋒芒與備衛數可直接核於《上清太上八素真經》飛登五星各節；本圖採其9、3、4、7、5門。鎮星神名依此轉錄為「鎮元黃真君」，與提供材料的「鎮無」異文待影像核對。中央四門不改動五方五氣本體盤的中央一氣；門數、氣數與五老位數各有語境。光芒長度採文字呈現，模型不按百萬丈比例繪製。');
  add('h4','五星司察與五老朝真');
  add('p','《八素真經》將五星與日月、五嶽及身中五藏相連，也有五星上皇朝會、考校功過與定仙籍的敘述。《赤書玉訣妙經》則可見星宿失度、災異及正度安鎮的法文。此為經典的宗教宇宙觀，星芒告警不作現代天文預報。');
  add('p','五尊簡化人形表示五老朝真的閱讀主題，朝向中軸，為儀式示意；《真文天書經》卷中可見五老與諸天帝皇會於三天、推校運度與糾察功過。將五老放在本層是串聯導讀的視覺安排，不宣稱朝真儀式固定在第四層。星中守門的青赤黃白黑帝另以小光點表示，不能直接當成五老本尊。');
  add('h4','神州五嶽與真文封嶽');
  for(const item of SANGUANG_DIRECTIONS)add('p',`${item.direction}嶽${item.mountain}：${item.text}。山體前方的洞口與玉簡象徵真文安鎮；點選可轉入該方視角。`);
  add('p','《元始五老赤書玉篇真文天書經》卷上記載各方帝受真文、封於嶽中洞室，聯繫安鎮山川、制御水府與劫運。五嶽為地鎮、五星為天象、五藏為人身的對應，表達天—地—人的秩序。模型用簡化赤線表示封存文本，不冒充古代真文或符圖。南嶽衡山／霍山、北嶽恆山／常山依傳本語境分列，不將不同時地山名視為完全相同。');
  add('h4','三島十洲與洞天福地');
  add('p','三光之下的神州、五嶽、三島十洲可作大地與巨海仙境的閱讀架構；十大洞天、三十六小洞天、七十二福地則屬歷代洞天福地譜系的展開。此處以文字分組呈現，不虛構精確座標，也不把所有名山洞府視作同一時期的一份地圖。');
  add('h4','原典與核對狀態');
  for(const [title,note] of [
    ['《上清太上八素真經》','五星門界、光芒、守門帝、五星與日月五嶽五藏及朝會考校：電子轉錄初核。其上清文本資料在此作對讀，未改稱靈寶獨有。'],
    ['《太上洞玄靈寶赤書玉訣妙經》卷上','五方真文、輔肝心脾肺腎、星宿失度與安鎮：電子轉錄初核。五星圓鏡門界另標《八素真經》，不沿用未核的籠統歸屬。'],
    ['《元始五老赤書玉篇真文天書經》卷上、卷中','五方封嶽、五文與五星五藏五嶽及五老朝會：電子轉錄初核，字形待底本影像校核。'],
    ['提供材料的 cite 25、26、33、58、62、141','未附對應檔案，不能作正式引註；「三光之下是神州」長引、洞天福地總數的各版本與歷史層次另待定位。']
  ]){add('h5',title);add('p',note);}
  container.prepend(panel);
}
