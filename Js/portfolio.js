/* ============================================================
   PORTFOLIO.JS — All JavaScript Logic
   Portfolio: Nguyen Kim Ngan
   Load order in index.html:
     1. page-flip CDN script
     2. portfolio-data.js
     3. portfolio.js  ← this file
   ============================================================ */

/* ── 1. CUSTOM CURSOR ── */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
if (cur && ring) {
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    cur.style.left=mx+'px'; cur.style.top=my+'px';
  });
  function animRing() {
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  document.querySelectorAll('a,button,.pcard,.info-card,.stat-block').forEach(el => {
    el.addEventListener('mouseenter', ()=>{ cur.style.width='16px'; cur.style.height='16px'; ring.style.width='52px'; ring.style.height='52px'; ring.style.borderColor='rgba(212,175,55,.7)'; });
    el.addEventListener('mouseleave', ()=>{ cur.style.width='10px'; cur.style.height='10px'; ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(212,175,55,.5)'; });
  });
}

/* ── 2. PARTICLE CANVAS ── */
(function(){
  const c=document.getElementById('cv'), ctx=c.getContext('2d');
  let W,H,pts=[];
  function resize(){W=c.width=innerWidth;H=c.height=innerHeight}
  window.addEventListener('resize',resize);resize();
  const cols=['rgba(212,175,55,','rgba(0,212,255,','rgba(237,228,213,'];
  for(let i=0;i<90;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.2+.3,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*.5+.1});
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.c+p.a+')';ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){ctx.beginPath();ctx.strokeStyle=`rgba(212,175,55,${.07*(1-d/110)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}}
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── 3. PORTFOLIO STATE ── */
let TABS={}, LB_ITEMS=[], lbIdx=0, activeTab='allwork', pfInstance=null, activePrintTab='editorial';
const PAGE_SIZE=12, pageState={};

async function loadPortfolio(){
  let tabs;
  try{const res=await fetch('/api/portfolio');if(res.ok){tabs=await res.json();}else{throw new Error();}}
  catch(e){if(typeof TABS_STATIC!=='undefined'){tabs=JSON.parse(JSON.stringify(TABS_STATIC));}else{return;}}
  if(!tabs.allwork){tabs.allwork={label:'All Work',images:Object.keys(tabs).flatMap(k=>tabs[k].images)};}
  TABS=tabs; buildTabContent(activeTab);
}

/* ── 4. ADVERTISING LAYOUT ── */
function buildLayoutA(data){
  const mount=document.getElementById('advertisingGrid');if(!mount)return;
  const ICONS={
    interior:`<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"><rect x="3" y="3" width="12" height="18" rx="1"/><rect x="15" y="9" width="6" height="12" rx="1"/><line x1="1" y1="21" x2="23" y2="21"/><rect x="6" y="7" width="2.5" height="2.5" rx=".3"/><rect x="10" y="7" width="2.5" height="2.5" rx=".3"/><rect x="6" y="12" width="2.5" height="2.5" rx=".3"/><rect x="10" y="12" width="2.5" height="2.5" rx=".3"/><rect x="17" y="13" width="2" height="2" rx=".3"/><rect x="7" y="17" width="4" height="4"/></svg>`,
    sports:`<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    hospitality:`<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    fnb:`<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
  };
  const SEC_ICONS={
    social:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    banner:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    flyer:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };
  const INDUSTRIES=[
    {key:'interior',label:'Interior &',accent:'Architecture',sub:'Sanitary · Residential · Fixtures',tags:['Sanitary','Residential','Fixtures'],desc:'Visual communication for modern living spaces, premium sanitary solutions, and architectural projects.',brand:'Interior & Architecture'},
    {key:'sports',label:'Fitness &',accent:'Wellness',sub:'Gym · Supplements · Lifestyle',tags:['Gym','Supplements','Lifestyle'],desc:'High-energy visual content crafted for sports nutrition brands — from social campaigns to e-commerce.',brand:'Fitness & Wellness'},
    {key:'hospitality',label:'Hospitality &',accent:'Travel',sub:'Boutique Homestay · Hotel',tags:['Boutique Homestay','Hotel'],desc:'Curated social content that invites guests in — warm, intimate storytelling for boutique hospitality.',brand:'Hospitality & Travel'},
    {key:'fnb',label:'Food &',accent:'Beverage',sub:'Restaurant · Café · Fine Dining',tags:['Restaurant','Café','Fine Dining'],desc:'Editorial food photography and menu content that makes guests hungry before they finish reading.',brand:'F&B'},
  ];
  const byBrand={};
  data.images.forEach(img=>{if(!byBrand[img.brand])byBrand[img.brand]=[];byBrand[img.brand].push(img);});
  INDUSTRIES.forEach(ind=>{ind.imgs=byBrand[ind.brand]||[];});
  const allOrdered=INDUSTRIES.flatMap(ind=>ind.imgs);
  LB_ITEMS=allOrdered;mount.innerHTML='';
  if(!document.getElementById('adv-styles')){
    const s=document.createElement('style');s.id='adv-styles';
    s.textContent=`.adv-layout{display:grid;grid-template-columns:320px 1fr;gap:0;border-top:1px solid var(--border);align-items:start}.adv-sidebar{border-right:1px solid var(--border);padding:1.25rem .85rem;display:flex;flex-direction:column;gap:.35rem;position:sticky;top:80px;max-height:calc(100vh - 100px);overflow-y:auto}.adv-cat-card{display:flex;align-items:center;gap:.85rem;padding:.85rem 1rem;border:1px solid transparent;border-radius:3px;cursor:pointer;transition:background .2s,border-color .2s;position:relative;overflow:hidden}.adv-cat-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--gold);transform:scaleY(0);transition:transform .24s;transform-origin:bottom}.adv-cat-card:hover{background:rgba(212,175,55,.05);border-color:var(--border)}.adv-cat-card.active{background:rgba(212,175,55,.08);border-color:rgba(212,175,55,.35)}.adv-cat-card.active::before{transform:scaleY(1)}.adv-cat-icon{width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center}.adv-cat-text{flex:1;min-width:0}.adv-cat-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;color:var(--text-primary);line-height:1.15;margin-bottom:.25rem}.adv-cat-sub{font-family:'Space Mono',monospace;font-size:.68rem;letter-spacing:.04em;color:var(--muted);line-height:1.45;opacity:.75}.adv-cat-arrow{color:var(--muted);font-size:.875rem;flex-shrink:0;transition:color .2s,transform .2s}.adv-cat-card.active .adv-cat-arrow,.adv-cat-card:hover .adv-cat-arrow{color:var(--gold);transform:translateX(2px)}.adv-content{padding:1.75rem 2.25rem;display:flex;flex-direction:column;gap:1.1rem}.adv-content-hero{display:grid;grid-template-columns:1fr auto;align-items:start;gap:1rem}.adv-content-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.35rem,2.4vw,2rem);line-height:1.05;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:.28rem}.adv-content-title .accent{display:block;background:linear-gradient(100deg,var(--gold) 0%,var(--gold2) 60%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.adv-title-line{width:28px;height:2px;background:var(--gold);margin-top:.45rem}.adv-content-desc{font-size:.875rem;color:var(--text-muted);font-weight:300;line-height:1.75;max-width:480px;margin-top:.4rem}.adv-tags-block{display:flex;flex-direction:column;align-items:flex-end;gap:.32rem;padding-top:.1rem}.adv-tag{font-family:'Syne',sans-serif;font-weight:700;font-size:.875rem;letter-spacing:.04em;color:var(--gold);white-space:nowrap;transition:opacity .2s}.adv-tag:hover{opacity:.7}.adv-sec-banner{display:flex;align-items:center;gap:1.25rem;padding:.85rem 1rem;background:linear-gradient(105deg,rgba(212,175,55,.055) 0%,transparent 60%);border:1px solid var(--border);border-left:2px solid var(--gold);margin-top:.6rem}.adv-sec-icon{flex-shrink:0;display:flex;align-items:center;justify-content:center}.adv-sec-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;color:var(--text-primary);white-space:nowrap;flex-shrink:0}.adv-sec-desc{font-family:'Space Mono',monospace;font-size:.8rem;letter-spacing:.04em;color:var(--muted);line-height:1.5;margin-left:auto;text-align:right}.adv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}.adv-grid-item{position:relative;overflow:hidden;background:var(--bg3);cursor:pointer;border:1px solid rgba(212,175,55,.07);aspect-ratio:1/1;transition:border-color .25s,box-shadow .3s}.adv-grid-item:hover{border-color:rgba(212,175,55,.3);box-shadow:0 8px 28px rgba(0,0,0,.4);z-index:4}.adv-grid-item img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.78) saturate(.88);transition:transform .55s cubic-bezier(.16,1,.3,1),filter .35s}.adv-grid-item:hover img{transform:scale(1.04);filter:brightness(1) saturate(1)}.adv-grid.flyer-grid .adv-grid-item{aspect-ratio:3/4}.adv-banner-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.adv-banner-item{position:relative;overflow:hidden;background:var(--bg3);cursor:pointer;border:1px solid rgba(212,175,55,.07);transition:border-color .25s}.adv-banner-item:hover{border-color:rgba(212,175,55,.28)}.adv-banner-item img{width:100%;height:auto;display:block;filter:brightness(.78) saturate(.88);transition:transform .55s,filter .35s}.adv-banner-item:hover img{transform:scale(1.02);filter:brightness(1) saturate(1)}.adv-mockup-section{margin-top:2rem}.adv-mockup-label{font-family:'Space Mono',monospace;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:1.25rem;display:flex;align-items:center;gap:1rem}.adv-mockup-label::before,.adv-mockup-label::after{content:'';flex:1;height:1px;background:var(--border)}.adv-pg-wrap{display:flex;justify-content:center;gap:.35rem;margin-top:.9rem}.adv-pg-btn{width:34px;height:34px;border:1px solid var(--border);background:var(--glass);color:var(--muted);font-family:'Space Mono',monospace;font-size:.875rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}.adv-pg-btn:hover:not(:disabled):not(.adv-pg-active){border-color:var(--gold);color:var(--gold)}.adv-pg-btn.adv-pg-active{background:var(--gold);border-color:var(--gold);color:var(--bg);font-weight:700}.adv-pg-btn:disabled{opacity:.25;cursor:default}.adv-pg-dots{font-size:.875rem;color:var(--muted);padding:0 .2rem;line-height:34px;font-family:'Space Mono',monospace}.adv-kupid-posts{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;align-items:start}.adv-fb-a{display:flex;flex-direction:column;gap:.4rem}.adv-fb-a-hero{width:100%;overflow:hidden;background:var(--bg3);cursor:pointer;border:1px solid rgba(212,175,55,.07);transition:border-color .25s}.adv-fb-a-hero img{width:100%;height:auto;display:block;filter:brightness(.78) saturate(.88);transition:filter .35s}.adv-fb-a-hero:hover{border-color:rgba(212,175,55,.28)}.adv-fb-a-hero:hover img{filter:brightness(1) saturate(1)}.adv-fb-a-thumbs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}.adv-fb-a-thumbs .adv-grid-item{aspect-ratio:1/1;border:1px solid rgba(212,175,55,.07)}.adv-fb-b{display:grid;grid-template-columns:70fr 30fr;gap:.4rem}.adv-fb-b-inner{display:contents}.adv-fb-b-hero{overflow:hidden;background:var(--bg3);cursor:pointer;border:1px solid rgba(212,175,55,.07);transition:border-color .25s}.adv-fb-b-hero img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.78) saturate(.88);transition:filter .35s}.adv-fb-b-hero:hover{border-color:rgba(212,175,55,.28)}.adv-fb-b-hero:hover img{filter:brightness(1) saturate(1)}.adv-fb-b-thumbs{display:flex;flex-direction:column;gap:.4rem}.adv-fb-b-thumb{flex:1;overflow:hidden;background:var(--bg3);cursor:pointer;border:1px solid rgba(212,175,55,.07);transition:border-color .25s;min-height:0}.adv-fb-b-thumb img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.78) saturate(.88);transition:filter .35s}.adv-fb-b-thumb:hover{border-color:rgba(212,175,55,.28)}.adv-fb-b-thumb:hover img{filter:brightness(1) saturate(1)}.adv-fb-post-lbl{font-family:'Space Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding:.2rem 0;margin-bottom:.3rem;display:flex;align-items:center;gap:.45rem}.adv-fb-post-lbl::before{content:'';width:8px;height:1px;background:var(--muted)}.adv-mockup-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}.adv-mockup-item{overflow:hidden;cursor:pointer;border:1px solid rgba(212,175,55,.07);transition:border-color .25s,box-shadow .3s}.adv-mockup-item:hover{border-color:rgba(212,175,55,.3);box-shadow:0 8px 28px rgba(0,0,0,.4)}.adv-mockup-item img{width:100%;height:auto;display:block;transition:transform .45s}.adv-mockup-item:hover img{transform:scale(1.03)}@media(max-width:900px){.adv-layout{grid-template-columns:1fr}.adv-sidebar{position:static;max-height:none;border-right:none;border-bottom:1px solid var(--border);flex-direction:row;flex-wrap:wrap;gap:.35rem;padding:.75rem}.adv-cat-card{flex:1;min-width:140px;padding:.6rem .7rem}.adv-cat-arrow{display:none}.adv-content{padding:.8rem}.adv-content-hero{grid-template-columns:1fr}.adv-tags-block{flex-direction:row;flex-wrap:wrap;justify-content:flex-start;margin-top:.5rem}.adv-grid{grid-template-columns:repeat(2,1fr)}.adv-banner-grid{grid-template-columns:1fr}.adv-kupid-posts{grid-template-columns:1fr}.adv-grid.flyer-grid{grid-template-columns:1fr 1fr}.adv-mockup-grid{grid-template-columns:repeat(2,1fr)}.adv-fb-b{grid-template-columns:1fr}}@media(min-width:901px) and (max-width:1200px){.adv-layout{grid-template-columns:260px 1fr}.adv-content{padding:1.25rem 1.5rem}.adv-content-title{font-size:clamp(1.2rem,2.2vw,1.7rem)}}`;
    document.head.appendChild(s);
  }
  const layout=document.createElement('div');layout.className='adv-layout';
  const sidebar=document.createElement('div');sidebar.className='adv-sidebar';
  let activeInd=INDUSTRIES[0];
  INDUSTRIES.forEach(ind=>{
    const card=document.createElement('div');card.className='adv-cat-card'+(ind.key===activeInd.key?' active':'');
    card.innerHTML=`<div class="adv-cat-icon">${ICONS[ind.key]}</div><div class="adv-cat-text"><div class="adv-cat-name">${ind.label} ${ind.accent}</div><div class="adv-cat-sub">${ind.sub}</div></div><span class="adv-cat-arrow">→</span>`;
    card.addEventListener('click',()=>{sidebar.querySelectorAll('.adv-cat-card').forEach(c=>c.classList.remove('active'));card.classList.add('active');activeInd=ind;renderContent(ind);});
    if(cur&&ring){card.addEventListener('mouseenter',()=>{cur.style.width='14px';cur.style.height='14px';ring.style.width='46px';ring.style.height='46px';ring.style.borderColor='rgba(212,175,55,.7)'});card.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';ring.style.width='36px';ring.style.height='36px';ring.style.borderColor='rgba(212,175,55,.5)'});}
    sidebar.appendChild(card);
  });
  layout.appendChild(sidebar);
  const content=document.createElement('div');content.className='adv-content';layout.appendChild(content);mount.appendChild(layout);
  function mkOv(title){return`<div class="adv-ov"><div class="adv-ov-title">${title}</div></div>`;}
  function mkCard(img,ratio){const gIdx=allOrdered.indexOf(img);const d=document.createElement('div');d.className='adv-grid-item';if(ratio)d.style.aspectRatio=ratio;d.innerHTML=`<img src="${img.src}" alt="${img.title}" loading="lazy" onerror="this.style.display='none'">`;d.addEventListener('click',()=>{LB_ITEMS=allOrdered;openLightbox(gIdx);});if(cur&&ring){d.addEventListener('mouseenter',()=>{cur.style.width='16px';cur.style.height='16px';ring.style.width='52px';ring.style.height='52px';ring.style.borderColor='rgba(212,175,55,.7)'});d.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';ring.style.width='36px';ring.style.height='36px';ring.style.borderColor='rgba(212,175,55,.5)'});}return d;}
  function mkNatCard(img,cls){const gIdx=allOrdered.indexOf(img);const d=document.createElement('div');d.className=cls;d.innerHTML=`<img src="${img.src}" alt="${img.title}" loading="lazy" onerror="this.style.display='none'">`;d.addEventListener('click',()=>{LB_ITEMS=allOrdered;openLightbox(gIdx);});if(cur&&ring){d.addEventListener('mouseenter',()=>{cur.style.width='16px';cur.style.height='16px';ring.style.width='52px';ring.style.height='52px';ring.style.borderColor='rgba(212,175,55,.7)'});d.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';ring.style.width='36px';ring.style.height='36px';ring.style.borderColor='rgba(212,175,55,.5)'});}return d;}
  function mkSimpleImg(img,cls){const gIdx=allOrdered.indexOf(img);const d=document.createElement('div');d.className=cls;const im=document.createElement('img');im.src=img.src;im.alt=img.title;im.loading='lazy';im.onerror=function(){this.style.display='none';};d.appendChild(im);d.addEventListener('click',()=>{LB_ITEMS=allOrdered;openLightbox(gIdx);});return d;}
  function buildPg(current,total,onChange){const wrap=document.createElement('div');wrap.className='adv-pg-wrap';const prev=document.createElement('button');prev.className='adv-pg-btn';prev.innerHTML='←';prev.disabled=current<=1;prev.onclick=()=>onChange(current-1);wrap.appendChild(prev);const pages=[];for(let p=1;p<=total;p++){if(p===1||p===total||(p>=current-1&&p<=current+1))pages.push(p);else if(pages[pages.length-1]!=='…')pages.push('…');}pages.forEach(p=>{if(p==='…'){const sp=document.createElement('span');sp.className='adv-pg-dots';sp.textContent='…';wrap.appendChild(sp);}else{const btn=document.createElement('button');btn.className='adv-pg-btn'+(p===current?' adv-pg-active':'');btn.textContent=p;btn.onclick=()=>onChange(p);wrap.appendChild(btn);}});const next=document.createElement('button');next.className='adv-pg-btn';next.innerHTML='→';next.disabled=current>=total;next.onclick=()=>onChange(current+1);wrap.appendChild(next);return wrap;}
  function renderPagSection(container,imgs,PER_PAGE,gridCls,ratio){PER_PAGE=PER_PAGE||8;const total=Math.ceil(imgs.length/PER_PAGE);const gw=document.createElement('div'),pw=document.createElement('div');container.appendChild(gw);container.appendChild(pw);function render(p){gw.innerHTML='';pw.innerHTML='';const grid=document.createElement('div');grid.className='adv-grid'+(gridCls?' '+gridCls:'');imgs.slice((p-1)*PER_PAGE,p*PER_PAGE).forEach(img=>grid.appendChild(mkCard(img,ratio)));gw.appendChild(grid);if(total>1)pw.appendChild(buildPg(p,total,render));}render(1);}
  function renderBannerSection(container,imgs){const PER_PAGE=6;const total=Math.ceil(imgs.length/PER_PAGE);const gw=document.createElement('div'),pw=document.createElement('div');container.appendChild(gw);container.appendChild(pw);function render(p){gw.innerHTML='';pw.innerHTML='';const grid=document.createElement('div');grid.className='adv-banner-grid';imgs.slice((p-1)*PER_PAGE,p*PER_PAGE).forEach(img=>grid.appendChild(mkNatCard(img,'adv-banner-item')));gw.appendChild(grid);if(total>1)pw.appendChild(buildPg(p,total,render));}render(1);}
  function mkSecBanner(iconKey,label,desc){const d=document.createElement('div');d.className='adv-sec-banner';d.innerHTML=`<div class="adv-sec-icon">${SEC_ICONS[iconKey]||SEC_ICONS.social}</div><span class="adv-sec-title">${label}</span><span class="adv-sec-desc">${desc}</span>`;return d;}
  function renderMockupBlock(container,imgs){if(!imgs||!imgs.length)return;const sec=document.createElement('div');sec.className='adv-mockup-section';sec.innerHTML=`<div class="adv-mockup-label"><span>Mockups</span></div>`;const grid=document.createElement('div');grid.className='adv-mockup-grid';imgs.forEach(img=>{const item=document.createElement('div');item.className='adv-mockup-item';item.innerHTML=`<img src="${img.src}" alt="${img.title}" loading="lazy" onerror="this.style.display='none'">`;item.addEventListener('click',()=>{LB_ITEMS=ind.imgs;openLightbox(ind.imgs.indexOf(img));});grid.appendChild(item);});sec.appendChild(grid);container.appendChild(sec);}
  function renderContent(ind){
    content.innerHTML='';
    const hero=document.createElement('div');hero.className='adv-content-hero';
    const left=document.createElement('div');left.innerHTML=`<div class="adv-content-title">${ind.label}<span class="accent">${ind.accent}</span></div><div class="adv-title-line"></div><div class="adv-content-desc">${ind.desc}</div>`;hero.appendChild(left);
    const tagsBlock=document.createElement('div');tagsBlock.className='adv-tags-block';ind.tags.forEach(t=>{const tag=document.createElement('span');tag.className='adv-tag';tag.textContent='#'+t;tagsBlock.appendChild(tag);});hero.appendChild(tagsBlock);content.appendChild(hero);
    if(ind.key==='interior'){
      content.appendChild(mkSecBanner('social','Social Media','Facebook & digital content for interior brand awareness.'));
      renderPagSection(content,ind.imgs,8,'','1/1');
    } else if(ind.key==='sports'){
      const social=ind.imgs.filter(i=>/fb.post|chatbot/i.test(i.src));
      const banners=ind.imgs.filter(i=>/web.banner|shopee/i.test(i.src));
      const product=ind.imgs.filter(i=>/product.banner/i.test(i.src));
      const flyer=ind.imgs.filter(i=>/flyer/i.test(i.src));
      const mockups=ind.imgs.filter(i=>/mockup/i.test(i.src));
      const rest=ind.imgs.filter(i=>[...social,...banners,...product,...flyer,...mockups].every(x=>x!==i));
      const socialAll=[...social,...rest];const bannersAll=[...banners,...product];
      if(socialAll.length){content.appendChild(mkSecBanner('social','Social Media','Facebook posts and digital campaigns.'));renderPagSection(content,socialAll,8,'','1/1');}
      if(bannersAll.length){content.appendChild(mkSecBanner('banner','Web & E-commerce Banners','Hero banners, Shopee visuals, and product key visuals.'));renderBannerSection(content,bannersAll);}
      if(flyer.length){content.appendChild(mkSecBanner('flyer','Flyer','Print-ready promotional flyers.'));renderPagSection(content,flyer,4,'flyer-grid','3/4');}
      renderMockupBlock(content,mockups.length?mockups:null);
    } else if(ind.key==='hospitality'){
      const imgs=ind.imgs;
      const mockups=imgs.filter(i=>/mockup/i.test(i.src));
      const posts=imgs.filter(i=>!/mockup/i.test(i.src));
      content.appendChild(mkSecBanner('social','Social Media','Facebook albums and seasonal campaigns.'));
      const postsWrap=document.createElement('div');postsWrap.className='adv-kupid-posts';
      // Post 1: landscape hero + 3 thumbs below
      const p1=document.createElement('div');
      const l1=document.createElement('div');l1.className='adv-fb-post-lbl';l1.textContent='Post 01 · Room & Nature';p1.appendChild(l1);
      const fbA=document.createElement('div');fbA.className='adv-fb-a';
      if(posts[0])fbA.appendChild(mkNatCard(posts[0],'adv-fb-a-hero'));
      const tA=document.createElement('div');tA.className='adv-fb-a-thumbs';
      [1,2,3].forEach(i=>{if(posts[i])tA.appendChild(mkCard(posts[i],'1/1'));});
      fbA.appendChild(tA);p1.appendChild(fbA);postsWrap.appendChild(p1);
      // Post 2: 60/40 split — portrait hero left + 3 square thumbs right, same total height as Post 1
      const p2=document.createElement('div');
      const l2=document.createElement('div');l2.className='adv-fb-post-lbl';l2.textContent='Post 02 · Season & Access';p2.appendChild(l2);
      const fbB=document.createElement('div');fbB.className='adv-fb-b';
      // Left: portrait image, fills full height of frame
      const heroWrap=document.createElement('div');heroWrap.className='adv-fb-b-hero';
      if(posts[4]){const im=document.createElement('img');im.src=posts[4].src;im.alt=posts[4].title;im.loading='lazy';heroWrap.appendChild(im);const gIdx=allOrdered.indexOf(posts[4]);heroWrap.addEventListener('click',()=>{LB_ITEMS=allOrdered;openLightbox(gIdx);});}
      fbB.appendChild(heroWrap);
      // Right: 3 equal-height thumbs, total height = hero height
      const tB=document.createElement('div');tB.className='adv-fb-b-thumbs';
      [5,6,7].forEach(i=>{
        if(posts[i]){
          const th=document.createElement('div');th.className='adv-fb-b-thumb';
          const im=document.createElement('img');im.src=posts[i].src;im.alt=posts[i].title;im.loading='lazy';
          th.appendChild(im);const gIdx=allOrdered.indexOf(posts[i]);
          th.addEventListener('click',()=>{LB_ITEMS=allOrdered;openLightbox(gIdx);});
          tB.appendChild(th);
        }
      });
      fbB.appendChild(tB);p2.appendChild(fbB);postsWrap.appendChild(p2);
      content.appendChild(postsWrap);
      // Sau khi ảnh load xong: sync chiều cao fbB = fbA
      const syncHeight=()=>{
        const fbAEl=postsWrap.querySelector('.adv-fb-a');
        const fbBEl=postsWrap.querySelector('.adv-fb-b');
        if(fbAEl&&fbBEl){const h=fbAEl.getBoundingClientRect().height;if(h>0)fbBEl.style.height=h+'px';}
      };
      requestAnimationFrame(()=>requestAnimationFrame(syncHeight));
      // Re-sync sau khi ảnh hero load (ảnh portrait có thể thay đổi chiều cao container)
      const heroImg=heroWrap.querySelector('img');
      if(heroImg)heroImg.addEventListener('load',()=>requestAnimationFrame(syncHeight));
      renderMockupBlock(content,mockups.length?mockups:null);
    } else if(ind.key==='fnb'){
      const mockups=ind.imgs.filter(i=>/mockup/i.test(i.src));
      const posts=ind.imgs.filter(i=>!/mockup/i.test(i.src));
      content.appendChild(mkSecBanner('social','Social Media','Facebook food editorial and seasonal menu posts.'));
      renderPagSection(content,posts,8,'','1/1');
      renderMockupBlock(content,mockups.length?mockups:null);
    }
  }
  renderContent(activeInd);
  layout.style.cssText='opacity:0;transform:translateY(14px);transition:opacity .55s ease,transform .55s ease';
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='none';ro.unobserve(e.target);}}),{threshold:0.04});ro.observe(layout);
}

