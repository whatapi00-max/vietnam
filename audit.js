const fs = require('fs'), path = require('path');
function* w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())yield*w(p);else if(e.name.endsWith('.html'))yield p;}}
const bad=[];
for(const f of w('.')){
  const dir='/'+path.dirname(f).split(path.sep).join('/').replace(/^\.?\/?/,'');
  const h=fs.readFileSync(f,'utf8');
  for(const m of h.matchAll(/(?:href|src)="([^"#]+)"/g)){
    let u=m[1];
    if(/^(https?:|mailto:|tel:|javascript:|data:)/.test(u))continue;
    if(!u.endsWith('.html')&&!u.includes('/assets/'))continue;
    const t=path.posix.resolve(dir,u); // '..' above root clamps to root, like a browser
    if(!fs.existsSync('.'+t))bad.push(f+' -> '+u);
  }
}
console.log('broken:',bad.length); bad.slice(0,30).forEach(b=>console.log(b));
