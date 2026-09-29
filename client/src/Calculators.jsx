import {useState,useEffect,useId} from 'react';
import {P,cmp,diff,bday,dim,leap,fmt,wd,doy,isoWeek,today,iso,fromMs,pad,U,DAY} from './dates.js';
const N=n=>Math.floor(n).toLocaleString('en-IN');
const ymd=r=>`${r.y} Years ${r.m} Months ${r.d} Days`;
const g=v=>v.iso?P(v.iso):(v.bad?'bad':null);
const E=t=><p className="er">{t}</p>;
const chk=(...v)=>v.includes(null)?<p className="mu">Enter the date(s) above (type DD/MM/YYYY or use the picker).</p>:v.includes('bad')?E('That isn’t a valid date.'):null;
const Card=({k,v})=><div className="c"><b>{v}</b><span>{k}</span></div>;
const blank={iso:'',bad:false},now0=()=>({iso:iso(today()),bad:false});
const Wrap=({children,out})=><><div className="box">{children}</div><div className="box" aria-live="polite">{out}</div></>;
const useNow=()=>{const[n,setN]=useState(()=>new Date());useEffect(()=>{const i=setInterval(()=>setN(new Date()),1000);return()=>clearInterval(i)},[]);return n};

function DateField({label,v,set}){
 const id=useId(),show=o=>`${pad(o.d)}/${pad(o.m)}/${o.y}`;
 const [t,setT]=useState(v.iso?show(P(v.iso)):'');
 const onText=e=>{const f=e.target.value.replace(/\D/g,'').slice(0,8).replace(/^(\d{2})(\d)/,'$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/,'$1/$2/$3');setT(f);
  const m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(f);
  if(m){const y=+m[3],mo=+m[2],d=+m[1];if(y>=1&&mo>=1&&mo<=12&&d>=1&&d<=dim(y,mo))return set({iso:iso({y,m:mo,d}),bad:false})}
  set({iso:'',bad:f.length===10})};
 const onPick=e=>{const x=e.target.value;setT(x?show(P(x)):'');set({iso:x,bad:false})};
 return <><label htmlFor={id}>{label}</label><div className="row"><input id={id} className="tx" inputMode="numeric" placeholder="DD/MM/YYYY" maxLength={10} value={t} onChange={onText} autoComplete="off"/><input type="date" aria-label={`${label} (date picker)`} value={v.iso} onChange={onPick}/></div></>};

function Share({text}){
 const [m,setM]=useState(''),full=`${text}\n\nCalculate yours: ${location.origin}/age-calculator`;
 const tip=s=>{setM(s);setTimeout(()=>setM(''),2000)};
 const img=()=>{const c=document.createElement('canvas');c.width=c.height=1080;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,1080,1080);gr.addColorStop(0,'#6c4cf5');gr.addColorStop(1,'#ff5c9a');x.fillStyle=gr;x.fillRect(0,0,1080,1080);x.fillStyle='#fff';x.textAlign='center';let y=200;
  text.split('\n').filter(Boolean).forEach((l,i)=>{x.font=(i===1?'bold 64px':'44px')+' system-ui,sans-serif';x.fillText(l,540,y,980);y+=i===1?110:80});x.font='36px system-ui,sans-serif';x.fillText('AgeNest',540,1010);
  const a=document.createElement('a');a.download='my-age.png';a.href=c.toDataURL('image/png');a.click()};
 return <div className="sh"><button onClick={()=>navigator.clipboard?.writeText(full).then(()=>tip('Copied!'),()=>tip('Copy failed'))}>Copy result</button>
 <button onClick={()=>navigator.share?navigator.share({text:full}).catch(()=>{}):navigator.clipboard?.writeText(full).then(()=>tip('Copied (sharing unsupported)'))}>Share</button>
 <button className="o" onClick={()=>window.open('https://wa.me/?text='+encodeURIComponent(full),'_blank','noopener')}>WhatsApp</button>
 <button className="o" onClick={img}>Download card</button><span className="mu">{m}</span></div>};

