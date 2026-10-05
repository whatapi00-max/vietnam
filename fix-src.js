const fs=require('fs'),path=require('path');
function* w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())yield*w(p);else if(e.name.endsWith('.html'))yield p;}}
let n=0;
for(const f of w('.')){
  let h=fs.readFileSync(f,'utf8'),o=h;
  const rel=f.split(path.sep).join('/');
  const depth=rel.split('/').length-1; // e.g. services/index.html -> 1
  const P='../'.repeat(depth);
  h=h.replace(/(src|href)="assets\//g, (m,a)=>a+'="'+P+'assets/');
  if(o!==h){fs.writeFileSync(f,h);n++;}
}
console.log('fixed files:',n);
