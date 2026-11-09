// usage: node render.mjs videos/<name> [seconds=15] ; writes videos/<name>/out.mp4
import {createRequire} from 'module';const {chromium}=createRequire(import.meta.url)('playwright');import {execSync} from 'child_process';import {mkdirSync,rmSync} from 'fs';import {resolve} from 'path';
const dir=resolve(process.argv[2]),secs=+(process.argv[3]||15),fps=30,tmp=dir+'/.frames';
rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp);
const b=await chromium.launch(),p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+dir+'/index.html');await p.evaluate(()=>document.fonts.ready);
for(let f=0;f<secs*fps;f++){await p.evaluate(t=>window.render(t),f/fps);await p.screenshot({path:`${tmp}/${String(f).padStart(5,'0')}.png`})}
await b.close();
execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${tmp}/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${dir}/out.mp4`);
rmSync(tmp,{recursive:true});