function Age(){
 const [a,setA]=useState(blank),[goal,setGoal]=useState(80),[hide,setHide]=useState(true),now=useNow();
 const d=g(a);let out=chk(d);
 if(!out){const t=today();if(cmp(d,t)>0)out=E('Date of birth can’t be in the future.');else{
  const r=diff(d,t),born=new Date(d.y,d.m-1,d.d),days=cmp(t,d)/DAY;
  let nb=bday(t.y,d);if(cmp(nb,t)<0)nb=bday(t.y+1,d);const nd=cmp(nb,t)/DAY,ms=Math.max(0,new Date(nb.y,nb.m-1,nb.d)-now);
  const G=Math.max(1,+goal||80),pct=Math.min(100,(r.y+r.m/12)/G*100),gd=bday(d.y+G,d),rem=cmp(gd,t)>0?ymd(diff(t,gd)):null;
  const text=`🎂 My Age\n\n${ymd(r)}\n${hide?'':'\nBorn: '+fmt(d)+'\n'}\nNext Birthday: ${fmt(nb)}`;
  out=<>
  <p className="big">{ymd(r)}</p>
  <div className="g"><Card k="Total months" v={N(r.y*12+r.m)}/><Card k="Total weeks" v={N(days/7)}/><Card k="Total days" v={N(days)}/><Card k="Total hours" v={N((now-born)/36e5)}/><Card k="Total minutes" v={N((now-born)/6e4)}/><Card k="Total seconds" v={N((now-born)/1e3)}/></div>
  <h2>🎉 Next birthday</h2><p>{nd===0?'It’s your birthday today! 🎂':<>{wd(nb)}, {fmt(nb)}. You’ll turn <b>{nb.y-d.y}</b>.</>}</p>
  <div className="g"><Card k="Days left" v={N(nd)}/><Card k="Live countdown" v={`${N(ms/DAY)}d ${pad(Math.floor(ms/36e5)%24)}h ${pad(Math.floor(ms/6e4)%60)}m ${pad(Math.floor(ms/1e3)%60)}s`}/></div>
  <h2>📅 Day of birth</h2><div className="g"><Card k="Weekday" v={wd(d)}/><Card k="Day of year" v={doy(d)}/><Card k="ISO week" v={isoWeek(d)}/><Card k="Leap year?" v={leap(d.y)?'Yes':'No'}/></div>
  <h2>🎯 Milestones</h2><table><tbody>{[18,21,25,30,40,50,60].map(n=>{const o=bday(d.y+n,d),k=cmp(o,t)/DAY;return <tr key={n}><td>{n}th birthday</td><td>{wd(o)}, {fmt(o)}</td><td>{k<0?'✓ done':k===0?'today 🎉':`in ${N(k)} days`}</td></tr>})}</tbody></table>
  <h2>📊 Progress to age {G}</h2><div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100"><i style={{width:pct+'%'}}/></div><p className="mu">{pct.toFixed(1)}% of the way. {rem?`Remaining: ${rem}.`:'You’ve already passed this age.'}</p>
  <Share text={text}/></>}}
 return <Wrap out={out}><DateField label="Date of birth" v={a} set={setA}/><label htmlFor="goal">Progress goal age (you choose)</label><input id="goal" type="number" min="1" max="150" value={goal} onChange={e=>setGoal(e.target.value)}/><label className="ck"><input type="checkbox" checked={hide} onChange={e=>setHide(e.target.checked)}/> Hide my date of birth on shared results</label></Wrap>};

function OnDate(){const [a,setA]=useState(blank),[b,setB]=useState(now0);const x=g(a),y=g(b);let out=chk(x,y);
 if(!out){if(cmp(x,y)>0)out=E('Target date is before the date of birth.');else{const r=diff(x,y);out=<><p className="big">{ymd(r)}</p><p>On {wd(y)}, {fmt(y)}. That’s {N(cmp(y,x)/DAY)} days.</p><Share text={`🎂 Age on ${fmt(y)}\n${ymd(r)}`}/></>}}
 return <Wrap out={out}><DateField label="Date of birth" v={a} set={setA}/><DateField label="Age as on (target/cut-off date)" v={b} set={setB}/></Wrap>}

function Diff(){const [a,setA]=useState(blank),[b,setB]=useState(blank);let x=g(a),y=g(b),out=chk(x,y);
 if(!out){let w=1;if(cmp(x,y)>0){[x,y]=[y,x];w=2}
  out=!cmp(x,y)?<p className="big">Same birth date 🎉</p>:(()=>{const r=diff(x,y);return <><p className="big">{ymd(r)}</p><p>Person {w} is older. Total: {N(cmp(y,x)/DAY)} days.</p><Share text={`👥 Age difference\n${ymd(r)}`}/></>})()}
 return <Wrap out={out}><DateField label="Person 1 date of birth" v={a} set={setA}/><DateField label="Person 2 date of birth" v={b} set={setB}/></Wrap>}

