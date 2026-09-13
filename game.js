const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s),W=1280,H=720,ground=610,keys=new Set(),pressed=new Set();
let mode='menu',time=0,last=0,cam=0,shake=0,room=-1,placeTimer=0,audio,checkpoint=160,won=false;
const player={x:160,y:540,w:28,h:48,vx:0,vy:0,face:1,hp:6,soul:100,embers:0,ground:false,jumps:0,dash:0,dashCD:0,attack:0,attackCD:0,inv:0,heal:0};
let enemies=[],particles=[],waves=[],boss=null;
const platforms=[{x:-100,y:610,w:1140,h:180},{x:1170,y:610,w:770,h:180},{x:2060,y:610,w:1450,h:180},{x:900,y:490,w:210,h:22},{x:1170,y:410,w:170,h:22},{x:1460,y:470,w:180,h:22},{x:1780,y:510,w:210,h:22},{x:2030,y:450,w:180,h:22},{x:2320,y:520,w:180,h:22},{x:3490,y:610,w:1540,h:180}];
let motes=[{x:1260,y:370,taken:false},{x:2110,y:410,taken:false},{x:2420,y:480,taken:false}];
function sound(f=220,d=.1,type='sine',vol=.04){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*.5,audio.currentTime+d);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
function burst(x,y,color,n=15){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*250,vy:(Math.random()-.6)*250,life:.3+Math.random()*.6,color})}
function resetEnemies(){enemies=[{x:730,y:580,home:730,hp:3,v:45,hit:0},{x:1510,y:580,home:1510,hp:3,v:-55,hit:0},{x:2300,y:580,home:2300,hp:4,v:60,hit:0},{x:2890,y:580,home:2890,hp:3,v:-55,hit:0}];waves=[];boss={x:4380,y:610,hp:48,max:48,state:'idle',timer:1.5,active:false,hit:0,face:-1,cycle:0};}
resetEnemies();
function save(){try{localStorage.setItem('mothbound-save',JSON.stringify({checkpoint,embers:player.embers,won}))}catch{}}
let saved;try{saved=JSON.parse(localStorage.getItem('mothbound-save'));if(saved&&Number.isFinite(saved.checkpoint))$('#continue').hidden=false}catch{}
function start(resume=false){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();if(resume&&saved){checkpoint=saved.checkpoint;player.embers=saved.embers||0;}else{checkpoint=160;player.embers=0;motes.forEach(m=>m.taken=false)}won=false;respawn();mode='play';document.body.classList.add('playing')}
function respawn(){Object.assign(player,{x:checkpoint,y:ground-60,vx:0,vy:0,hp:6,soul:100,inv:1,dash:0,attack:0});resetEnemies();cam=Math.max(0,player.x-400);room=-1;}
$('#start').onclick=()=>{if(mode==='paused'){mode='play';document.body.classList.add('playing')}else start()};$('#continue').onclick=()=>start(true);
function pause(){if(mode==='play'){mode='paused';$('#start').textContent='Resume journey';$('#intro').textContent='The hush can wait.';$('#continue').hidden=true;document.body.classList.remove('playing')}else if(mode==='paused'){mode='play';document.body.classList.add('playing')}}$('#pause').onclick=pause;
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);if(e.code==='Escape'&&!e.repeat)pause()});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();pressed.clear();if(mode==='play')pause()});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);pressed.add(b.dataset.key)};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key)});
function hurt(amount,from){if(player.inv>0||mode!=='play')return;player.hp-=amount;player.inv=1.15;player.vx=(player.x<from?-1:1)*330;player.vy=-260;shake=12;player.heal=0;burst(player.x,player.y,'#c3dae0');sound(95,.25,'sawtooth');if(player.hp<=0){mode='dead';setTimeout(()=>{respawn();mode='play'},1100)}}
function update(dt){time+=dt;for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=210*dt}particles=particles.filter(p=>p.life>0);shake=Math.max(0,shake-dt*40);if(mode!=='play')return;
 const p=player;for(const k of ['inv','dashCD','attackCD','attack','dash'])p[k]=Math.max(0,p[k]-dt);
 const left=keys.has('KeyA')||keys.has('ArrowLeft'),right=keys.has('KeyD')||keys.has('ArrowRight');const axis=Number(right)-Number(left);if(axis)p.face=axis;
 if(p.dash<=0){p.vx+=(axis*265-p.vx)*Math.min(1,dt*(p.ground?18:9));p.vy+=1550*dt;}
 if((pressed.has('Space')||pressed.has('KeyW')||pressed.has('ArrowUp'))&&p.jumps<2){p.vy=p.jumps===0?-600:-510;p.jumps++;p.ground=false;burst(p.x,p.y+p.h,'#9bbbc0',7);sound(360,.1)}
 if((pressed.has('KeyK')||pressed.has('ShiftLeft')||pressed.has('ShiftRight'))&&p.dashCD<=0){p.dash=.17;p.dashCD=.65;p.inv=Math.max(p.inv,.21);p.vx=p.face*850;p.vy=0;sound(150,.13,'triangle')}
 if(pressed.has('KeyJ')&&p.attackCD<=0){p.attack=.18;p.attackCD=.30;sound(480,.1,'triangle');const hit=e=>Math.abs(e.x-(p.x+p.face*53))<85&&Math.abs(e.y-(p.y+25))<85;
 for(const e of enemies)if(e.hp>0&&hit(e)){e.hp--;e.hit=.2;e.x+=p.face*20;p.soul=Math.min(100,p.soul+9);burst(e.x,e.y,'#b5d6c7');if(e.hp<=0){p.embers+=12;sound(650,.22)}}
 if(boss.active&&boss.hp>0&&hit({x:boss.x,y:boss.y-70})){boss.hp--;boss.hit=.15;p.soul=Math.min(100,p.soul+6);burst(boss.x,boss.y-65,'#dbc7a2',9);shake=4;if(boss.hp<=0){won=true;boss.active=false;waves=[];burst(boss.x,boss.y-80,'#f4d99a',100);p.embers+=100;save();placeTimer=9;$('#place').textContent='The bell falls silent';sound(520,2)}}}
 if(keys.has('KeyL')&&p.ground&&p.soul>=35&&p.hp<6&&axis===0&&p.attack===0){p.heal+=dt;if(Math.random()<.3)burst(p.x,p.y+30,'#b9e6dd',1);if(p.heal>=1){p.hp++;p.soul-=35;p.heal=0;sound(720,.4)}}else p.heal=0;
 const prevY=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.ground=false;for(const plat of platforms){if(p.vy>=0&&p.x+p.w/2>plat.x&&p.x-p.w/2<plat.x+plat.w&&prevY+p.h<=plat.y+3&&p.y+p.h>=plat.y){p.y=plat.y-p.h;p.vy=0;p.ground=true;p.jumps=0;}}
 p.x=Math.max(25,Math.min(4910,p.x));if(boss.active)p.x=Math.max(3650,p.x);if(p.y>850){hurt(1,p.x);p.x=p.x<2000?850:2200;p.y=420;p.vy=0;if(p.hp>0)p.inv=1.5}
 let hint='';for(const bench of [160,3260])if(Math.abs(p.x-bench)<80&&p.ground){hint='E — Rest at the lantern · restore health & save';if(pressed.has('KeyE')){checkpoint=bench;p.hp=6;p.soul=100;save();burst(p.x,p.y,'#e2d5a5',30);sound(540,.7);hint='Journey saved'}}
 if(p.x<560)hint='Follow the lanterns east. Space twice to double jump.';
 for(const m of motes)if(!m.taken&&Math.hypot(p.x-m.x,p.y+20-m.y)<42){m.taken=true;p.embers+=25;p.soul=Math.min(100,p.soul+25);burst(m.x,m.y,'#ecdba3',25);sound(850,.5)}
 for(const e of enemies){e.hit=Math.max(0,e.hit-dt);if(e.hp<=0)continue;e.x+=e.v*dt;if(Math.abs(e.x-e.home)>120)e.v*=-1;if(Math.abs(e.x-p.x)<34&&Math.abs(e.y-(p.y+30))<37)hurt(1,e.x)}
 if(p.x>3670&&!won&&!boss.active){boss.active=true;boss.timer=1.4;placeTimer=3;$('#place').textContent='The Bellwarden';sound(80,1.5)}
 if(boss.active){boss.hit=Math.max(0,boss.hit-dt);boss.timer-=dt;const rage=boss.hp<24;const speed=rage?1.3:1;boss.face=p.x<boss.x?-1:1;
 if(boss.timer<=0){if(boss.state==='idle'){boss.cycle++;boss.state=boss.cycle%3===0?'leapWind':'wind';boss.timer=rage?.55:.85;sound(130,.3)}else if(boss.state==='wind'){boss.state='charge';boss.dir=boss.face;boss.timer=.65; sound(70,.4,'sawtooth')}else if(boss.state==='leapWind'){boss.state='leap';boss.target=p.x;boss.timer=.85;boss.start=boss.x}else if(boss.state==='leap'){boss.state='recover';boss.y=610;boss.timer=rage?.65:1.1;shake=18;waves.push({x:boss.x,y:592,v:-260*speed},{x:boss.x,y:592,v:260*speed});burst(boss.x,600,'#bba27c',45);sound(55,.5,'triangle')}else{boss.state='idle';boss.timer=rage?.6:1.1}}
 if(boss.state==='charge'){boss.x+=boss.dir*550*speed*dt;boss.x=Math.max(3730,Math.min(4790,boss.x))}if(boss.state==='leap'){const f=1-boss.timer/.85;boss.x=boss.start+(boss.target-boss.start)*f;boss.y=610-Math.sin(f*Math.PI)*260;}
 if(Math.abs(p.x-boss.x)<59&&p.y+p.h>boss.y-122&&p.y<boss.y)hurt(1,boss.x);
 }
 for(const w of waves){w.x+=w.v*dt;if(Math.abs(w.x-p.x)<25&&p.y+p.h>w.y-25)hurt(1,w.x)}waves=waves.filter(w=>w.x>3600&&w.x<4960);
 if(won)hint='You freed the drowned cathedral. Explore, or rest by a lantern.';$('#hint').textContent=hint;
 const r=p.x<1100?0:p.x<2600?1:p.x<3600?2:3;if(r!==room){room=r;placeTimer=4;$('#place').textContent=['The Quiet Stair','Gardens of Glass','Pilgrim’s Rest','Belfry of the Deep'][r]}
 placeTimer-=dt;$('#place').style.opacity=placeTimer>0?1:0;cam+=(Math.max(0,Math.min(3720,p.x-440))-cam)*Math.min(1,dt*5);
 $('#life').textContent='◆'.repeat(Math.max(0,p.hp))+'◇'.repeat(6-Math.max(0,p.hp));$('#soul').style.width=p.soul+'%';$('#embers').textContent=p.embers+' embers';$('#boss').style.display=boss.active?'block':'none';$('#boss i').style.width=(boss.hp/boss.max*100)+'%';
}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x1,y1,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function arch(x,y,w,h,color){ctx.strokeStyle=color;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.quadraticCurveTo(x,y,x+w/2,y-35);ctx.quadraticCurveTo(x+w,y,x+w,y+w/2);ctx.lineTo(x+w,y+h);ctx.stroke();ctx.lineWidth=2;ctx.strokeRect(x-13,y+h-30,w+26,30)}
function lantern(x,y){line(x,y-120,x,y,'#59757b',2);glow(x,y,105,'#b1ceaa28');ellipse(x,y,8,14,'#d9dfb3');ctx.strokeStyle='#738b88';ctx.lineWidth=3;ctx.strokeRect(x-12,y-19,24,39)}
function hero(x,y,face,ghost=false){ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha=ghost?.22:player.inv>0&&Math.sin(time*45)>0?.4:1;glow(0,12,62,'#a5d6d016');
 ctx.fillStyle='#233b48';ctx.beginPath();ctx.moveTo(-13,13);ctx.quadraticCurveTo(-20,34,-22-Math.sin(time*11)*4,49);ctx.lineTo(-4,42);ctx.lineTo(4,49);ctx.lineTo(11,42);ctx.lineTo(20,47);ctx.quadraticCurveTo(15,20,9,14);ctx.fill();line(-8,43,-9,50,'#142531',5);line(7,43,8,50,'#142531',5);
 ellipse(0,4,15,19,'#dce4da');ctx.fillStyle='#cedacf';ctx.beginPath();ctx.moveTo(-12,-6);ctx.lineTo(-22,-28);ctx.lineTo(-6,-13);ctx.moveTo(8,-11);ctx.lineTo(20,-26);ctx.lineTo(13,1);ctx.fill();ellipse(-5,5,3,5,'#182c38');ellipse(6,5,3,5,'#182c38');line(12,25,36,37,'#c5c9b5',3);ctx.restore();}
