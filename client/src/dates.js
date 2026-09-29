export const pad=n=>String(n).padStart(2,'0');
export const leap=y=>y%4==0&&(y%100!=0||y%400==0);
export const dim=(y,m)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
export const P=v=>{const[a,b,c]=v.split('-').map(Number);return{y:a,m:b,d:c}};
export const U=o=>Date.UTC(o.y,o.m-1,o.d),cmp=(a,b)=>U(a)-U(b),DAY=864e5;
export const today=()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth()+1,d:n.getDate()}};
export const iso=o=>`${String(o.y).padStart(4,'0')}-${pad(o.m)}-${pad(o.d)}`;
export const fmt=o=>new Date(U(o)).toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'});
export const wd=o=>new Date(U(o)).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'long'});
export const fromMs=ms=>{const d=new Date(ms);return{y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate()}};
export function diff(a,b){ // a <= b
 if(a.m==2&&a.d==29&&!leap(b.y))a={...a,d:28};
 let y=b.y-a.y,m=b.m-a.m,d=b.d-a.d;
 if(d<0){m--;let pm=b.m-1,py=b.y;if(pm<1){pm=12;py--}d+=dim(py,pm)}
 if(m<0){y--;m+=12}
 return{y,m,d}}
export const bday=(y,o)=>({y,m:o.m,d:(o.m==2&&o.d==29&&!leap(y))?28:o.d});
export const isoWeek=o=>{const d=new Date(U(o)),n=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-n);return Math.ceil(((d-Date.UTC(d.getUTCFullYear(),0,1))/DAY+1)/7)};
export const doy=o=>(U(o)-Date.UTC(o.y,0,0))/DAY;