function DateDiff(){const [a,setA]=useState(blank),[b,setB]=useState(blank);let x=g(a),y=g(b),out=chk(x,y);
 if(!out){if(cmp(x,y)>0)[x,y]=[y,x];const r=diff(x,y),d=cmp(y,x)/DAY;out=<><p className="big">{ymd(r)}</p><div className="g"><Card k="Days" v={N(d)}/><Card k="Weeks" v={`${N(d/7)} + ${d%7} d`}/><Card k="Months" v={`${r.y*12+r.m} + ${r.d} d`}/><Card k="Years (approx)" v={(d/365.25).toFixed(2)}/></div></>}
 return <Wrap out={out}><DateField label="Start date" v={a} set={setA}/><DateField label="End date" v={b} set={setB}/></Wrap>}

function Birthday(){const [a,setA]=useState(blank),d=g(a);let out=chk(d);
 if(!out){const t=today();if(cmp(d,t)>0)out=E('Date of birth can’t be in the future.');else{let nb=bday(t.y,d),pb;if(cmp(nb,t)<0){pb=nb;nb=bday(t.y+1,d)}else pb=bday(cmp(nb,t)?t.y-1:t.y,d);
  out=<div className="g"><Card k="Next birthday" v={`${wd(nb)}, ${fmt(nb)}`}/><Card k="Days until" v={N(cmp(nb,t)/DAY)}/><Card k="Previous birthday" v={`${wd(pb)}, ${fmt(pb)}`}/><Card k="Turning" v={nb.y-d.y}/></div>}}
 return <Wrap out={out}><DateField label="Date of birth" v={a} set={setA}/></Wrap>}

function LeapYear(){const [y,setY]=useState(today().y),Y=+y;let out=<p className="mu">Enter a year.</p>;
 if(Y>=1){const l=leap(Y),why=Y%400===0?'divisible by 400':Y%100===0?'divisible by 100 but not by 400':Y%4===0?'divisible by 4 and not by 100':'not divisible by 4';let n=Y+1;while(!leap(n))n++;
  out=<><p className="big">{Y} {l?'is':'is not'} a leap year</p><p>Because it is {why}. Next leap year: {n}.</p></>}
 return <Wrap out={out}><label htmlFor="y">Year</label><input id="y" type="number" value={y} onChange={e=>setY(e.target.value)}/></Wrap>}

function AddDays(){const [a,setA]=useState(now0),[n,setN]=useState(30),[op,setOp]=useState(1),x=g(a);let out=chk(x);
 if(!out){const o=fromMs(U(x)+op*(+n||0)*DAY);out=<><p className="big">{fmt(o)}</p><p>{wd(o)}</p></>}
 return <Wrap out={out}><DateField label="Start date" v={a} set={setA}/><label htmlFor="n">Number of days</label><input id="n" type="number" min="0" value={n} onChange={e=>setN(e.target.value)}/><label htmlFor="op">Operation</label><select id="op" value={op} onChange={e=>setOp(+e.target.value)}><option value={1}>Add</option><option value={-1}>Subtract</option></select></Wrap>}

const PL={Mercury:.2408,Venus:.6152,Earth:1,Mars:1.8808,Jupiter:11.862,Saturn:29.457};
function Planets(){const [a,setA]=useState(blank),d=g(a);let out=chk(d);
 if(!out){const t=today();if(cmp(d,t)>0)out=E('Date of birth can’t be in the future.');else{const yrs=cmp(t,d)/DAY/365.25;out=<><div className="g">{Object.entries(PL).map(([k,v])=><Card key={k} k={k+' years'} v={(yrs/v).toFixed(2)}/>)}</div><p className="mu">Approximate orbital-year conversion, not biological age.</p></>}}
 return <Wrap out={out}><DateField label="Date of birth" v={a} set={setA}/></Wrap>}

const MAP={age:Age,on:OnDate,diff:Diff,dd:DateDiff,bd:Birthday,lp:LeapYear,add:AddDays,pl:Planets};
export default function Calculator({tab}){const C=MAP[tab]||Age;return <C key={tab}/>}