function draw(){const dpr=Math.min(devicePixelRatio||1,2),sw=innerWidth,sh=innerHeight;if(canvas.width!==sw*dpr||canvas.height!==sh*dpr){canvas.width=sw*dpr;canvas.height=sh*dpr}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#07141f';ctx.fillRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#06111d');bg.addColorStop(.6,'#18343e');bg.addColorStop(1,'#203b42');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 glow(830-cam*.08,200,450,'#6caaa42b');for(let i=0;i<13;i++){const x=i*180-cam*.23;arch(x,90+(i%3)*35,130,560,'#1d39444d');line(x+65,180,x+65,560,'#41626a30',2)}
 for(let i=0;i<22;i++){const x=i*130-cam*.45;ctx.fillStyle='#0c222d';ctx.beginPath();ctx.moveTo(x-25,680);ctx.bezierCurveTo(x+15,470,x-60,260,x+10,0);ctx.lineTo(x+38,0);ctx.bezierCurveTo(x-20,300,x+50,480,x+22,680);ctx.fill();line(x,290,x-60,200,'#102a35',8);line(x+12,360,x+80,240,'#102a35',6)}
 for(let i=0;i<75;i++){let x=((i*173.17+Math.sin(time*.18+i)*35-cam*.12)%1340+1340)%1340;let y=(i*91.3+Math.sin(time*.35+i)*30)%670;ellipse(x,y,i%3===0?1.8:.8,i%3===0?1.8:.8,'#b4d7c547')}
 ctx.save();ctx.translate(-cam+(Math.random()-.5)*shake,(Math.random()-.5)*shake);
 for(let i=0;i<25;i++){const x=i*217+45;arch(x,280,95,330,'#2c485059');if(i%3===1)lantern(x+45,345)}
 // The great submerged bell, suspended behind the arena.
 line(4290,0,4290,165,'#516369',6);ctx.fillStyle='#35484b';ctx.beginPath();ctx.moveTo(4200,330);ctx.quadraticCurveTo(4230,300,4237,205);ctx.quadraticCurveTo(4290,135,4343,205);ctx.quadraticCurveTo(4350,300,4380,330);ctx.closePath();ctx.fill();ellipse(4290,330,92,14,'#718078');ellipse(4290,336,77,8,'#172c34');line(4290,310,4290,354,'#919887',8);
 for(const plat of platforms){ctx.fillStyle='#0b1b27';ctx.fillRect(plat.x,plat.y,plat.w,plat.h);line(plat.x,plat.y,plat.x+plat.w,plat.y,'#597b7c',3);line(plat.x,plat.y+7,plat.x+plat.w,plat.y+7,'#243f4a',3);for(let i=0;i<plat.w;i+=31){const x=plat.x+i;line(x,plat.y,x+Math.sin(i)*8,plat.y-8-Math.abs(Math.sin(i*2))*14,'#45676b',1);if(i%93===0){line(x,plat.y+9,x+8,plat.y+40,'#29404a');ellipse(x+10,plat.y-10,7,3,'#719395')}}}
 for(const x of [160,3260]){glow(x,540,160,'#d3c48c16');line(x-35,581,x+35,581,'#8c9385',5);line(x-26,581,x-26,610,'#647973',4);line(x+26,581,x+26,610,'#647973',4);lantern(x-55,520)}
 for(const m of motes)if(!m.taken){const y=m.y+Math.sin(time*2+m.x)*7;glow(m.x,y,35,'#e9d49f44');ellipse(m.x,y,5,7,'#e9d7a5')}
 for(const e of enemies)if(e.hp>0){ctx.save();ctx.translate(e.x,e.y);const bob=Math.sin(time*9)*2;for(let j=-1;j<=1;j++)line(j*10,2,j*15-8,20,'#779190',2);ellipse(0,bob,26,17,e.hit>0?'#d8e6d8':'#405b63');ctx.strokeStyle='#779295';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,bob,19,Math.PI,Math.PI*2);ctx.stroke();ellipse(e.v>0?16:-16,bob,3,3,'#e1c892');ctx.restore()}
 if(boss.hp>0){ctx.save();ctx.translate(boss.x,boss.y);const wind=['wind','leapWind'].includes(boss.state);glow(0,-70,140,wind?'#e4b57a44':'#91a8a01b');ctx.fillStyle=boss.hit>0?'#d2d9c3':'#3e5157';ctx.beginPath();ctx.moveTo(-39,-104);ctx.lineTo(-65,0);ctx.quadraticCurveTo(0,-20,65,0);ctx.lineTo(35,-104);ctx.closePath();ctx.fill();for(let j=-2;j<=2;j++)line(j*12,-80,j*20,-8,'#72817b',2);ellipse(0,-108,34,33,boss.hit>0?'#ffffff':'#b5bb9f');ctx.fillStyle='#263d45';ctx.fillRect(-22,-116,44,11);ellipse(-11,-110,4,3,wind?'#ffd394':'#c3d3bd');ellipse(11,-110,4,3,wind?'#ffd394':'#c3d3bd');for(let j=-1;j<=1;j++)line(j*22,-132,j*29,-159+Math.abs(j)*8,'#bac2a9',5);const sx=boss.face*70;line(sx,-120,sx,-5,'#c4b68c',7);ellipse(sx,-123,23,11,'#879486');ctx.restore();if(boss.state==='leap')glow(boss.target,605,65,'#e4b57a66')}
 if(boss.active){for(const x of [3620,4930]){glow(x,470,110,'#a7c4be25');for(let i=0;i<8;i++)line(x+Math.sin(time*2+i)*8,280+i*40,x+Math.cos(time*3+i)*9,330+i*40,'#a2bdb65a',3)}}
 for(const w of waves){glow(w.x,w.y,40,'#f1c79350');ctx.strokeStyle='#d8bf94';ctx.lineWidth=4;ctx.beginPath();ctx.arc(w.x,w.y,25,Math.PI,0);ctx.stroke()}
 if(player.dash>0)for(let i=1;i<5;i++)hero(player.x-player.face*i*23,player.y,player.face,true);if(mode!=='dead')hero(player.x,player.y,player.face);
 if(player.attack>0){ctx.save();ctx.translate(player.x,player.y+20);ctx.scale(player.face,1);ctx.strokeStyle='#e1eee7';ctx.shadowColor='#b4e6de';ctx.shadowBlur=15;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(20,0,67,44,0,-1.3,1.3);ctx.stroke();ctx.restore()}
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ellipse(p.x,p.y,2,2,p.color)}ctx.globalAlpha=1;ctx.restore();
 // Foreground roots frame the scene without obscuring the route.
 for(let i=0;i<9;i++){const x=i*220-((cam*.8)%220);ctx.fillStyle='#050f19';ctx.beginPath();ctx.moveTo(x-60,720);ctx.quadraticCurveTo(x+10,640,x-40,653);ctx.quadraticCurveTo(x+40,627,x+45,720);ctx.fill()}
 const vignette=ctx.createRadialGradient(640,360,230,640,360,760);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#020913b0');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);if(mode==='dead'){ctx.fillStyle='#07131dbb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#d9e5dd';ctx.font='italic 34px Georgia';ctx.textAlign='center';ctx.fillText('The light remembers you.',640,350)}
}
function frame(ms){const dt=Math.min((ms-last)/1000,.033);last=ms;update(dt);pressed.clear();draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
