import 'dotenv/config';
import express from 'express';import mongoose from 'mongoose';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const {calcs,guides,statics}=JSON.parse(fs.readFileSync(path.join(root,'client/src/pages.json'),'utf8'));
const PORT=process.env.PORT||5000,SITE=(process.env.SITE||`http://localhost:${PORT}`).replace(/\/$/,'');
const CFG={owner:process.env.OWNER||'PJVerse',contact:process.env.CONTACT_EMAIL||'hello@example.com'};
const sub=h=>h.replaceAll('{{OWNER}}',CFG.owner).replaceAll('{{CONTACT}}',CFG.contact);
const plain=h=>sub(h).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,155);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const all=[...calcs.map(c=>({...c,kind:'calc'})),{path:'/guides',title:'Guides | AgeNest',desc:'Guides on calculating age and dates.',h1:'Guides',body:'',kind:'doc'},
 ...guides.map(g=>({...g,title:g.title+' | AgeNest',desc:plain(g.body),h1:g.title,kind:'doc'})),
 ...statics.map(s=>({...s,title:s.title+' | AgeNest',desc:plain(s.body),h1:s.title,kind:'doc'}))];

// ---- optional MongoDB (site works without it) ----
let db=false;
const Contact=mongoose.model('Contact',new mongoose.Schema({name:String,email:String,message:String,createdAt:{type:Date,default:Date.now}}));
const Hit=mongoose.model('Hit',new mongoose.Schema({path:String,day:String,count:{type:Number,default:0}}).index({path:1,day:1},{unique:true}));
if(process.env.MONGODB_URI)mongoose.connect(process.env.MONGODB_URI).then(()=>{db=true;console.log('MongoDB connected')}).catch(e=>console.error('MongoDB error:',e.message));

const app=express();app.disable('x-powered-by');app.set('trust proxy',1);app.use(express.json({limit:'10kb'}));
const known=new Set(all.map(p=>p.path));
const tries=new Map();
app.post('/api/contact',async(req,res)=>{
 const now=Date.now(),t=(tries.get(req.ip)||[]).filter(x=>now-x<36e5);if(t.length>=5)return res.status(429).json({message:'Too many messages. Try again later.'});
 const {name,email,message}=req.body||{};
 if(![name,email,message].every(v=>typeof v==='string'&&v.trim())||!/^\S+@\S+\.\S+$/.test(email)||message.length>2000)return res.status(400).json({message:'Please fill all fields with valid values.'});
 if(!db)return res.status(503).json({message:`Message storage is not set up. Please email ${CFG.contact}.`});
 tries.set(req.ip,[...t,now]);await Contact.create({name:name.slice(0,100),email:email.slice(0,200),message});res.json({message:'Thanks! We got your message.'})});
app.post('/api/hit',async(req,res)=>{ // anonymous page-view count: path + day only. No IP, no dates entered.
 const p=req.body?.path;if(db&&typeof p==='string'&&known.has(p))await Hit.updateOne({path:p,day:new Date().toISOString().slice(0,10)},{$inc:{count:1}},{upsert:true}).catch(()=>{});res.sendStatus(204)});
app.get('/robots.txt',(q,r)=>r.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`));
app.get('/sitemap.xml',(q,r)=>{const d=new Date().toISOString().slice(0,10);r.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(p=>`<url><loc>${SITE}${p.path}</loc><lastmod>${d}</lastmod></url>`).join('\n')}\n</urlset>\n`)});
for(const p of ['/how-old-am-i','/dob-calculator'])app.get(p,(q,r)=>r.redirect(301,'/age-calculator'));

const dist=path.join(root,'dist');
app.use(express.static(dist,{index:false,maxAge:'1h'}));
const ld=p=>p.kind==='calc'?`<script type="application/ld+json">${JSON.stringify([{'@context':'https://schema.org','@type':'FAQPage',mainEntity:p.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},{'@context':'https://schema.org','@type':'WebApplication',name:p.h1,url:SITE+p.path,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}}]).replace(/</g,'\\u003c')}</script>`:'';
app.get('*',(req,res)=>{
 let file;try{file=fs.readFileSync(path.join(dist,'index.html'),'utf8')}catch{return res.status(500).send('Run "npm run build" first.')}
 const url=req.path.replace(/(.)\/+$/,'$1'),p=all.find(x=>x.path===url)||all.find(x=>x.path==='/age-calculator');
 const title=p?p.title:'Page not found | AgeNest',desc=p?p.desc:'',canon=SITE+(url==='/'?'/':p?p.path:'/age-calculator');
 const meta=`<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${canon}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}"><meta name="twitter:card" content="summary"><meta name="theme-color" content="#6c4cf5"><script>window.__CFG__=${JSON.stringify(CFG).replace(/</g,'\\u003c')}</script>${p?ld(p):''}`;
 const app_=p?`<h1>${esc(p.h1)}</h1>${p.lead?`<p>${esc(p.lead)}</p>`:''}${sub(p.body)}`:'';
 res.status(p?200:404).send(file.replace(/<title>.*?<\/title>/,`<title>${esc(title)}</title>`).replace('<!--META-->',()=>meta).replace('<!--APP-->',()=>app_))
});
app.listen(PORT,()=>console.log(`AgeNest running on ${SITE} (port ${PORT})`));
