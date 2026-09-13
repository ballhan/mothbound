import {createCanvas,loadImage} from '@napi-rs/canvas';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const source=await loadImage(new URL('../assets/cathedral.png',import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,''));
const optimized=createCanvas(source.width,source.height);optimized.getContext('2d').drawImage(source,0,0);
writeFileSync(new URL('assets/cathedral.webp',root),await optimized.encode('webp',85));
const canvas=createCanvas(1280,720),nodes=new Map();
const node=()=>({style:{},setAttribute(){},textContent:'',innerHTML:'',hidden:false});
const sandbox={document:{querySelector:s=>{if(s==='#game')return canvas;if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll:()=>[],body:{classList:{add(){},remove(){}}}},localStorage:{getItem:()=>null,setItem(){}},addEventListener(){},requestAnimationFrame(){},setTimeout(){},devicePixelRatio:1,innerWidth:1280,innerHeight:720,Math,console};
vm.createContext(sandbox);
// Image has already been decoded for deterministic native Canvas rendering.
const engine=readFileSync(new URL('engine.js',root),'utf8').replace("const art=typeof Image!=='undefined'?new Image():null;","const art=loadedArt;").replace("if(art)art.src='assets/cathedral.webp';",'');
Object.defineProperties(source,{naturalWidth:{value:source.width},naturalHeight:{value:source.height},complete:{value:true}});sandbox.loadedArt=source;
vm.runInContext(engine+'\n'+readFileSync(new URL('renderer.js',root),'utf8'),sandbox);
mkdirSync(new URL('qa/',root),{recursive:true});
for(const [name,code]of [
  ['cloister',"mode='play';player.x=440;player.y=562;player.ground=true;cam=0;time=2;draw()"],
  ['garden',"player.x=1700;player.y=390;player.vx=210;cam=1250;time=4;draw()"],
  ['belfry',"player.x=4120;player.y=562;player.vx=0;cam=3720;boss.active=true;boss.state='wind';boss.phase=2;time=6;draw()"],
  ['mobile',"innerWidth=844;innerHeight=390;draw()"]
]){vm.runInContext(code,sandbox);writeFileSync(new URL('qa/'+name+'.png',root),canvas.toBuffer('image/png'));console.log('Rendered '+name);}