/* ── 5. PRINT / MAGAZINE LAYOUT ── */
function buildLayoutB(data){
  if(!data)return;const container=document.getElementById('printContent');if(!container)return;
  const editorialImgs=data.images.filter(i=>i.type==='editorial');const posmImgs=data.images.filter(i=>i.type==='posm');const cardsImgs=data.images.filter(i=>i.type==='cards');
  const coverImgs=editorialImgs.filter(i=>/cover/i.test(i.title));const backImgs=editorialImgs.filter(i=>/back/i.test(i.title));const mockupImgs=editorialImgs.filter(i=>/mockup/i.test(i.title));const pageImgs=editorialImgs.filter(i=>!/cover|back|mockup/i.test(i.title));
  container.innerHTML='';
  if(activePrintTab==='editorial'){
    LB_ITEMS=[...pageImgs,...mockupImgs];
    container.innerHTML=`<div class="mag-section"><div class="mag-book-wrapper"><div class="mag-book-stage"><div id="magBook"></div></div><div class="mag-flip-controls"><button class="mag-flip-btn" id="magPrev" disabled>&#8592;</button><div class="mag-flip-indicator" id="magIndicator">Page 1</div><button class="mag-flip-btn" id="magNext">&#8594;</button></div></div><div class="mag-mockup-section" id="magMockupSection"></div></div>`;
    const book=document.getElementById('magBook');
    const coverEl=document.createElement('div');coverEl.className='mag-page mag-page-cover';coverEl.setAttribute('data-density','hard');const coverSrc=coverImgs.length?coverImgs[0].src:(pageImgs[0]?pageImgs[0].src:'');coverEl.innerHTML=coverSrc?`<div class="mag-cover-bg"><img src="${coverSrc}" alt="Cover" loading="lazy"></div>`:`<div style="width:100%;height:100%;background:#111;"></div>`;book.appendChild(coverEl);
    pageImgs.forEach((item,i)=>{const pg=document.createElement('div');pg.className='mag-page';pg.innerHTML=`<div class="mag-page-inner"><div class="mag-page-img-wrap" style="flex:1;overflow:hidden;"><img src="${item.src}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"></div></div>`;pg.querySelector('.mag-page-img-wrap').addEventListener('click',()=>{LB_ITEMS=pageImgs;openLightbox(i);});book.appendChild(pg);});
    const backEl=document.createElement('div');backEl.className='mag-page mag-page-back';backEl.setAttribute('data-density','hard');const backSrc=backImgs.length?backImgs[0].src:'';backEl.innerHTML=backSrc?`<div class="mag-cover-bg"><img src="${backSrc}" alt="Back" loading="lazy"></div>`:`<div style="width:100%;height:100%;background:#111;"></div>`;book.appendChild(backEl);
    if(typeof St!=='undefined'&&St.PageFlip){pfInstance=new St.PageFlip(book,{width:320,height:420,size:'stretch',minWidth:240,maxWidth:380,minHeight:300,maxHeight:490,showCover:true,drawShadow:true,maxShadowOpacity:0.35,flippingTime:750,usePortrait:window.innerWidth<700,mobileScrollSupport:true,swipeDistance:30});pfInstance.loadFromHTML(book.querySelectorAll('.mag-page'));pfInstance.on('flip',updateMagIndicator);pfInstance.on('changeState',updateMagIndicator);updateMagIndicator();document.getElementById('magPrev').onclick=()=>pfInstance&&pfInstance.flipPrev();document.getElementById('magNext').onclick=()=>pfInstance&&pfInstance.flipNext();}
    const mockupSection=document.getElementById('magMockupSection');
    if(mockupImgs.length){mockupSection.innerHTML=`<div class="mag-mockup-label"><span>Mockups</span></div><div id="magMockupGridWrap"></div>`;function renderMockupPage(pg){const wrap=document.getElementById('magMockupGridWrap');if(!wrap)return;const perPage=12,totalPg=Math.ceil(mockupImgs.length/perPage);const slice=mockupImgs.slice((pg-1)*perPage,pg*perPage);const grid=document.createElement('div');grid.className='port-grid';slice.forEach((item,i)=>{const card=document.createElement('div');card.className='pcard wide';card.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="pcard-overlay"><div class="pcard-title">${item.title}</div></div><div class="pcard-br"></div>`;card.addEventListener('click',()=>{LB_ITEMS=mockupImgs;openLightbox(i);});grid.appendChild(card);});wrap.innerHTML='';wrap.appendChild(grid);if(totalPg>1){const p=buildPagination(pg,totalPg,renderMockupPage);wrap.appendChild(p);}}renderMockupPage(1);}
  }else if(activePrintTab==='posm'){
    LB_ITEMS=posmImgs;if(!posmImgs.length){container.innerHTML='<div class="tab-empty">Coming soon</div>';return;}
    function renderPosmPage(pg){container.innerHTML='';const perPage=12,totalPg=Math.ceil(posmImgs.length/perPage);const grid=document.createElement('div');grid.className='port-grid';posmImgs.slice((pg-1)*perPage,pg*perPage).forEach((item,i)=>{const card=document.createElement('div');card.className='pcard wide';card.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="pcard-overlay"><div class="pcard-title">${item.title}</div></div><div class="pcard-br"></div>`;card.addEventListener('click',()=>{LB_ITEMS=posmImgs;openLightbox((pg-1)*perPage+i);});grid.appendChild(card);});container.appendChild(grid);if(totalPg>1)container.appendChild(buildPagination(pg,totalPg,renderPosmPage));}renderPosmPage(1);
  }else{
    LB_ITEMS=cardsImgs;if(!cardsImgs.length){container.innerHTML='<div class="tab-empty">Coming soon</div>';return;}
    function renderCardsPage(pg){container.innerHTML='';const perPage=12,totalPg=Math.ceil(cardsImgs.length/perPage);const grid=document.createElement('div');grid.className='port-grid';cardsImgs.slice((pg-1)*perPage,pg*perPage).forEach((item,i)=>{const card=document.createElement('div');card.className='pcard wide';card.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="pcard-overlay"><div class="pcard-title">${item.title}</div></div><div class="pcard-br"></div>`;card.addEventListener('click',()=>{LB_ITEMS=cardsImgs;openLightbox((pg-1)*perPage+i);});grid.appendChild(card);});container.appendChild(grid);if(totalPg>1)container.appendChild(buildPagination(pg,totalPg,renderCardsPage));}renderCardsPage(1);
  }
}

function updateMagIndicator(){if(!pfInstance)return;const curr=pfInstance.getCurrentPageIndex()+1,total=pfInstance.getPageCount();const indEl=document.getElementById('magIndicator'),prevEl=document.getElementById('magPrev'),nextEl=document.getElementById('magNext');if(indEl)indEl.textContent=`${curr} / ${total}`;if(prevEl)prevEl.disabled=curr<=1;if(nextEl)nextEl.disabled=curr>=total;}

/* ── 6. MASONRY GRID & PAGINATION ── */
function buildMasonryGrid(containerId,images,tab,cardClass){cardClass=cardClass||'pcard wide';const mount=document.getElementById(containerId);if(!mount)return;const pg=pageState[tab]||1;const total=images.length;const totalPages=Math.ceil(total/PAGE_SIZE);const slice=images.slice((pg-1)*PAGE_SIZE,pg*PAGE_SIZE);mount.innerHTML='';if(!total){mount.innerHTML='<div class="tab-empty">Coming soon</div>';return;}const grid=document.createElement('div');grid.className='port-grid';slice.forEach((item,i)=>{const globalIdx=(pg-1)*PAGE_SIZE+i;const card=document.createElement('div');card.className=cardClass;card.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="pcard-overlay"><div class="pcard-title">${item.title}</div><div class="pcard-cat">${(TABS[tab]||{}).label||''}</div></div><div class="pcard-br"></div>`;card.addEventListener('click',()=>{LB_ITEMS=images;openLightbox(globalIdx);});grid.appendChild(card);});mount.appendChild(grid);if(totalPages>1){mount.appendChild(buildPagination(pg,totalPages,(newPg)=>{pageState[tab]=newPg;buildMasonryGrid(containerId,images,tab,cardClass);}));}}

function buildPagination(current,total,onClick){const wrap=document.createElement('div');wrap.className='pg-wrap';const prev=document.createElement('button');prev.className='pg-btn';prev.textContent='←';prev.disabled=current<=1;prev.onclick=()=>onClick(current-1);wrap.appendChild(prev);const pages=[];for(let p=1;p<=total;p++){if(p===1||p===total||(p>=current-1&&p<=current+1))pages.push(p);else if(pages[pages.length-1]!=='…')pages.push('…');}pages.forEach(p=>{if(p==='…'){const d=document.createElement('span');d.className='pg-dots';d.textContent='…';wrap.appendChild(d);}else{const btn=document.createElement('button');btn.className='pg-btn'+(p===current?' pg-active':'');btn.textContent=p;btn.onclick=()=>onClick(p);wrap.appendChild(btn);}});const next=document.createElement('button');next.className='pg-btn';next.textContent='→';next.disabled=current>=total;next.onclick=()=>onClick(current+1);wrap.appendChild(next);return wrap;}

/* ── 7. TAB SWITCHING ── */
const GRID_IDS={allwork:'allWorkGrid',branding:'brandingGrid',featured:'featuredGrid',playground:'playgroundGrid'};
function buildTabContent(tab){const data=TABS[tab];if(!data)return;LB_ITEMS=data.images;if(tab==='advertising')buildLayoutA(data);else if(tab==='print')buildLayoutB(data);else buildMasonryGrid(GRID_IDS[tab],data.images,tab,'pcard wide');}
function switchTab(tab){if(tab===activeTab)return;if(activeTab==='print'&&pfInstance){try{pfInstance.destroy();}catch(e){}pfInstance=null;}pageState[tab]=1;activeTab=tab;document.querySelectorAll('.port-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===tab));buildTabContent(tab);}
document.querySelectorAll('.port-tab').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
document.querySelectorAll('.print-tab').forEach(btn=>{btn.addEventListener('click',()=>{if(activePrintTab==='editorial'&&pfInstance){try{pfInstance.destroy();}catch(e){}pfInstance=null;}activePrintTab=btn.dataset.print;document.querySelectorAll('.print-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');buildLayoutB(TABS['print']);});});
document.addEventListener('keydown',e=>{if(document.getElementById('lightbox').classList.contains('open'))return;if(activeTab==='print'&&activePrintTab==='editorial'&&pfInstance){if(e.key==='ArrowRight')pfInstance.flipNext();if(e.key==='ArrowLeft')pfInstance.flipPrev();}});

/* ── 8. LIGHTBOX ── */
const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),lbCap=document.getElementById('lbCaption'),lbCtr=document.getElementById('lbCounter');
function openLightbox(idx){lbIdx=idx;updateLb();lb.classList.add('open');document.body.style.overflow='hidden'}
function updateLb(){const it=LB_ITEMS[lbIdx];lbImg.src=it.src;lbImg.alt=it.title;lbCap.innerHTML=it.title+'<em>'+(TABS[activeTab]||{}).label+'</em>';lbCtr.textContent=(lbIdx+1)+' / '+LB_ITEMS.length}
function closeLb(){lb.classList.remove('open');document.body.style.overflow='';setTimeout(()=>lbImg.src='',300)}
document.getElementById('lbClose').addEventListener('click',closeLb);
document.getElementById('lbPrev').addEventListener('click',()=>{lbIdx=(lbIdx-1+LB_ITEMS.length)%LB_ITEMS.length;updateLb()});
document.getElementById('lbNext').addEventListener('click',()=>{lbIdx=(lbIdx+1)%LB_ITEMS.length;updateLb()});
lb.addEventListener('click',e=>{if(e.target===lb)closeLb()});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft'){lbIdx=(lbIdx-1+LB_ITEMS.length)%LB_ITEMS.length;updateLb()}if(e.key==='ArrowRight'){lbIdx=(lbIdx+1)%LB_ITEMS.length;updateLb()}});

/* ── 9. OBSERVERS ── */
window.addEventListener('scroll',()=>{document.getElementById('nav').classList.toggle('scrolled',scrollY>60);},{passive:true});
const fadeObs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');fadeObs.unobserve(e.target)}});},{threshold:.08});
document.querySelectorAll('.fade').forEach(el=>fadeObs.observe(el));

/* ── 10. NAV TOGGLE ── */
document.getElementById('navToggle').addEventListener('click',()=>{document.getElementById('navLinks').classList.toggle('open');});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{document.getElementById('navLinks').classList.remove('open');}));

/* ── INIT ── */
loadPortfolio();
