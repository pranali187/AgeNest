import {useState,useEffect} from 'react';
import {Routes,Route,NavLink,Link,useLocation} from 'react-router-dom';
import pages from './pages.json';
import Calculator from './Calculators.jsx';
const CFG={owner:'PJVerse',contact:'pranalijagadale77@gmail.com',...(window.__CFG__||{})};
const sub=h=>h.replaceAll('{{OWNER}}',CFG.owner).replaceAll('{{CONTACT}}',CFG.contact);
const Html=({h})=><div dangerouslySetInnerHTML={{__html:sub(h)}}/>;
const NAMES={age:'Age',on:'Age on Date',diff:'Age Difference',dd:'Date Difference',bd:'Birthday',lp:'Leap Year',add:'Add/Subtract Days',pl:'Planets'};
function setMeta(t,d){document.title=t;let m=document.querySelector('meta[name="description"]');m||(m=document.createElement('meta'),m.name='description',document.head.appendChild(m));d&&(m.content=d);let c=document.querySelector('link[rel="canonical"]');c||(c=document.createElement('link'),c.rel='canonical',document.head.appendChild(c));c.href=window.location.origin+window.location.pathname}
function useHit(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0);fetch('/api/hit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:pathname})}).catch(()=>{})},[pathname])}
function CalcPage({p}){useEffect(()=>setMeta(p.title,p.desc),[p]);
 return <main><h1>{p.h1}</h1><p className="lead">{p.lead}</p><Calculator tab={p.tab}/>
 <section className="box" id="about"><Html h={p.body}/><h2>FAQ</h2>{p.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section></main>}
function Doc({p,children}){useEffect(()=>setMeta(p.title+' | AgeNest',''),[p]);return <main className="box"><h1>{p.title}</h1><Html h={p.body}/>{children}</main>}
function ContactForm(){const [f,setF]=useState({name:'',email:'',message:''}),[s,setS]=useState('');
 const send=async e=>{e.preventDefault();setS('Sending…');try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}),j=await r.json();setS(j.message||'Done');if(r.ok)setF({name:'',email:'',message:''})}catch{setS('Network error. Please email us instead.')}};
 const on=k=>e=>setF({...f,[k]:e.target.value});
 return <form onSubmit={send}><h2>Send a message</h2><label htmlFor="cn">Name</label><input id="cn" required maxLength={100} value={f.name} onChange={on('name')}/><label htmlFor="ce">Email</label><input id="ce" type="email" required maxLength={200} value={f.email} onChange={on('email')}/><label htmlFor="cm">Message (please don’t include your date of birth)</label><textarea id="cm" required maxLength={2000} value={f.message} onChange={on('message')}/><button className="p" type="submit">Send</button> <span className="mu">{s}</span></form>}
export default function App(){
 useHit();
 const [dark,setDark]=useState(null);
 useEffect(()=>{if(dark!==null)document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);
 const {calcs,guides,statics}=pages,age=calcs[0],links=[...calcs.map(c=>[c.path,c.h1.split(':')[0]]),...guides.map(g=>[g.path,g.title]),...statics.map(s=>[s.path,s.title])];
 return <div className="w">
  <header><Link className="logo" to="/">🎂 AgeNest</Link><button className="tg" aria-label="Toggle dark mode" onClick={()=>setDark(d=>d===null?!matchMedia('(prefers-color-scheme: dark)').matches:!d)}>🌙</button></header>
  <nav aria-label="Calculators">{calcs.map(c=><NavLink key={c.path} to={c.path}>{NAMES[c.tab]}</NavLink>)}</nav>
  <Routes>
   <Route path="/" element={<CalcPage p={age}/>}/>
   {calcs.map(c=><Route key={c.path} path={c.path} element={<CalcPage p={c}/>}/>)}
   <Route path="/guides" element={<Doc p={{title:'Guides',body:'<ul>'+guides.map(g=>`<li><a href="${g.path}">${g.title}</a></li>`).join('')+'</ul>'}}/>}/>
   {guides.map(g=><Route key={g.path} path={g.path} element={<Doc p={g}><p><Link to="/age-calculator">Try the Age Calculator</Link></p></Doc>}/>)}
   {statics.map(s=><Route key={s.path} path={s.path} element={<Doc p={s}>{s.path==='/contact'&&<ContactForm/>}</Doc>}/>)}
   <Route path="*" element={<Doc p={{title:'Page not found',body:'<p>That page does not exist. <a href="/age-calculator">Go to the Age Calculator</a>.</p>'}}/>}/>
  </Routes>
  <footer><p>{links.map(([p,n],i)=><span key={p}>{i>0&&' · '}<Link to={p}>{n}</Link></span>)}</p><p>🔒 Your date of birth is processed locally in your browser.</p><p>© {new Date().getFullYear()} {CFG.owner}. All rights reserved.</p></footer>
 </div>}
