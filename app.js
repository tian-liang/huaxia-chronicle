// 页面渲染与交互逻辑
function figureSVG(kind){
  return `<svg class="fig" viewBox="0 0 242 340" aria-hidden="true">
    <ellipse cx="121" cy="152" rx="110" ry="134" fill="url(#halo)"/>
    ${PARTS[kind]||PARTS.emperor}
    <g class="eyes"><ellipse cx="111" cy="102" rx="3.3" ry="2.1"/><ellipse cx="133" cy="102" rx="3.3" ry="2.1"/></g>
  </svg>`;
}


function portraitHTML(files, alt, kind){
  const list=(Array.isArray(files)?files:[files]).map(f=>CD+f+'?width=900');
  return `<div class="portrait" data-srcs='${JSON.stringify(list)}'>
    <img src="${list[0]}" alt="${alt}" loading="lazy" decoding="async">
    <div class="portrait-fb">${figureSVG(kind)}</div>
  </div>`;
}


function cnNum(n){
  const d='〇一二三四五六七八九';
  if(n<10) return d[n];
  if(n===10) return '十';
  if(n<20) return '十'+d[n-10];
  return d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:'');
}
function nameSize(n){const L=[...n].length;return L<=2?30:L===3?25:L===4?21:17;}

function eventsHTML(list){
  return list.map((e,i)=>`
    <article class="ev ${i%2?'ev-down':'ev-up'} reveal" style="--i:${i}"
      tabindex="0" role="button" aria-label="${e.y} ${e.t}" data-ev="${i}">
      <div class="ev-card">
        <h4 class="ev-title">${e.t}</h4>
        <p class="ev-desc">${e.d}</p>
        <span class="ev-more">Detail +</span>
      </div>
      <div class="ev-node"><span class="ev-dot"></span><span class="ev-year">${e.y}</span></div>
    </article>`).join('');
}
function emperorsHTML(list){
  return list.map((p,i)=>`
    <article class="emp reveal" style="--i:${i%8}">
      <div class="emp-no">${cnNum(i+1)}</div>
      <div class="emp-body"><div class="emp-name" style="font-size:${nameSize(p.n)}px">${p.n}</div></div>
      <div class="emp-meta">
        <div class="emp-era">${p.e}</div>
        <div class="emp-reign">${p.r}</div>
        ${p.w?`<div class="emp-note">${p.w}</div>`:''}
      </div>
    </article>`).join('');
}
function dynastyHTML(d,i){
  return `
  <section class="dyn" id="d-${d.id}" data-id="${d.id}" data-di="${i}">
    <div class="dyn-watermark" aria-hidden="true">${d.name}</div>
    <div class="dyn-inner">
      <div class="dyn-head">
        <div>
          <div class="dyn-no f-lat reveal" style="--i:0">No.${String(i+1).padStart(2,'0')} — ${d.latin}</div>
          <h2 class="dyn-name reveal" style="--i:1">${d.name}<em>${d.span}</em></h2>
          <div class="facts">
            <div class="fact reveal" style="--i:2"><span class="fact-k">Span 起讫</span><span class="fact-v f-num">${d.span}</span></div>
            <div class="fact reveal" style="--i:3"><span class="fact-k">Capital 都城</span><span class="fact-v">${d.capital}</span></div>
            <div class="fact reveal" style="--i:4"><span class="fact-k">Founder 开国</span><span class="fact-v">${d.founder}</span></div>
          </div>
          <p class="dyn-sum reveal" style="--i:5">${d.summary}</p>
          <ul class="tags reveal" style="--i:6">${d.tags.map(t=>`<li>${t}</li>`).join('')}</ul>
        </div>
        <div class="dyn-figure">${portraitHTML(d.img, d.name+' · '+d.founder, d.fig)}</div>
      </div>
      <div class="sec-head reveal">
        <h3>编年纪事<i>Chronicle</i></h3>
        <span class="hint">点击节点 · 阅详情</span>
      </div>
      <div class="scroll"><div class="track">
        ${eventsHTML(d.events)}
      </div></div>
      <div class="sec-head reveal">
        <h3>帝系年号<i>Reigns</i></h3>
        <span class="hint">${d.emperors.length} Emperors</span>
      </div>
      <div class="scroll"><div class="emp-track">${emperorsHTML(d.emperors)}</div></div>
    </div>
  </section>`;
}

document.getElementById('dynasties').innerHTML = DYNASTIES.map(dynastyHTML).join('');


document.getElementById('heroGallery').insertAdjacentHTML('beforeend',
  GALLERY.map((g,i)=>`
    <figure class="g-card ${g.c} reveal" style="--i:${i+2}">
      ${portraitHTML(g.f,g.n,g.k)}
      <figcaption class="g-label">${g.n}</figcaption>
    </figure>`).join('')
);


function bindFallback(root){
  root.querySelectorAll('.portrait').forEach(p=>{
    if(p.dataset.bound)return;
    p.dataset.bound='1';
    const img=p.querySelector('img');
    const srcs=JSON.parse(p.dataset.srcs||'[]');
    let i=0;
    const fail=()=>{
      i++;
      if(i<srcs.length){img.src=srcs[i];}
      else p.classList.add('no-img');
    };
    img.addEventListener('error',fail);
    if(img.complete&&img.naturalWidth===0)fail();
  });
}
bindFallback(document);

document.getElementById('topNav').innerHTML =
  DYNASTIES.map(d=>`<a href="#d-${d.id}" data-id="${d.id}">${d.name}</a>`).join('');
