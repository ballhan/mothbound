const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s),W=1280,H=720,ground=610,keys=new Set(),pressed=new Set();
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const art=typeof Image!=='undefined'?new Image():null;
if(art)art.src='assets/cathedral.webp';
let mode='menu',time=0,last=0,cam=0,shake=0,room=-1,placeTimer=0,audio,checkpoint=160,won=false;
let hitstop=0,flash=0,notice='',noticeTimer=0,deathCache=null,musicTimer=0,musicStep=0,muted=false,audioMaster;
let visited=new Set([0]),discovered=new Set(),bolts=[],rings=[],enemies=[],particles=[],waves=[],boss;
const player={x:160,y:540,w:28,h:48,vx:0,vy:0,face:1,hp:6,maxHp:6,damage:1,soul:100,embers:0,
  ground:false,jumps:0,dash:0,dashCD:0,attack:0,attackCD:0,inv:0,heal:0,spellCD:0,attackDir:'side',coyote:0,jumpBuffer:0,step:0,land:0,safeX:160};
const zones=['The Quiet Stair','Gardens of Glass','Pilgrim’s Rest','Belfry of the Deep'];
const platforms=[{x:-100,y:610,w:1140,h:180},{x:1170,y:610,w:770,h:180},{x:2060,y:610,w:1450,h:180},
  {x:900,y:490,w:210,h:26},{x:1170,y:410,w:170,h:26},{x:1460,y:470,w:180,h:26},
  {x:1780,y:510,w:210,h:26},{x:2030,y:450,w:180,h:26},{x:2320,y:520,w:180,h:26},
  {x:2660,y:460,w:160,h:26},{x:2900,y:340,w:210,h:26},{x:3490,y:610,w:1540,h:180}];
const motes=[{x:1260,y:370,taken:false},{x:2110,y:410,taken:false},{x:2420,y:480,taken:false},{x:3000,y:290,taken:false}];

