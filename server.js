import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep))throw Error();const data=await readFile(file);res.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','png':'image/png','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Mothbound: http://127.0.0.1:'+(process.env.PORT||4173)));