document.getElementById('rail').insertAdjacentHTML('beforeend',
  DYNASTIES.map(d=>`<button data-id="${d.id}" title="${d.name} · ${d.span}">${d.name[0]}</button>`).join(''));
document.getElementById('rail').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  document.getElementById('d-'+b.dataset.id).scrollIntoView({behavior:'smooth'});
});

const io=new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(n=>io.observe(n));

const modal=document.getElementById('evModal');
const mKicker=document.getElementById('evModalKicker');
const mYear=document.getElementById('evModalYear');
const mTitle=document.getElementById('evModalTitle');
const mMeta=document.getElementById('evModalMeta');
const mDesc=document.getElementById('evModalDesc');
const mExt=document.getElementById('evModalExt');
const mPos=document.getElementById('evModalPos');
const mPrev=document.getElementById('evPrev');
const mNext=document.getElementById('evNext');
let curD=0,curE=0;

function renderModal(){
  const d=DYNASTIES[curD],e=d.events[curE];
  mKicker.textContent=`${d.latin} · ${d.name} · ${d.span}`;
  mYear.textContent=e.y;
  mTitle.textContent=e.t;
  mMeta.innerHTML=`<span>都城 <b>${d.capital}</b></span><span>开国 <b>${d.founder}</b></span>`;
  mDesc.textContent=e.d+'。';
  mExt.textContent=e.x||e.d+'。';
  mPos.textContent=`${curE+1} / ${d.events.length}`;
  mPrev.disabled=curE===0;
  mNext.disabled=curE===d.events.length-1;
}
function openModal(di,ei){
  curD=di;curE=ei;
  renderModal();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  document.getElementById('evClose').focus();
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function step(dir){
  const list=DYNASTIES[curD].events;
  const n=curE+dir;
  if(n>=0&&n<list.length){curE=n;renderModal();
    const panel=modal.querySelector('.ev-panel');panel.scrollTop=0;}
}
document.getElementById('dynasties').addEventListener('click',e=>{
  const card=e.target.closest('.ev');
  if(!card)return;
  const sec=card.closest('.dyn');
  openModal(+sec.dataset.di,+card.dataset.ev);
});
document.getElementById('dynasties').addEventListener('keydown',e=>{
  const card=e.target.closest('.ev');
  if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();
    const sec=card.closest('.dyn');
    openModal(+sec.dataset.di,+card.dataset.ev);}
});
document.getElementById('evClose').addEventListener('click',closeModal);
mPrev.addEventListener('click',()=>step(-1));
mNext.addEventListener('click',()=>step(1));
modal.addEventListener('click',e=>{ if(e.target===modal)closeModal(); });
addEventListener('keydown',e=>{
  if(!modal.classList.contains('open'))return;
  if(e.key==='Escape')closeModal();
  if(e.key==='ArrowLeft')step(-1);
  if(e.key==='ArrowRight')step(1);
});

document.querySelectorAll('.scroll').forEach(box=>{
  let down=false,x0=0,l0=0,moved=false;
  box.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')return;
    down=true;moved=false;x0=e.clientX;l0=box.scrollLeft;box.classList.add('grabbing');
  });
  box.addEventListener('pointermove',e=>{
    if(!down)return;
    const dx=e.clientX-x0;
    if(Math.abs(dx)>4)moved=true;
    box.scrollLeft=l0-dx;
  });
  const end=()=>{down=false;box.classList.remove('grabbing');};
  box.addEventListener('pointerup',end);
  box.addEventListener('pointerleave',end);
  box.addEventListener('pointercancel',end);
  box.addEventListener('click',e=>{ if(moved){e.preventDefault();e.stopPropagation();} },true);
});

const toTop=document.getElementById('toTop');
const ttRing=document.getElementById('ttRing');
const CIRC=2*Math.PI*23;
ttRing.style.strokeDasharray=CIRC;
ttRing.style.strokeDashoffset=CIRC;
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

function setSBW(){
  document.documentElement.style.setProperty(
    '--sbw',(innerWidth-document.documentElement.clientWidth)+'px');
}
setSBW();

const railBtns=[...document.querySelectorAll('.rail button')];
const navLinks=[...document.querySelectorAll('.top-nav a')];
const railFill=document.getElementById('railFill');
const rail=document.getElementById('rail');
let ticking=false;
function frame(){
  const vh=innerHeight;
  document.querySelectorAll('.dyn-watermark,.dyn-figure').forEach(n=>{
    const r=n.getBoundingClientRect();
    const p=(r.top+r.height/2-vh/2)/vh;
    n.style.setProperty('--py',(p*-24).toFixed(1)+'px');
  });
  let current=null;
  document.querySelectorAll('.dyn').forEach(s=>{
    const r=s.getBoundingClientRect();
    if(r.top<vh*.42&&r.bottom>vh*.32)current=s.dataset.id;
  });
  railBtns.forEach(b=>b.classList.toggle('on',b.dataset.id===current));
  navLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===current));
  const max=document.documentElement.scrollHeight-vh;
  const pct=max>0?Math.min(1,scrollY/max):0;
  railFill.style.height=(rail.offsetHeight*pct)+'px';
  ttRing.style.strokeDashoffset=CIRC*(1-pct);
  toTop.classList.toggle('show',scrollY>vh*.55);
  ticking=false;
}
addEventListener('scroll',()=>{ if(!ticking){ticking=true;requestAnimationFrame(frame);} },{passive:true});
addEventListener('resize',()=>{setSBW();frame();});
frame();