function sound(f=220,d=.1,type='sine',vol=.035){
  if(!audio||muted)return;
  if(!audioMaster){audioMaster=audio.createGain();audioMaster.connect(audio.destination);}
  const o=audio.createOscillator(),g=audio.createGain();o.type=type;
  o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f*.65),audio.currentTime+d);
  g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);
  o.connect(g).connect(audioMaster);o.start();o.stop(audio.currentTime+d);
}
function music(dt){
  if(!audio||muted)return;musicTimer-=dt;
  if(musicTimer<=0){const notes=boss.active?[110,164.81,130.81,146.83,110,196,164.81,123.47]:[146.83,220,293.66,261.63,174.61,220,329.63,196];
    sound(notes[musicStep++%notes.length],boss.active?1.4:3,'sine',.025);
    if(musicStep%4===0)sound(notes[(musicStep-1)%notes.length]/2,4,'triangle',.014);
    musicTimer=boss.active?.55:1.35;
  }
}
function burst(x,y,color,n=15,speed=250){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*speed,vy:(Math.random()-.6)*speed,life:.3+Math.random()*.6,color,size:1+Math.random()*2});}
function ring(x,y,color='#bde9dc',size=60){rings.push({x,y,color,size,life:.45});}
function tell(text,d=3){notice=text;noticeTimer=d;}
function resetEnemies(){
  enemies=[{x:730,y:580,home:730,hp:3,max:3,v:45,hit:0,type:'beetle'},
    {x:1510,y:580,home:1510,hp:3,max:3,v:-55,hit:0,type:'beetle'},
    {x:1690,y:345,home:1690,baseY:345,hp:2,max:2,v:42,hit:0,type:'wisp'},
    {x:2300,y:580,home:2300,hp:4,max:4,v:35,hit:0,type:'sentry',timer:2},
    {x:2760,y:365,home:2760,baseY:365,hp:2,max:2,v:-40,hit:0,type:'wisp'},
    {x:2890,y:580,home:2890,hp:3,max:3,v:-55,hit:0,type:'beetle'}];
  waves=[];bolts=[];boss={x:4380,y:610,hp:won?0:48,max:48,state:'idle',timer:1.5,active:false,hit:0,face:-1,cycle:0,phase:1};
}
resetEnemies();
let saved;
function save(){
  saved={checkpoint,embers:player.embers,won,maxHp:player.maxHp,damage:player.damage,motes:motes.map(m=>m.taken),visited:[...visited],discovered:[...discovered],deathCache};
  try{localStorage.setItem('mothbound-save',JSON.stringify(saved));}catch{}
}
try{saved=JSON.parse(localStorage.getItem('mothbound-save'));if(saved&&[160,3260].includes(saved.checkpoint))$('#continue').hidden=false;}catch{}
function start(resumeSave=false){
  if(typeof window!=='undefined')try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{}
  if(resumeSave&&saved){checkpoint=[160,3260].includes(saved.checkpoint)?saved.checkpoint:160;player.embers=Math.max(0,Number(saved.embers)||0);
    player.maxHp=saved.maxHp===7?7:6;player.damage=saved.damage===2?2:1;won=!!saved.won;
    motes.forEach((m,i)=>m.taken=!!saved.motes?.[i]);visited=new Set(saved.visited||[0]);discovered=new Set(saved.discovered||[]);deathCache=saved.deathCache||null;
  }else{checkpoint=160;player.embers=0;player.maxHp=6;player.damage=1;won=false;motes.forEach(m=>m.taken=false);visited=new Set([0]);discovered=new Set();deathCache=null;}
  respawn();mode='play';document.body.classList.add('playing');keys.clear();pressed.clear();
}
function respawn(){
  Object.assign(player,{x:checkpoint,y:ground-60,vx:0,vy:0,hp:player.maxHp,soul:100,inv:1,dash:0,attack:0,dashCD:0,attackCD:0,spellCD:0,jumps:0,heal:0,ground:false,safeX:checkpoint});
  hitstop=0;resetEnemies();cam=Math.max(0,player.x-440);room=-1;
}
function resume(){mode='play';document.body.classList.add('playing');$('#panel').hidden=true;keys.clear();pressed.clear();}
function pause(){
  if(mode==='play'){mode='paused';$('#start').textContent='Resume journey';$('#intro').textContent='The hush can wait.';$('#continue').hidden=true;document.body.classList.remove('playing');}
  else if(['paused','map','shop'].includes(mode))resume();
}
function showMap(){
  if(mode==='map'){resume();return;}if(mode!=='play')return;mode='map';$('#panel').hidden=false;
  $('#panel-title').textContent='A pilgrim’s atlas';$('#panel-copy').textContent='Follow the old road east. Higher paths shelter forgotten light.';
  $('#panel-content').innerHTML='<div class="atlas">'+zones.map((name,i)=>'<div class="map-room '+(visited.has(i)?'known':'unknown')+' '+(room===i?'current':'')+'"><span>'+(visited.has(i)?name:'Uncharted')+'</span><small>'+(room===i?'◆ You are here':!visited.has(i)?'Beyond the mist':i===0||i===2?'✧ Lantern':i===3?(won?'Bell silenced':'The great bell'):'Upper paths')+'</small></div>').join('')+'</div><p class="panel-note">'+discovered.size+' / 2 memories found · '+motes.filter(m=>m.taken).length+' / 4 ember clusters gathered</p>';
}
function showShop(){
  if(mode!=='play'&&mode!=='shop')return;mode='shop';$('#panel').hidden=false;
  $('#panel-title').textContent='The last lamplighter';$('#panel-copy').textContent='“A little light, a little courage. We make do with what remains.”';
  const stock=[['blade','Tempered needle','Deal twice the sword damage.',60,player.damage>1],['heart','Woven heart','Carry one more point of health.',45,player.maxHp>6]];
  $('#panel-content').innerHTML='<p class="purse">'+player.embers+' embers</p><div class="wares">'+stock.map(([id,title,desc,cost,owned])=>'<button data-buy="'+id+'" '+(owned||player.embers<cost?'disabled':'')+'><strong>'+title+'</strong><span>'+desc+'</span><small>'+(owned?'Already woven':cost+' embers')+'</small></button>').join('')+'</div><p class="panel-note">Upgrades are permanent and save immediately.</p>';
  document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));
}
function buy(id){
  if(mode!=='shop')return;
  if(id==='blade'&&player.damage===1&&player.embers>=60){player.embers-=60;player.damage=2;}
  else if(id==='heart'&&player.maxHp===6&&player.embers>=45){player.embers-=45;player.maxHp=7;player.hp=7;}
  else return;save();sound(660,.5);showShop();
}
$('#start').onclick=()=>{if(mode==='paused')resume();else start();};$('#continue').onclick=()=>start(true);
$('#pause').onclick=pause;$('#map').onclick=showMap;$('#close-panel').onclick=resume;
$('#mute').onclick=()=>{muted=!muted;if(audioMaster)audioMaster.gain.setValueAtTime(muted?0:1,audio.currentTime);$('#mute').textContent=muted?'Sound off':'Sound on';$('#mute').setAttribute('aria-pressed',String(muted));};
addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);
  if(!e.repeat){if(e.code==='Escape')pause();if(e.code==='KeyM')showMap();}
});
addEventListener('keyup',e=>{keys.delete(e.code);if(['Space','KeyW'].includes(e.code)&&player.vy< -250)player.vy*=.55;});
addEventListener('blur',()=>{keys.clear();pressed.clear();if(mode==='play')pause();});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);pressed.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);});
function hurt(amount,from,force=false){
  if((player.inv>0&&!force)||mode!=='play')return;
  player.hp=Math.max(0,player.hp-amount);player.inv=1.15;player.vx=(player.x<from?-1:1)*330;player.vy=-260;
  shake=12;flash=.15;hitstop=.065;player.heal=0;burst(player.x,player.y,'#c3dae0',22);sound(95,.25,'sawtooth');
  if(player.hp<=0){deathCache={x:Math.max(100,Math.min(4850,player.x)),y:Math.min(550,player.y),embers:player.embers};player.embers=0;save();mode='dead';setTimeout(()=>{respawn();mode='play';tell('Your fallen light waits where you left it.',4);},1300);}
}
function hitEnemy(e,damage=player.damage){
  e.hp-=damage;e.hit=.2;hitstop=.045;shake=3;if(e.type!=='wisp')e.x+=player.face*12;
  player.soul=Math.min(100,player.soul+9);burst(e.x,e.y,'#c7dac2',16);ring(e.x,e.y,'#d4ead7',35);
  if(e.hp<=0){player.embers+=e.type==='sentry'?18:12;sound(650,.22);burst(e.x,e.y,'#d6c184',18);}
}
function hitBoss(damage=player.damage){
  if(!boss.active||boss.hp<=0)return;boss.hp=Math.max(0,boss.hp-damage);boss.hit=.16;hitstop=.05;
  player.soul=Math.min(100,player.soul+6);burst(boss.x,boss.y-65,'#dbc7a2',15);shake=5;
  if(boss.hp<=0){won=true;boss.active=false;waves=[];bolts=[];burst(boss.x,boss.y-80,'#f4d99a',100,550);ring(boss.x,boss.y-80,'#efdfb7',270);player.embers+=100;save();placeTimer=9;$('#place').textContent='The bell falls silent';sound(520,2);tell('The cathedral remembers the sun. Thank you, little pilgrim.',9);}
}
function update(dt){
  if(['paused','map','shop'].includes(mode))return;
  time+=dt;music(dt);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=210*dt;}
  particles=particles.filter(p=>p.life>0);for(const r of rings)r.life-=dt;rings=rings.filter(r=>r.life>0);
  shake=Math.max(0,shake-dt*40);flash=Math.max(0,flash-dt);noticeTimer-=dt;
  if(mode!=='play')return;if(hitstop>0){hitstop-=dt;return;}
  const p=player;for(const k of ['inv','dashCD','attackCD','attack','dash','spellCD','coyote','jumpBuffer'])p[k]=Math.max(0,p[k]-dt);
  const axis=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  if(axis)p.face=axis;if(p.ground)p.coyote=.09;
  if(p.dash<=0){p.vx+=(axis*280-p.vx)*Math.min(1,dt*(p.ground?18:9));p.vy+=1550*dt;}
  p.step+=Math.abs(p.vx)*dt*.065;
  if(pressed.has('Space')||pressed.has('KeyW'))p.jumpBuffer=.12;
  if(p.jumpBuffer>0&&(p.jumps<2||p.coyote>0)){
    if(p.coyote>0)p.jumps=0;p.vy=p.jumps===0?-600:-510;p.jumps++;p.jumpBuffer=0;p.coyote=0;p.ground=false;
    burst(p.x,p.y+p.h,'#a4cbd0',10);ring(p.x,p.y+40,'#abcaca',p.jumps===2?42:24);sound(360,.1);
  }
  if((pressed.has('KeyK')||pressed.has('ShiftLeft')||pressed.has('ShiftRight'))&&p.dashCD<=0){p.dash=.17;p.dashCD=.65;p.inv=Math.max(p.inv,.21);p.vx=p.face*850;p.vy=0;burst(p.x,p.y+20,'#8aaab7',15);sound(150,.13,'triangle');}
  if(pressed.has('KeyJ')&&p.attackCD<=0){
    p.attack=.2;p.attackCD=.30;p.attackDir=keys.has('ArrowUp')?'up':(keys.has('ArrowDown')||keys.has('KeyS'))&&!p.ground?'down':'side';sound(480,.1,'triangle');
    const tx=p.x+(p.attackDir==='side'?p.face*53:0),ty=p.y+25+(p.attackDir==='up'?-55:p.attackDir==='down'?55:0);
    const hit=e=>Math.abs(e.x-tx)<(p.attackDir==='side'?70:42)&&Math.abs(e.y-ty)<(p.attackDir==='side'?60:55);
    let connected=false;for(const e of enemies)if(e.hp>0&&hit(e)){hitEnemy(e);connected=true;}
    if(boss.active&&hit({x:boss.x,y:boss.y-70})){hitBoss();connected=true;}
    if(connected&&p.attackDir==='down'){p.vy=-480;p.jumps=1;p.dashCD=0;ring(p.x,p.y+50);}
  }
  if(pressed.has('KeyF')&&p.soul>=25&&p.spellCD<=0){p.soul-=25;p.spellCD=.45;bolts.push({x:p.x+p.face*30,y:p.y+18,vx:p.face*640,vy:0,life:1.6,friendly:true});ring(p.x,p.y+18,'#d5f6ed',50);sound(680,.3,'triangle');}
  if(keys.has('KeyL')&&p.ground&&p.soul>=35&&p.hp<p.maxHp&&axis===0&&p.attack===0){p.heal+=dt;if(Math.random()<.3)burst(p.x,p.y+30,'#b9e6dd',1);if(p.heal>=1){p.hp++;p.soul-=35;p.heal=0;ring(p.x,p.y+20);sound(720,.4);}}else p.heal=0;
  const prevY=p.y,wasGround=p.ground;p.x+=p.vx*dt;p.y+=p.vy*dt;p.ground=false;
  for(const plat of platforms)if(p.vy>=0&&p.x+p.w/2>plat.x&&p.x-p.w/2<plat.x+plat.w&&prevY+p.h<=plat.y+3&&p.y+p.h>=plat.y){if(!wasGround&&p.vy>250){burst(p.x,plat.y,'#64848c',8);p.land=.13;}p.y=plat.y-p.h;p.vy=0;p.ground=true;p.jumps=0;}
  p.land=Math.max(0,p.land-dt);p.x=Math.max(25,Math.min(4910,p.x));if(boss.active)p.x=Math.max(3650,p.x);
  if(p.ground&&p.y+p.h===ground)p.safeX=p.x;
  if(p.y>850){hurt(1,p.x,true);p.x=p.safeX;p.y=420;p.vy=0;}
  let hint=p.x<560?'Space twice to double jump · J strike · K dash · F cast':'';
  for(const bench of [160,3260])if(Math.abs(p.x-bench)<65&&p.ground){hint='E — Rest at the lantern · restore health & save';if(pressed.has('KeyE')){checkpoint=bench;p.hp=p.maxHp;p.soul=100;save();burst(p.x,p.y,'#e2d5a5',30);sound(540,.7);tell('Journey saved');}}
  if(Math.abs(p.x-3100)<65&&p.ground){hint='E — Speak with the lamplighter · trade embers';if(pressed.has('KeyE'))showShop();}
  for(const [id,x,y,text]of [['roots',1250,410,'“We grew gardens where the rain could never reach.”'],['bell',3000,340,'“The bell was made to wake the dawn. Someone taught it to mourn.”']])if(Math.abs(p.x-x)<70&&Math.abs(p.y+p.h-y)<35){hint='E — Read the old inscription';if(pressed.has('KeyE')){discovered.add(id);tell(text,7);save();}}
  for(const m of motes)if(!m.taken&&Math.hypot(p.x-m.x,p.y+20-m.y)<42){m.taken=true;p.embers+=25;p.soul=Math.min(100,p.soul+25);burst(m.x,m.y,'#ecdba3',25);ring(m.x,m.y,'#ddcb96');sound(850,.5);}
  if(deathCache&&Math.hypot(p.x-deathCache.x,p.y-deathCache.y)<70){p.embers+=deathCache.embers;deathCache=null;save();tell('Your fallen light returns.');sound(550,.7);}
  for(const e of enemies){e.hit=Math.max(0,e.hit-dt);if(e.hp<=0)continue;e.x+=e.v*dt;if(Math.abs(e.x-e.home)>100)e.v*=-1;
    if(e.type==='wisp')e.y=e.baseY+Math.sin(time*2+e.home)*42;
    if(e.type==='sentry'){e.timer-=dt;if(e.timer<=0&&Math.abs(p.x-e.x)<550){const a=Math.atan2(p.y+20-e.y,p.x-e.x);bolts.push({x:e.x,y:e.y-10,vx:Math.cos(a)*190,vy:Math.sin(a)*190,life:3,friendly:false});e.timer=2.7;}}
    if(Math.abs(e.x-p.x)<34&&Math.abs(e.y-(p.y+30))<37)hurt(1,e.x);
  }
  if(p.x>3670&&!won&&!boss.active){boss.active=true;boss.timer=1.4;placeTimer=3;$('#place').textContent='The Bellwarden';sound(80,1.5);}
  if(boss.active)updateBoss(dt);
  for(const b of bolts){b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.friendly){for(const e of enemies)if(e.hp>0&&b.life>0&&Math.hypot(b.x-e.x,b.y-e.y)<34){hitEnemy(e,3);b.life=0;}if(boss.active&&b.life>0&&Math.abs(b.x-boss.x)<60&&b.y>boss.y-140&&b.y<boss.y){hitBoss(3);b.life=0;}}
    else if(Math.hypot(b.x-p.x,b.y-p.y-20)<26){hurt(1,b.x);b.life=0;}
  }
  bolts=bolts.filter(b=>b.life>0);for(const w of waves){w.x+=w.v*dt;if(Math.abs(w.x-p.x)<25&&p.y+p.h>w.y-25)hurt(1,w.x);}waves=waves.filter(w=>w.x>3600&&w.x<4960);
  if(won)hint='The bell is silent. Return to the lamplighter, or seek the hidden memories.';
  const hintText=noticeTimer>0?notice:hint;if($('#hint').textContent!==hintText)$('#hint').textContent=hintText;
  const r=p.x<1100?0:p.x<2600?1:p.x<3600?2:3;
  if(r!==room){room=r;visited.add(r);if(!won){placeTimer=4;$('#place').textContent=zones[r];}}
  placeTimer-=dt;$('#place').style.opacity=placeTimer>0?1:0;cam+=(Math.max(0,Math.min(3720,p.x-440))-cam)*Math.min(1,dt*5);
  const lifeHtml=Array.from({length:p.maxHp},(_,i)=>'<i class="life-moth '+(i<p.hp?'full':'empty')+'"></i>').join('');
  if($('#life').innerHTML!==lifeHtml)$('#life').innerHTML=lifeHtml;
  $('#life').setAttribute('aria-label',p.hp+' of '+p.maxHp+' health');$('#soul').style.width=p.soul+'%';$('#embers').textContent=p.embers+' embers';
  $('#boss').style.display=boss.active?'block':'none';$('#boss i').style.width=(boss.hp/boss.max*100)+'%';$('#boss-name').textContent=boss.phase===2?'The Bellwarden · Unbound':'The Bellwarden';
}
function updateBoss(dt){
  const b=boss,p=player;b.hit=Math.max(0,b.hit-dt);b.timer-=dt;const rage=b.hp<24,speed=rage?1.3:1;b.face=p.x<b.x?-1:1;
  if(rage&&b.phase===1){b.phase=2;shake=16;ring(b.x,b.y-80,'#e8c28f',230);tell('The old oath breaks.',3);sound(60,1);}
  if(b.timer<=0){
    if(b.state==='idle'){b.cycle++;b.state=rage&&b.cycle%4===0?'chime':b.cycle%3===0?'leapWind':'wind';b.timer=rage?.65:.9;sound(130,.3);}
    else if(b.state==='wind'){b.state='charge';b.dir=b.face;b.timer=.65;sound(70,.4,'sawtooth');}
    else if(b.state==='leapWind'){b.state='leap';b.target=Math.max(3740,Math.min(4780,p.x));b.timer=.85;b.start=b.x;}
    else if(b.state==='chime'){for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/6;bolts.push({x:b.x,y:b.y-90,vx:Math.cos(a)*220,vy:Math.sin(a)*220,life:3,friendly:false});}b.state='recover';b.timer=1;ring(b.x,b.y-90,'#e0ae79',190);sound(240,.8);}
    else if(b.state==='leap'){b.state='recover';b.y=610;b.timer=rage?.75:1.2;shake=18;waves.push({x:b.x,y:592,v:-260*speed},{x:b.x,y:592,v:260*speed});burst(b.x,600,'#bba27c',45);ring(b.x,600,'#ceb38c',130);sound(55,.5,'triangle');}
    else{b.state='idle';b.timer=rage?.7:1.2;}
  }
  if(b.state==='charge'){b.x+=b.dir*550*speed*dt;b.x=Math.max(3730,Math.min(4790,b.x));if(Math.random()<.4)burst(b.x,b.y,'#ba9d7b',3);}
  if(b.state==='leap'){const f=1-b.timer/.85;b.x=b.start+(b.target-b.start)*f;b.y=610-Math.sin(f*Math.PI)*260;}
  if(Math.abs(p.x-b.x)<59&&p.y+p.h>b.y-122&&p.y<b.y)hurt(1,b.x);
}
