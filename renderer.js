// The painted far plane, living middle plane and silhouetted foreground move independently.
function ellipse(x,y,rx,ry,color,rotation=0){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fill();}
function line(x1,y1,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function path(points,fill,stroke='#07141d',width=2){ctx.beginPath();for(const [i,p]of points.entries()){if(i===0)ctx.moveTo(...p);else if(p.length===2)ctx.lineTo(...p);else if(p.length===4)ctx.quadraticCurveTo(...p);else ctx.bezierCurveTo(...p);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function rand(n){const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);}
function arch(x,y,w,h,color){ctx.strokeStyle=color;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.quadraticCurveTo(x,y,x+w/2,y-30);ctx.quadraticCurveTo(x+w,y,x+w,y+w/2);ctx.lineTo(x+w,y+h);ctx.stroke();}
function fern(x,y,size,seed,color='#355f61'){
  const sway=reducedMotion?0:Math.sin(time*1.2+seed)*3;
  for(let a=-1;a<=1;a++){const ex=x+a*size*.55+sway,ey=y-size*(1-Math.abs(a)*.2);line(x,y,ex,ey,color,1.3);
    for(let j=1;j<7;j++){const t=j/7,px=x+(ex-x)*t,py=y+(ey-y)*t,s=size*(1-t)*.20;ellipse(px-s*.6,py-2,s,2.5,color,-.55);ellipse(px+s*.6,py-1,s,2.5,color,.55);}
  }
}
function lantern(x,y,large=false){
  const scale=large?1.2:1;line(x,y-120,x,y-22,'#233a45',3);line(x+1,y-120,x+1,y-22,'#788c88',.7);
  glow(x,y,105*scale,'#d4c98725');glow(x,y,35,'#ead39440');ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  path([[-12,-17],[0,-28],[12,-17],[9,20],[0,27],[-9,20]],'#1c3038','#839b91',1.5);
  ellipse(0,0,6,14,'#ffe9ac');ellipse(-1,-2,2,9,'#fff6d1');line(-12,-15,12,-15,'#a2ae94',2);line(-8,19,8,19,'#a2ae94',2);line(0,-18,0,21,'#58685d',1);ctx.restore();
}
function hero(x,y,face,ghost=false){
  const p=player,moving=Math.abs(p.vx)>25,bob=p.ground?Math.sin(p.step*2)*(moving?1.5:.4):0;
  ctx.save();ctx.translate(x,y+bob);ctx.scale(face,1);ctx.rotate(p.dash>0?.17:0);
  ctx.globalAlpha=ghost?.18:p.inv>0&&Math.sin(time*45)>0?.45:1;
  if(p.land>0){ctx.translate(0,8);ctx.scale(1.12,.84);}glow(0,10,65,'#b1d9d021');
  const stride=p.ground?Math.sin(p.step)*7:4;line(-6,35,-8-stride,48,'#08151e',5);line(6,35,8+stride,48,'#08151e',5);
  const tail=Math.min(20,Math.abs(p.vx)*.04),flutter=Math.sin(time*12)*3;
  path([[-9,9],[-19,15],[-18-tail,33],[-30-tail+flutter,43],[-12,39],[-4,46],[4,39],[15,42],[15,22],[9,10]],'#385562','#091823',2.2);
  path([[-9,13],[-11,27],[-20-tail,37],[-7,32],[0,41],[3,21],[8,14]],'#577883',null);
  line(-10,18,-17-tail*.5,33,'#8aa19e',.8);line(4,19,8,34,'#72908e',.8);
  // Rounded moth hood, feathered antennae, luminous eyes and a brooch.
  path([[-14,9],[-18,-3,-11,-15],[0,-24,13,-13],[20,-2,13,12],[0,19,-14,9]],'#d3dccd','#0c1c26',2.5);
  path([[-10,-7],[0,-16,10,-6],[11,6,0,11],[-11,5,-10,-7]],'#152e3b',null);ellipse(-4,0,2,3,'#c9f5e8');ellipse(4,0,2,3,'#c9f5e8');
  for(const side of [-1,1]){ctx.strokeStyle='#b9cdbd';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(side*8,-14);ctx.quadraticCurveTo(side*19,-25,side*15,-34);ctx.stroke();for(let i=0;i<4;i++)line(side*(14+i*.4),-21-i*3,side*(20+i*.2),-22-i*3,'#b9cdbd',1);}
  path([[-14,12],[0,17],[14,10],[11,17],[0,21],[-13,17]],'#a5bcad','#203b43',1);ellipse(0,18,2.5,3,'#e2c68d');
  if(p.attack===0){line(12,24,34,39,'#182e36',5);line(12,23,38,39,'#d7dfcf',2);line(10,27,17,18,'#bda977',2);}
  if(p.heal>0){glow(0,20,48,'#dcffe75a');ctx.strokeStyle='#c9f7dc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,18,30,-Math.PI/2,-Math.PI/2+p.heal*Math.PI*2);ctx.stroke();}
  ctx.restore();
}
function enemyArt(e){
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.v>0?1:-1,1);const white=e.hit>0,walk=Math.sin(time*10+e.home);
  if(e.type==='wisp'){
    glow(0,0,65,'#90dccb25');const flap=Math.sin(time*15)*.35;
    for(const side of [-1,1]){ellipse(side*20,-5,23,11,'#a5c9bc80',side*(.5+flap));ellipse(side*15,8,15,8,'#527c8490',-side*.4);line(side*4,0,side*37,-10,'#b6d4c29c');}
    ellipse(0,0,8,16,white?'#fff5ce':'#3b6069');ellipse(0,-9,7,7,'#c4d3b9');ellipse(3,-10,2,3,'#112b34');
  }else if(e.type==='sentry'){
    path([[-23,22],[-24,-18],[-13,-40],[11,-38],[26,-14],[25,23]],white?'#f0e8c9':'#526b70');
    path([[-17,-17],[0,-32],[18,-15],[15,15],[-15,15]],'#263d49','#9baf9f',1.2);
    ellipse(0,-7,7,11,e.timer<.65?'#f4cf98':'#9bbfae');glow(0,-7,35,e.timer<.65?'#ffbd7040':'#9bcbae18');line(-17,19,-22,30,'#8da193',4);line(17,19,22,30,'#8da193',4);
  }else{
    for(let j=-1;j<=1;j++){const sx=j*13;line(sx,6,sx-9,17+walk*3,'#071620',4);line(sx-9,17+walk*3,sx+2,25,'#a4b9a5',1.6);}
    ellipse(0,-1,28,19,white?'#e7f0d7':'#284852');path([[-26,0],[-22,-23,2,-22],[24,-20,26,2],[5,8,-26,0]],white?'#f1f4da':'#698b89','#0b222d',2);
    for(let j=-2;j<=2;j++)line(j*9,-16+Math.abs(j)*3,j*11,1,'#bfd0ad88',1);
    ellipse(23,3,9,10,'#304c55');ellipse(27,0,3,4,'#e5ce8f');line(26,-6,36,-15,'#9cb5a4',1.4);
  }
  if(e.hp<e.max){ctx.fillStyle='#07131e';ctx.fillRect(-18,-49,36,3);ctx.fillStyle='#c5d4b5';ctx.fillRect(-18,-49,36*Math.max(0,e.hp)/e.max,3);}ctx.restore();
}
function bossArt(){
  const b=boss;if(b.hp<=0)return;ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.face,1);
  const wind=['wind','leapWind','chime'].includes(b.state),rage=b.phase===2;
  if(b.state==='wind')ctx.rotate(-.07);if(b.state==='charge')ctx.rotate(.12);
  const accent=rage?'#e3a977':'#c9c3a1';
  const armor=ctx.createLinearGradient(-45,-120,40,-50);armor.addColorStop(0,'#a9b8a3');armor.addColorStop(.35,'#718b87');armor.addColorStop(.7,'#3d5965');armor.addColorStop(1,'#243e4e');
  const fill=b.hit>0?'#f2e7c7':armor;glow(0,-85,145,wind?'#e4b57a40':'#a4b9b015');
  path([[-34,-105],[-56,-79],[-49,-22],[-68,0],[-32,-11],[-15,0],[2,-10],[26,0],[60,-8],[42,-74],[30,-104]],'#223b49','#071521',3);
  for(let j=-2;j<=2;j++)path([[j*13,-81],[j*19-5,-12],[j*19+7,-18],[j*13+6,-82]],'#4b6670','#162b36',1);
  line(-23,-16,-28,0,'#a8b1a0',7);line(24,-16,30,0,'#a8b1a0',7);
  path([[-38,-106],[-48,-80],[-22,-60],[0,-67],[28,-62],[44,-82],[34,-111]],fill,'#0c202b',3);
  for(let j=-1;j<=1;j++){ctx.strokeStyle='#a0b6ab';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-85,17+j*8,0,Math.PI);ctx.stroke();}
  ellipse(-37,-94,16,20,fill,-.5);ellipse(38,-94,16,20,fill,.5);
  path([[-30,-120],[-25,-151],[0,-164],[24,-150],[32,-120],[23,-101],[-22,-103]],b.hit>0?'#fffbdf':'#b6c4af','#162f39',3);
  path([[-24,-129],[0,-136],[25,-128],[20,-115],[-19,-116]],'#172d39',null);
  for(const x of [-11,10]){ellipse(x,-124,3.5,4,wind?'#fff0bd':accent);if(wind)glow(x,-124,19,'#ffd69b55');}
  path([[-24,-146],[-33,-169],[-15,-159],[0,-181],[15,-159],[32,-169],[23,-144]],'#879b91','#172d38',2);line(0,-170,0,-151,'#d5d9b8',2);
  ctx.save();ctx.translate(48,-89);ctx.rotate(wind?.75:b.state==='charge'?.45:.13);
  line(0,-55,0,72,'#152c35',10);line(-1,-55,-1,72,'#b9ae88',4);
  path([[-24,-60],[-19,-85],[17,-85],[24,-60],[29,-53],[-29,-53]],'#869889','#1a3039',2.5);
  ellipse(0,-52,30,7,accent);line(-13,-78,-16,-58,'#d1d2b1',1);line(12,-78,16,-58,'#d1d2b1',1);ctx.restore();ctx.restore();
  if(b.state==='leap'){glow(b.target,605,72,'#e4b57a66');line(b.target-48,607,b.target+48,607,'#ead19a',3);}
}
function platformArt(plat){
  if(plat.x+plat.w<cam-80||plat.x>cam+W+80)return;const floating=plat.h<100;
  const g=ctx.createLinearGradient(0,plat.y,0,plat.y+plat.h);g.addColorStop(0,'#263d49');g.addColorStop(.2,'#152a38');g.addColorStop(1,'#071321');
  path([[plat.x,plat.y],[plat.x+plat.w,plat.y],[plat.x+plat.w-5,plat.y+plat.h],[plat.x+8,plat.y+plat.h]],g,'#081520',2);
  for(let row=0;row<(floating?1:4);row++)for(let i=0;i<plat.w-40;i+=47){const x=plat.x+i+(row%2)*20,y=plat.y+row*30,seed=i+plat.x+row*7;line(x,y+3,x+37,y+3,'#6c858742',1);line(x+40,y+4,x+37,y+27,'#030e1970',2);if(rand(seed)>.55)line(x+6,y+5,x+13,y+18,'#9eb1a321',.8);}
  line(plat.x,plat.y,plat.x+plat.w,plat.y,'#a1b9ad',2.2);line(plat.x+4,plat.y+5,plat.x+plat.w-4,plat.y+5,'#58797a',1);
  for(let i=5;i<plat.w-5;i+=18){const x=plat.x+i,seed=x*.7,height=8+rand(seed)*18;
    if(x<cam-60||x>cam+W+60)continue;
    line(x,plat.y,x+Math.sin(time+seed)*3,plat.y-height,'#5d8580',1);
    if(rand(seed+7)>.6)fern(x,plat.y,20+rand(seed)*20,seed,'#507978');
    if(rand(seed+12)>.83){line(x,plat.y,x-3,plat.y-18,'#a7bfab',1);ellipse(x-3,plat.y-19,5,2.5,'#c8d9bc',.2);ellipse(x-3,plat.y-19,2,4,'#a9c5b3',.5);}
  }
  if(floating)for(let i=10;i<plat.w;i+=26){const x=plat.x+i,h=20+rand(x)*45;ctx.strokeStyle='#3c6264';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,plat.y+plat.h);ctx.quadraticCurveTo(x-8,plat.y+h,x+Math.sin(time+x)*4,plat.y+plat.h+h);ctx.stroke();for(let j=12;j<h;j+=12)ellipse(x-2,plat.y+plat.h+j,4,2,'#638680',-.5);}
}
function backdrop(){
  ctx.fillStyle='#071724';ctx.fillRect(0,0,W,H);
  if(art?.complete&&art.naturalWidth){const width=3000,height=width*art.naturalHeight/art.naturalWidth;ctx.drawImage(art,-cam*(width-W)/3720,-145,width,height);ctx.fillStyle='#07162420';ctx.fillRect(0,0,W,H);}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#122937');g.addColorStop(1,'#183943');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let i=0;i<12;i++)arch(i*180-cam*.24,80,130,620,'#5e84853a');}
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){const x=i*360-((cam*.23)%360)+Math.sin(time*.14+i)*22;const g=ctx.createLinearGradient(x,0,x+80,610);g.addColorStop(0,'#a1d4c307');g.addColorStop(.5,'#a1d4c312');g.addColorStop(1,'#a1d4c300');path([[x,0],[x+38,0],[x+260,660],[x+120,660]],g,null);}
  ctx.restore();
  for(let i=0;i<65;i++){const x=((i*173.17+Math.sin(time*.18+i)*35-cam*.12)%1340+1340)%1340,y=(i*91.3+Math.sin(time*.35+i)*30)%670;ellipse(x,y,i%3===0?1.4:.7,i%3===0?1.4:.7,'#c7e6d04a');}
}
function worldArt(){
  for(let i=0;i<21;i++){const x=i*257+45;if(x<cam-100||x>cam+W+100)continue;fern(x,614,50+rand(i)*45,i,'#294c52');if(i%3===1)lantern(x,380);
    if(i%4===2){line(x+25,610,x+22,565,'#65817a',3);ellipse(x+20,565,22,7,'#658f8c');line(x+20,564,x+20,550,'#91b7a7',1);glow(x+20,559,40,'#89cbb328');}}
  for(const plat of platforms)platformArt(plat);
  for(const x of [160,3260]){glow(x,553,150,'#e7cc8720');path([[x-40,581],[x-36,574],[x+36,574],[x+40,581]],'#7a9288','#142e39',2);
    for(const side of [-1,1]){line(x+side*29,581,x+side*34,610,'#9eaf98',3);line(x+side*32,574,x+side*36,551,'#788d83',2);ellipse(x+side*36,550,3,3,'#bec7a5');}
    for(let j=-2;j<=2;j++)line(x+j*12,574,x+j*12,555,'#7d9489',2);line(x-36,555,x+36,555,'#9aae9a',2);lantern(x-55,517,true);}
  // The lamplighter carries his tiny house of lights on a weathered spiral shell.
  ctx.save();ctx.translate(3100,580);ellipse(0,13,25,16,'#566e6a');ellipse(-5,-5,24,28,'#8a9c83');ctx.strokeStyle='#3b5759';ctx.lineWidth=2;ctx.beginPath();
  for(let a=0;a<Math.PI*5;a+=.1){const r=a*1.3,x=-5+Math.cos(a)*r,y=-5+Math.sin(a)*r;if(a===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
  ellipse(23,3,10,14,'#b9c8a5');for(const x of [20,28]){line(x,-7,x+2,-20,'#b9c8a5',2);ellipse(x+2,-20,2,3,'#dce9c1');}lantern(-8,-42);ctx.restore();
  for(const [x,y]of [[1250,410],[3000,340]]){path([[x-13,y],[x-14,y-34],[x-6,y-43],[x+10,y-37],[x+14,y]],'#567275','#152e39',2);for(let j=0;j<3;j++)line(x-6,y-13-j*7,x+6,y-15-j*7,'#b1c3a9',1);}
  for(const m of motes)if(!m.taken){const y=m.y+Math.sin(time*2+m.x)*7;glow(m.x,y,42,'#e9d49f44');for(let j=0;j<3;j++)ellipse(m.x+Math.sin(time+j*2)*7,y+Math.cos(time+j*2)*7,2,4,'#eddfb1',time+j);}
  if(deathCache){glow(deathCache.x,deathCache.y,65,'#b4e4d342');ellipse(deathCache.x,deathCache.y+Math.sin(time*3)*5,7,12,'#c5ecdc');ctx.strokeStyle='#aacac070';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(deathCache.x,deathCache.y,22,28,Math.sin(time)*.2,0,Math.PI*2);ctx.stroke();}
}
function effects(){
  for(const b of bolts){const color=b.friendly?'#c7f7e7':'#e5b787';glow(b.x,b.y,40,b.friendly?'#9eedde40':'#edac7440');ellipse(b.x,b.y,14,7,color,Math.atan2(b.vy,b.vx));line(b.x-b.vx*.05,b.y-b.vy*.05,b.x,b.y,color,3);}
  for(const w of waves){glow(w.x,w.y,45,'#f1c79350');path([[w.x-17,w.y+15],[w.x-6,w.y-19],[w.x+3,w.y-36],[w.x+8,w.y-7],[w.x+19,w.y+15]],'#ceac86','#f0d5a8',1);}
  if(player.attack>0){ctx.save();ctx.translate(player.x,player.y+20);if(player.attackDir==='up')ctx.rotate(-Math.PI/2);else if(player.attackDir==='down')ctx.rotate(Math.PI/2);else ctx.scale(player.face,1);
    const f=1-player.attack/.2;ctx.rotate(-.35+f*.7);ctx.globalAlpha=Math.min(1,player.attack*9);ctx.shadowColor='#d0f5e6';ctx.shadowBlur=14;
    path([[18,-43],[97,-8,53,49],[81,5,18,-43]],'#e8f7e8',null);line(8,0,70,12,'#fff8d9',2);ctx.restore();}
  for(const r of rings){ctx.globalAlpha=r.life/.45;ctx.strokeStyle=r.color;ctx.lineWidth=1+r.life*4;ctx.beginPath();ctx.arc(r.x,r.y,(1-r.life/.45)*r.size+3,0,Math.PI*2);ctx.stroke();}
  for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);line(p.x,p.y,p.x-p.vx*.025,p.y-p.vy*.025,p.color,p.size);}ctx.globalAlpha=1;
}
function draw(){
  const dpr=Math.min(devicePixelRatio||1,2),sw=innerWidth,sh=innerHeight;
  if(canvas.width!==Math.round(sw*dpr)||canvas.height!==Math.round(sh*dpr)){canvas.width=Math.round(sw*dpr);canvas.height=Math.round(sh*dpr);}
  const scale=Math.min(canvas.width/W,canvas.height/H),ox=(canvas.width-W*scale)/2,oy=(canvas.height-H*scale)/2;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#030b13';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.setTransform(scale,0,0,scale,ox,oy);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();backdrop();
  const cameraShake=reducedMotion?0:shake;
  ctx.save();ctx.translate(-cam+(Math.random()-.5)*cameraShake,(Math.random()-.5)*cameraShake);worldArt();
  for(const e of enemies)if(e.hp>0&&Math.abs(e.x-cam-W/2)<W/2+70)enemyArt(e);bossArt();
  if(boss.active)for(const x of [3620,4930]){glow(x,470,110,'#a7c4be25');for(let i=0;i<8;i++)line(x+Math.sin(time*2+i)*8,280+i*40,x+Math.cos(time*3+i)*9,330+i*40,'#a2bdb65a',3);}
  ellipse(player.x,player.y+player.h+1,21,4,'#020d1b66');if(player.dash>0)for(let i=1;i<5;i++)hero(player.x-player.face*i*23,player.y,player.face,true);
  if(mode!=='dead')hero(player.x,player.y,player.face);effects();ctx.restore();
  for(let i=0;i<5;i++){const x=((i*360+time*9-cam*.3)%1800+1800)%1800-220;glow(x,670,210,'#8caeb30b');}
  for(let i=0;i<8;i++){const x=i*225-((cam*.8)%225);fern(x,750,90+rand(i)*75,i,'#04111c');}
  const vignette=ctx.createRadialGradient(640,360,260,640,360,760);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#010a16a0');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
  if(flash>0&&!reducedMotion){ctx.fillStyle='#d8eee4';ctx.globalAlpha=flash*.8;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
  if(mode==='dead'){ctx.fillStyle='#07131dbb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#d9e5dd';ctx.font='italic 34px Georgia';ctx.textAlign='center';ctx.fillText('The light remembers you.',640,350);}ctx.restore();
}
function frame(ms){const dt=Math.min((ms-last)/1000,.033);last=ms;update(dt);pressed.clear();draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
