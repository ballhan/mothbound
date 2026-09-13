import vm from 'node:vm';
import {readFileSync} from 'node:fs';
export function game(initialSave=null){
  const nodes=new Map(),events=new Map(),timers=[];
  const context=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(t,p)=>p in t?t[p]:()=>{}});
  const node=()=>({style:{},getContext:()=>context,textContent:'',innerHTML:'',hidden:false,setAttribute(){}});
  let storage=initialSave?JSON.stringify(initialSave):null;
  const sandbox={document:{querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll:()=>[],body:{classList:{add(){},remove(){}}}},
    localStorage:{getItem:()=>storage,setItem:(_,v)=>storage=v},addEventListener:(name,handler)=>events.set(name,handler),requestAnimationFrame(){},
    setTimeout:fn=>timers.push(fn),devicePixelRatio:1,innerWidth:1280,innerHeight:720,Math,console};
  vm.createContext(sandbox);
  for(const file of ['engine.js','renderer.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),sandbox);
  const run=code=>vm.runInContext(code,sandbox);
  run.tick=(n=1)=>{for(let i=0;i<n;i++)run('update(1/60);pressed.clear()');};
  run.event=(name,code)=>events.get(name)?.({code,repeat:false,preventDefault(){}});
  run.timers=()=>timers.splice(0).forEach(fn=>fn());run.saved=()=>JSON.parse(storage);run.nodes=nodes;
  return run;
}
