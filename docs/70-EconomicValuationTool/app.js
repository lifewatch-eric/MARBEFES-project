(() => {
const book=window.EV_WORKBOOK, storeKey='marbefes-evtool-v1'; let active=0;
let userData={}; try{userData=JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{userData={}}
const tabs=document.getElementById('tabs'), host=document.getElementById('sheet'), status=document.getElementById('status');
const colLetters=n=>{let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s};
const parseRef=r=>{const m=/^([A-Z]+)(\d+)$/.exec(r);let c=0;for(const x of m[1])c=c*26+x.charCodeAt(0)-64;return[c,+m[2]]};
const fmt=n=>{if(typeof n!=='number'||!Number.isFinite(n))return n??'';return new Intl.NumberFormat('en-GB',{maximumFractionDigits:2,minimumFractionDigits:2}).format(n)};
function raw(sheet,ref,stack=new Set()){
 const c=sheet.cells[ref]; if(!c)return 0; const saved=userData[sheet.name]?.[ref]; if(c.e&&saved!==undefined){const n=Number(saved);return saved===''?0:(Number.isFinite(n)?n:saved)}
 if(!c.f)return c.v??0; if(stack.has(ref))return NaN; stack.add(ref);
 let f=c.f.replace(/^\+/,'');
 f=f.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/gi,(_,a,b)=>{const [c1,r1]=parseRef(a),[c2,r2]=parseRef(b);let sum=0;for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const v=raw(sheet,colLetters(c)+r,new Set(stack));sum+=Number(v)||0}return String(sum)});
 f=f.replace(/\b([A-Z]+\d+)\b/g,(_,r)=>String(Number(raw(sheet,r,new Set(stack)))||0));
 if(!/^[0-9+\-*/().\s]+$/.test(f))return NaN;
 try{const v=Function('"use strict";return ('+f+')')();return Number.isFinite(v)?v:0}catch{return NaN}
}
function render(){
 const s=book.sheets[active]; host.innerHTML='';
 const grid=document.createElement('div');grid.className='grid';
 const widths=[];for(let c=1;c<=s.cols;c++)widths.push(Math.max(28,Math.min(310,(s.colWidths[c]||10)*7))+'px');grid.style.gridTemplateColumns=widths.join(' ');
 const mergeStart={},covered=new Set(); for(const m of s.merges){const [a,b]=m.split(':');const [c1,r1]=parseRef(a),[c2,r2]=parseRef(b||a);mergeStart[a]={cs:c2-c1+1,rs:r2-r1+1};for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const x=colLetters(c)+r;if(x!==a)covered.add(x)}}
 for(let r=1;r<=s.rows;r++)for(let c=1;c<=s.cols;c++){
  const ref=colLetters(c)+r;if(covered.has(ref))continue;const meta=s.cells[ref]||{v:null,s:0,e:false};const st=book.styles[meta.s]||book.styles[0];const el=document.createElement('div');el.className='cell';el.dataset.ref=ref;
  if(mergeStart[ref]){el.style.gridColumn='span '+mergeStart[ref].cs;el.style.gridRow='span '+mergeStart[ref].rs}
  if(st.fill&&st.fill!=='transparent')el.style.backgroundColor=st.fill;if(st.font?.bold)el.classList.add('bold');if(st.font?.color)el.style.color=st.font.color;
  let v=meta.f?raw(s,ref):(userData[s.name]?.[ref]!==undefined?userData[s.name][ref]:meta.v);
  const numeric=typeof v==='number'; if(!numeric)el.classList.add('text');
  if(meta.e){el.classList.add('input');el.contentEditable='true';el.setAttribute('role','textbox');el.setAttribute('aria-label',`${s.name} ${ref}`);el.textContent=v??'';el.addEventListener('blur',()=>saveInput(s,ref,el.textContent.trim()));el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur()}})}
  else {if(meta.f)el.classList.add('output');if(meta.f&&!Number.isFinite(v)){el.classList.add('error');el.textContent='Error'}else el.textContent=numeric?fmt(v):(v??'')}
  grid.appendChild(el)
 }
 host.appendChild(grid)
}
function saveInput(s,ref,value){userData[s.name]??={};userData[s.name][ref]=value;localStorage.setItem(storeKey,JSON.stringify(userData));render();show('Saved locally in this browser.')}
function show(t){status.className='status';status.textContent=t;setTimeout(()=>status.textContent='',2200)}
book.sheets.forEach((s,i)=>{const b=document.createElement('button');b.className='tab'+(i===0?' active':'');b.textContent=s.name;b.onclick=()=>{active=i;[...tabs.children].forEach((x,j)=>x.classList.toggle('active',j===i));render()};tabs.appendChild(b)});
document.getElementById('resetBtn').onclick=()=>{if(confirm('Reset all fields to the original clean version?')){userData={};localStorage.removeItem(storeKey);render();show('The tool has been reset.')}};
document.getElementById('downloadBtn').onclick=()=>{const rows=[['Sheet','Cell','Value']];for(const s of book.sheets)for(const [ref,val] of Object.entries(userData[s.name]||{}))rows.push([s.name,ref,val]);const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='economic-valuation-responses.csv';a.click();URL.revokeObjectURL(a.href)};
render();
})();