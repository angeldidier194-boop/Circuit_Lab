const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let uid=0;
const R=(v,b,nm,l)=>({t:'R',v,b:!!b,n:nm,l,open:false,id:uid++}),S=(...c)=>({t:'S',c}),P=(...c)=>({t:'P',c});
const fin=Number.isFinite,fmt=v=>fin(v)?String(+v.toFixed(2)):'∞';
const req=n=>n.t=='R'?(n.open?Infinity:n.v):n.t=='S'?n.c.reduce((a,x)=>a+req(x),0):(g=>g?1/g:Infinity)(n.c.reduce((a,x)=>a+1/req(x),0));
const leaves=n=>n.t=='R'?[n]:n.c.flatMap(leaves);
function pw(n,V,o){
  if(n.t=='R'){o.set(n,n.open?0:V*V/n.v);return}
  if(n.t=='P'){n.c.forEach(x=>pw(x,V,o));return}
  const rt=req(n),I=fin(rt)?V/rt:0;
  n.c.forEach(x=>pw(x,fin(rt)?I*req(x):0,o));
}
const RW=64,RH=40,G=22,PG=12;
function lay(n){
  if(n.t=='R'){n.w=RW;n.h=RH;n.m=RH/2;return}
  n.c.forEach(lay);
  if(n.t=='S'){n.w=n.c.reduce((a,x)=>a+x.w,0)+G*(n.c.length-1);n.m=Math.max(...n.c.map(x=>x.m));n.h=n.m+Math.max(...n.c.map(x=>x.h-x.m))}
  else{n.w=Math.max(...n.c.map(x=>x.w))+2*G;n.h=n.c.reduce((a,x)=>a+x.h,0)+PG*(n.c.length-1);n.m=n.h/2}
}
const ln=(a,b,c,d,on)=>`<path d="M${a} ${b}L${c} ${d}" class="w${on?' on':''}"/>`;
function draw(n,x,y,live,pm){
  live=live&&fin(req(n));const ly=y+n.m;let s='';
  if(n.t=='R'){
    const cx=x+RW/2;s+=ln(x,ly,x+RW,ly,live);
    if(n.b){
      const o=Math.min(1,Math.sqrt((pm.get(n)||0)/10));
      s+=`<g class="leaf" data-id="${n.id}" tabindex="0" role="button" aria-label="Foco de ${n.v} ohms, ${n.open?'quitado':'puesto'}">`+
      `<circle cx="${cx}" cy="${ly}" r="19" fill="var(--card)"/>`+
      `<circle cx="${cx}" cy="${ly}" r="19" fill="var(--glow)" fill-opacity="${o}" style="filter:drop-shadow(0 0 ${(o*9).toFixed(1)}px var(--glow))"/>`+
      `<circle cx="${cx}" cy="${ly}" r="19" fill="none" stroke="var(--ink)" stroke-width="2"${n.open?' stroke-dasharray="3 4"':''}/>`+
      `<text x="${cx}" y="${ly+4}" style="fill:${o>.4?'#14304a':'var(--ink)'}">${n.open?'✕':n.v+'Ω'}</text></g>`;
    }else s+=`<rect x="${x+8}" y="${ly-15}" width="${RW-16}" height="30" rx="6" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><text x="${cx}" y="${ly+4}">${n.l||fmt(n.v)+'Ω'}</text>${n.n?`<text x="${cx}" y="${ly-19}" style="font-size:11px;fill:var(--mute)">${n.n}</text>`:''}`;
    return s;
  }
  if(n.t=='S'){
    let cx=x;
    n.c.forEach((k,i)=>{s+=draw(k,cx,ly-k.m,live,pm);cx+=k.w;if(i<n.c.length-1){s+=ln(cx,ly,cx+G,ly,live);cx+=G}});
    return s;
  }
  let cy=y,fy,ey;const lx=x+G,rx=x+n.w-G;
  s+=ln(x,ly,lx,ly,live)+ln(rx,ly,x+n.w,ly,live);
  n.c.forEach((k,i)=>{
    const ky=cy+k.m,kx=lx+(rx-lx-k.w)/2,kl=live&&fin(req(k));
    if(i==0)fy=ky;ey=ky;
    s+=ln(lx,ky,kx,ky,kl)+ln(kx+k.w,ky,rx,ky,kl)+draw(k,kx,cy,live,pm);cy+=k.h+PG;
  });
  return s+ln(lx,fy,lx,ey,live)+ln(rx,fy,rx,ey,live);
}
function board(n,pm,V){
  lay(n);pm=pm||new Map();
  const X=54,Y=16,lx=20,rx=X+n.w+34,ly=Y+n.m,by=Y+n.h+34,bx=(lx+rx)/2,W=rx+20,H=by+36,on=fin(req(n));
  const w=d=>`<path d="${d}" class="w${on?' on':''}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Circuito con batería">`+
    w(`M${bx-6} ${by}H${lx}V${ly}H${X}`)+w(`M${X+n.w} ${ly}H${rx}V${by}H${bx+6}`)+draw(n,X,Y,true,pm)+
    `<path class="bat" d="M${bx-6} ${by-14}v28M${bx+6} ${by-7}v14"/><text x="${bx}" y="${by+30}">${fmt(V==null?12:V)} V</text></svg>`;
}
/* Pestañas */
function tab(id){
  $$('#tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.p==id));
  $$('.panel').forEach(p=>p.hidden=p.id!=id);
  raStop();$('#raIntro').hidden=false;$('#raGame').hidden=true;
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.p)});
/* Explorar */
const EX={serie:()=>S(R(4,1),R(6,1),R(8,1)),paralelo:()=>P(R(12,1),R(12,1),R(12,1)),mixto:()=>S(R(6,1),P(R(12,1),R(12,1)))};
const TIP={serie:'En serie hay un solo camino: la corriente es la misma en todos y si uno se funde, todos se apagan. Rt = R1 + R2 + R3.',
paralelo:'En paralelo cada foco tiene su propio camino y el mismo voltaje: si uno se funde, los demás siguen. 1/Rt = 1/R1 + 1/R2 + 1/R3.',
mixto:'En el mixto se resuelve por partes: primero el paralelo (su resistencia equivalente) y luego se suma en serie.'};
let exK='serie',exC=EX.serie();
function exDraw(){
  const pm=new Map();pw(exC,12,pm);$('#exBoard').innerHTML=board(exC,pm);
  const ls=leaves(exC),lit=ls.filter(b=>pm.get(b)>.001).length,op=ls.filter(b=>b.open).length,rt=req(exC);
  $('#exRead').textContent=`Resistencia total: ${fmt(rt)} Ω · Corriente: ${fin(rt)?fmt(12/rt):0} A`;
  $('#exMsg').textContent=op==0?'Toca un foco para quitarlo y mira qué pasa.':lit==0?'Circuito abierto: no pasa corriente y se apagan todos.':lit==ls.length-op?`Encendidos: ${lit} de ${ls.length}. Los demás siguen prendidos.`:`Encendidos: ${lit} de ${ls.length}. Se apagaron también otros.`;
  $('#exTip').textContent=TIP[exK];
}
function tog(e){
  if(e.type=='keydown'&&e.key!='Enter'&&e.key!=' ')return;
  const g=e.target.closest('[data-id]');if(!g)return;e.preventDefault();
  const b=leaves(exC).find(l=>l.id==g.dataset.id);b.open=!b.open;exDraw();
}
$('#exBoard').addEventListener('click',tog);$('#exBoard').addEventListener('keydown',tog);
$('#exSeg').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;exK=b.dataset.k;exC=EX[exK]();
  $$('#exSeg button').forEach(x=>x.setAttribute('aria-pressed',x==b));exDraw();
});
$('#exReset').onclick=()=>{exC=EX[exK]();exDraw()};
/* Reto: R1, R2, R3 y la resistencia objetivo */
const LV=[[6,6,6,9],[4,12,6,2],[10,15,30,36],[8,8,16,8],[3,6,6,1.5],[20,30,60,72],[30,30,15,12],[9,18,6,3]];
let lv=0,t1='S',t2='S',mv=0,tot=0,done=false,stars=0;
function reTree(){const[a,b,c]=LV[lv],k=t1=='S'?S(R(a),R(b)):P(R(a),R(b));return t2=='S'?S(k,R(c)):P(k,R(c))}
function reDraw(){
  const[a,b,c,T]=LV[lv],tr=reTree(),rt=req(tr);
  $('#reLv').textContent=`Nivel ${lv+1} de ${LV.length}`;$('#reStars').textContent=`★ ${tot}`;
  $('#reGoal').textContent=`Consigue ${T} Ω`;$('#reBoard').innerHTML=board(tr);
  $('#reL1').textContent=`Las resistencias de ${a} Ω y ${b} Ω van en…`;
  $('#reL2').textContent=`Ese bloque y la de ${c} Ω van en…`;
  $$('#re .seg').forEach(sg=>{const cur=sg.dataset.t=='1'?t1:t2;
  [...sg.children].forEach(x=>{x.setAttribute('aria-pressed',x.dataset.v==cur);x.disabled=done})});
  $('#reRead').textContent=`Ahora tienes: ${fmt(rt)} Ω`;
  const m=$('#reMsg');m.className='msg';
  if(done){
    const p1=t1=='S'?`${a}+${b} = ${fmt(a+b)} Ω`:`${a} y ${b} en paralelo = ${fmt(a*b/(a+b))} Ω`;
    m.textContent=`¡Lo lograste! ${'★'.repeat(stars)} ${p1}, y ese bloque ${t2=='S'?'en serie':'en paralelo'} con ${c} Ω da ${fmt(rt)} Ω.`;m.classList.add('ok');
  }else m.textContent=mv==0?'Cambia entre serie y paralelo hasta llegar a la meta.':rt>T?'Te pasas: el paralelo baja la resistencia total.':'Te falta: el serie suma resistencias.';
  $('#reNext').hidden=!done;$('#reNext').textContent=lv<LV.length-1?'Siguiente nivel':`Terminaste con ${tot} de ${LV.length*3} estrellas. Jugar de nuevo`;
}
$('#re').addEventListener('click',e=>{
  const b=e.target.closest('.seg button');if(!b||done)return;
  if(b.parentElement.dataset.t=='1')t1=b.dataset.v;else t2=b.dataset.v;
  mv++;
  if(Math.abs(req(reTree())-LV[lv][3])<.01){done=true;stars=mv<=2?3:mv<=4?2:1;tot+=stars}
  reDraw();
});
$('#reNext').onclick=()=>{if(lv<LV.length-1)lv++;else{lv=0;tot=0}t1=t2='S';mv=0;done=false;reDraw()};
/* Rápido: cada 4 aciertos sube el nivel */
const rv=()=>[2,3,4,5,6,8,10,12][Math.random()*8|0],L=()=>R(rv());
const QS={
serie:[[0,()=>S(L(),L())],[1,()=>S(L(),L(),L())],[2,()=>S(L(),L(),L(),L())]],
paralelo:[[0,()=>P(L(),L())],[1,()=>P(L(),L(),L())],[3,()=>P(L(),L(),L(),L())]],
mixto:[[0,()=>S(L(),P(L(),L()))],[0,()=>P(L(),S(L(),L()))],[1,()=>S(P(L(),L()),L())],[1,()=>P(S(L(),L()),S(L(),L()))],[2,()=>S(P(L(),L()),P(L(),L()))],[2,()=>S(L(),P(L(),S(L(),L())))],[3,()=>P(S(L(),P(L(),L())),L())],[3,()=>S(P(L(),L()),L(),P(L(),L()))]]};
const EXP={serie:'Un solo camino: todo va uno tras otro.',paralelo:'Todos comparten los mismos dos nodos: hay varios caminos.',mixto:'Mezcla un tramo en serie con otro en paralelo.'};
const TLS=[12,10,8,7];
let ra={score:0,streak:0,lives:3,ok:0,kind:'',ans:'',calc:false,t:0,tl:12,iv:0,to:0,lock:false},best=0;
try{best=+localStorage.getItem('cl_best')||0}catch(e){}
const lvl=()=>Math.min(3,ra.ok/4|0);
function raStop(){clearInterval(ra.iv);clearTimeout(ra.to)}
function hud(){
  $('#raScore').textContent=ra.score;$('#raStreak').textContent=ra.streak;$('#raLvl').textContent=lvl()+1;
  $('#raLives').textContent='♥'.repeat(ra.lives)+'♡'.repeat(3-ra.lives);$('#raLives').setAttribute('aria-label',ra.lives+' vidas');
}
function raNext(){
  ra.lock=false;const m=$('#raMsg');m.textContent='';m.className='msg';$('#raBoard').className='board';
  const lv=lvl();ra.kind=['serie','paralelo','mixto'][Math.random()*3|0];
  const pool=QS[ra.kind].filter(q=>q[0]<=lv);ra.calc=lv>0&&Math.random()<(lv==1?.3:.45);
  let tr,rt;
  for(let i=0;i<40;i++){tr=pool[Math.random()*pool.length|0][1]();rt=req(tr);if(!ra.calc||Math.abs(rt*10-Math.round(rt*10))<1e-9)break}
  let h;
  if(ra.calc){
    const ls=leaves(tr).map(x=>x.v),sum=ls.reduce((a,b)=>a+b,0),par=1/ls.reduce((a,b)=>a+1/b,0),c=new Set([fmt(rt)]);
    [sum,par,rt*2,rt/2,rt+1,rt+2,rt*1.5].forEach(v=>{if(c.size<4)c.add(fmt(v))});
    ra.ans=fmt(rt);h=[...c].sort(()=>Math.random()-.5).map(o=>`<button data-a="${o}">${o} Ω</button>`).join('');
  }else{ra.ans=ra.kind;h=['serie','paralelo','mixto'].map(k=>`<button data-a="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}
  $('#raQ').textContent=ra.calc?'¿Cuál es la resistencia total?':'¿Qué tipo de circuito es?';
  $('#raAns').className='seg'+(ra.calc?' q4':'');$('#raAns').innerHTML=h;
  $('#raBoard').innerHTML=board(tr);ra.tl=TLS[lv];ra.t=ra.tl;$('#raBar').style.width='100%';hud();
  clearInterval(ra.iv);ra.iv=setInterval(()=>{ra.t-=.1;$('#raBar').style.width=Math.max(0,ra.t/ra.tl*100)+'%';if(ra.t<=0)raAns(null)},100);
}
function raAns(a){
  if(ra.lock)return;ra.lock=true;clearInterval(ra.iv);
  const ok=a===ra.ans,m=$('#raMsg'),l0=lvl();
  const why=ra.calc?`Rt = ${ra.ans} Ω. Resuelve primero los paralelos y luego suma los series.`:EXP[ra.kind];
  if(ok){
    ra.score+=10+l0*5+Math.min(ra.streak,5)*2;ra.streak++;ra.ok++;m.textContent='¡Correcto! '+why;m.className='msg ok';
    if(lvl()>l0){m.textContent+=` ¡Subes al nivel ${lvl()+1}! Menos tiempo y circuitos más difíciles.`;if(ra.lives<3)ra.lives++}
  }else{
    ra.streak=0;ra.lives--;m.textContent=`${a?'Incorrecto.':'Se acabó el tiempo.'} ${ra.calc?why:'Era '+ra.kind+'. '+why}`;m.className='msg bad';
  }
  $('#raBoard').classList.add(ok?'ok':'bad');hud();
  ra.to=setTimeout(()=>{
    if(ra.lives>0)return raNext();
    if(ra.score>best){best=ra.score;try{localStorage.setItem('cl_best',best)}catch(e){}}
    $('#raGame').hidden=true;$('#raIntro').hidden=false;
    $('#raInfo').textContent=`Fin del juego. Llegaste al nivel ${lvl()+1} con ${ra.ok} aciertos y ${ra.score} puntos. Mejor marca: ${best}.`;$('#raGo').textContent='Jugar otra vez';
  },1800+(m.textContent.length>90?900:0));
}
$('#raGo').onclick=()=>{ra.score=0;ra.streak=0;ra.lives=3;ra.ok=0;$('#raIntro').hidden=true;$('#raGame').hidden=false;raNext()};
$('#raAns').addEventListener('click',e=>{const b=e.target.closest('button');if(b)raAns(b.dataset.a)});
/* Thévenin y Norton */
function thSvg(k,d){
  const f=fmt,eq=k=='eq',sc=k=='sc',tr=d.trap&&k!='eq'&&k!='neq',L=(k=='orig'||k=='eth'||sc)?'w on':'w cu',T=sc?'w on':'w cu',
  p=(c,x)=>`<path d="${x}" class="${c}"/>`,
  nm=(x,y,t,a)=>`<text x="${x}" y="${y}" style="font-size:11px;fill:var(--mute)${a?';text-anchor:end':''}">${t}</text>`,
  dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="var(--ink)"/>`,
  box=(x,y,w,h,t,hi,fs)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--card)" stroke="${hi?'var(--acc)':'var(--ink)'}" stroke-width="${hi?3:2}"/><text x="${x+w/2}" y="${y+h/2+4}"${fs?' style="font-size:12px"':''}>${t}</text>`,
  tf=sc?'var(--ink)':'var(--card)',
  tm=`<circle cx="310" cy="40" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><circle cx="310" cy="160" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><text x="326" y="45" style="font-size:16px">a</text><text x="326" y="165" style="font-size:16px">b</text></svg>`;
  let s='<svg viewBox="0 0 350 200" role="img" aria-label="Circuito con salidas a y b">';
  if(k=='neq')return s+p('w cu','M110 40H310M110 160H310M110 40V78M110 122V160M200 40V72M200 128V160')+dot(200,40)+dot(200,160)+`<circle cx="110" cy="100" r="22" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><path class="bat" style="stroke-width:3" d="M110 112V88M103 95L110 88L117 95"/><text x="84" y="105" style="text-anchor:end">${f(d.In)} A</text>`+nm(150,104,'In')+box(182,72,36,56,f(d.Rth)+'Ω',0,1)+nm(232,104,'Rn')+tm;
  if(eq)s+=p(L,'M60 40H110M170 40H310M60 160H310');
  else if(tr)s+=p(L,'M60 40H150M150 40V72M150 128V160M60 160H150')+p(T,'M150 40H190M250 40H310M150 160H310')+dot(150,40)+dot(150,160);
  else s+=p(L,'M60 40H110M170 40H250M60 160H250')+p(sc?'w cu':L,'M250 40V72M250 128V160')+p(T,'M250 40H310M250 160H310')+dot(250,40)+dot(250,160);
  if(sc)s+=p('w on','M310 40V160');
  s+=k=='rth'?p(L,'M60 40V160')+nm(46,104,'cable',1):p(L,'M60 40V90M60 102V160')+'<path class="bat" d="M46 90H74M52 102H68"/>'+`<text x="40" y="100" style="text-anchor:end">${f(eq?d.Vth:d.V)} V</text>`;
  if(eq)s+=box(110,26,60,28,f(d.Rth)+'Ω')+nm(140,21,'Rth');
  else if(tr)s+=box(190,26,60,28,f(d.R1)+'Ω')+nm(220,21,'R1')+box(132,72,36,56,f(d.R2)+'Ω',k=='eth',1)+nm(114,104,'R2');
  else s+=box(110,26,60,28,f(d.R1)+'Ω')+nm(140,21,'R1')+box(232,72,36,56,f(d.R2)+'Ω',k=='eth',1)+nm(212,104,'R2');
  return s+tm;
}
const PT=[{V:[12,24],R:[2,3,4,6,12]},{V:[12,18,24,30],R:[2,3,4,5,6,8,10,12,15,20]},{V:[10,12,15,18,20,24,30,36],R:[1,2,3,4,5,6,8,10,12,15,20,30]}];
const nt=(x,k)=>Math.abs(x*k-Math.round(x*k))<1e-9,pick=a=>a[Math.random()*a.length|0];
const mk=(V,R1,R2,t)=>({V,R1,R2,trap:t?1:0,Vth:t?V:V*R2/(R1+R2),Rth:t?R1:R1*R2/(R1+R2),In:V/R1});
function bSvg(k,d){
  const f=fmt,off=k=='off',sc=k=='sc',L=off?'w cu':'w on',
  p=(c,x)=>`<path d="${x}" class="${c}"/>`,
  nm=(x,y,t,a)=>`<text x="${x}" y="${y}" style="font-size:11px;fill:var(--mute)${a?';text-anchor:end':''}">${t}</text>`,
  dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="var(--ink)"/>`,
  box=(x,y,w,h,t,fs)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><text x="${x+w/2}" y="${y+h/2+4}"${fs?' style="font-size:12px"':''}>${t}</text>`,
  tf=sc?'var(--ink)':'var(--card)';
  let s='<svg viewBox="0 0 350 200" role="img" aria-label="Circuito con salidas a y b">';
  s+=p(L,'M60 40H80M140 40H170M170 40V72M170 128V160M60 160H170')+p(sc?'w on':'w cu','M170 40H200M260 40H310M170 160H310')+dot(170,40)+dot(170,160);
  s+=off?p(L,'M60 40V160')+nm(46,104,'cable',1):p(L,'M60 40V90M60 102V160')+'<path class="bat" d="M46 90H74M52 102H68"/>'+`<text x="40" y="100" style="text-anchor:end">${f(d.V)} V</text>`;
  s+=box(80,26,60,28,f(d.R1)+'Ω')+nm(110,21,'R1')+box(152,72,36,56,f(d.R2)+'Ω',1)+nm(134,104,'R2')+box(200,26,60,28,f(d.R3)+'Ω')+nm(230,21,'R3');
  if(sc)s+=p('w on','M310 40V160');
  return s+`<circle cx="310" cy="40" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><circle cx="310" cy="160" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><text x="326" y="45" style="font-size:16px">a</text><text x="326" y="165" style="font-size:16px">b</text></svg>`;
}
function nSvg(k,d){
  if(k=='neq')return thSvg('neq',d);
  if(d.v=='B')return bSvg(k,d);
  const f=fmt,off=k=='off',sc=k=='sc',L=off?'w cu':'w on',
  p=(c,x)=>`<path d="${x}" class="${c}"/>`,
  nm=(x,y,t,a)=>`<text x="${x}" y="${y}" style="font-size:11px;fill:var(--mute)${a?';text-anchor:end':''}">${t}</text>`,
  dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="var(--ink)"/>`,
  box=(x,y,w,h,t,fs)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><text x="${x+w/2}" y="${y+h/2+4}"${fs?' style="font-size:12px"':''}>${t}</text>`,
  tf=sc?'var(--ink)':'var(--card)';
  let s='<svg viewBox="0 0 350 200" role="img" aria-label="Circuito con fuente de corriente y salidas a y b">';
  s+=d.trap?p(L,'M70 40H100M160 40H190')+box(100,26,60,28,f(d.R3)+'Ω')+nm(130,21,'R3'):p(L,'M70 40H190');
  s+=p(L,'M70 160H190M190 40V72M190 128V160')+dot(190,40)+dot(190,160)+box(172,72,36,56,f(d.R1)+'Ω',1)+nm(154,104,'R1');
  s+=off?p('w cu','M70 40V92M70 108V160')+dot(70,92)+dot(70,108)+nm(56,104,'abierto',1):p(L,'M70 40V78M70 122V160')+`<circle cx="70" cy="100" r="22" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><path class="bat" style="stroke-width:3" d="M70 112V88M63 95L70 88L77 95"/><text x="44" y="105" style="text-anchor:end">${f(d.Is)} A</text>`;
  s+=p(sc?'w on':'w cu','M190 40H210M270 40H310M190 160H310')+box(210,26,60,28,f(d.R2)+'Ω')+nm(240,21,'R2');
  if(sc)s+=p('w on','M310 40V160');
  return s+`<circle cx="310" cy="40" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><circle cx="310" cy="160" r="5" fill="${tf}" stroke="var(--ink)" stroke-width="2"/><text x="326" y="45" style="font-size:16px">a</text><text x="326" y="165" style="font-size:16px">b</text></svg>`;
}
const TH={svg:thSvg,pt:PT,mk,first:[5,10,10],
data:p=>`E = ${p.V} V, R1 = ${p.R1} Ω y R2 = ${p.R2} Ω. `+(p.trap?'R1 va en el cable de la salida a.':'Las salidas a y b están en R2.'),
rn:'Rth',k2:'Vth',u2:'V',neat:p=>nt(p.Vth,10)&&nt(p.Rth,10),kinds:['rth','eth','eq'],
cap:['I. Rth: se apaga la fuente (se cambia por un cable) y se mira desde a y b.','II. Vth: la fuente sigue encendida y las salidas a y b quedan abiertas. Vth es el voltaje entre a y b.',p=>`III. Circuito equivalente de Thévenin visto desde a y b: Vth = ${fmt(p.Vth)} V en serie con Rth = ${fmt(p.Rth)} Ω.`],
q:['¿Cuánto vale Rth vista desde a y b?','¿Cuánto vale Vth (el voltaje entre a y b)?'],
dis0:p=>p.trap?[p.R1+p.R2,p.R1*p.R2/(p.R1+p.R2),p.R2]:[p.R1+p.R2,p.R1,p.R2],
why0:p=>p.trap?`Rth = R1 = ${p.R1} Ω. Al apagar la fuente, el cable deja a R2 en corto y solo cuenta R1.`:`Rth = R1·R2/(R1+R2) = ${p.R1}·${p.R2}/(${p.R1}+${p.R2}) = ${fmt(p.Rth)} Ω${p.R1==p.R2?` (iguales: R/n = ${p.R1}/2)`:''}`,
dis:p=>p.trap?[p.V*p.R2/(p.R1+p.R2),p.V/2,p.V*p.R1/(p.R1+p.R2)]:[p.V,p.V*p.R1/(p.R1+p.R2),p.V/2],
why:p=>p.trap?`Vth = E = ${p.V} V. Por R1 no pasa corriente (a y b están abiertas), así que ahí no cae voltaje: todo el voltaje cae en R2 y R1 no cuenta.`:`Vth = E·R2/(R1+R2) = ${p.V}·${p.R2}/(${p.R1}+${p.R2}) = ${fmt(p.Vth)} V`,
sum:p=>`Resultados: Rth = ${fmt(p.Rth)} Ω · Vth = ${fmt(p.Vth)} V`};
const mkB=(I,R1,R2,R3)=>{const E=pick([12,18,24,30,36]),Rq=R1+R2*R3/(R2+R3);return{v:'B',V:E,R1,R2,R3,trap:0,Rth:R3+R1*R2/(R1+R2),In:E/Rq*R2/(R2+R3)}};
const mkN=(I,R1,R2,t,R3)=>Math.random()<.5&&R3?mkB(I,R1,R2,R3):{v:'A',Is:I,R1,R2,trap:t?1:0,R3:t?pick([2,3,4,6,8,10,12]):0,Rth:R1+R2,In:I*R1/(R1+R2)};
const NO={svg:nSvg,mk:mkN,first:[6,10,5],
pt:[{V:[2,3,4,6],R:[2,3,4,6,8,10,12]},{V:[2,3,4,5,6,8,10],R:[2,3,4,5,6,8,10,12,15,20]},{V:[1,2,3,4,5,6,8,10,12],R:[1,2,3,4,5,6,8,10,12,15,20,30]}],
data:p=>p.v=='B'?`E = ${p.V} V, R1 = ${p.R1} Ω, R2 = ${p.R2} Ω y R3 = ${p.R3} Ω. R1 va en serie con la fuente, R2 va en paralelo y R3 va en la salida a.`:`Is = ${p.Is} A, R1 = ${p.R1} Ω y R2 = ${p.R2} Ω. `+(p.trap?'R3 va en serie con la fuente de corriente.':'R1 está en paralelo con la fuente y R2 va en la salida a.'),
rn:'Rn',k2:'In',u2:'A',neat:p=>nt(p.In,100)&&nt(p.Rth,10),kinds:['off','sc','neq'],
cap:[p=>p.v=='B'?'I. Rn: se apaga la fuente de voltaje (se cambia por un cable) y se mira desde a y b.':'I. Rn: se apaga la fuente de corriente (se cambia por un circuito abierto) y se mira desde a y b.',
p=>p.v=='B'?'II. In: la fuente sigue encendida y se pone un cable (cortocircuito) entre a y b. Ahora R2 y R3 quedan en paralelo y la corriente se reparte entre las dos.':'II. In: la fuente sigue encendida y se pone un cable (cortocircuito) entre a y b. In es la corriente que pasa por ese cable.',
p=>`III. Circuito equivalente de Norton visto desde a y b: fuente de corriente In = ${fmt(p.In)} A en paralelo con Rn = ${fmt(p.Rth)} Ω.`],
q:['¿Cuánto vale Rn vista desde a y b?','¿Cuánto vale In (la corriente por el cable entre a y b)?'],
dis0:p=>p.v=='B'?[p.R1+p.R2+p.R3,p.R1*p.R2/(p.R1+p.R2),p.R1+p.R2*p.R3/(p.R2+p.R3)]:[p.R1*p.R2/(p.R1+p.R2),p.R1,p.R2],
why0:p=>p.v=='B'?`Rn = R3 + R1·R2/(R1+R2) = ${p.R3} + ${p.R1}·${p.R2}/(${p.R1}+${p.R2}) = ${fmt(p.Rth)} Ω. Con la fuente apagada, R1 y R2 quedan en paralelo y ese bloque queda en serie con R3. Aquí no se desprecia ninguna.`:`Rn = R1 + R2 = ${p.R1} + ${p.R2} = ${p.Rth} Ω. Al apagar la fuente de corriente queda un circuito abierto y R1 y R2 quedan en serie.`+(p.trap?' R3 no cuenta: su rama queda abierta.':''),
dis:p=>p.v=='B'?[p.V/p.R1,p.V/(p.R1+p.R2+p.R3),p.V/(p.R1+p.R2*p.R3/(p.R2+p.R3))]:[p.Is*p.R2/(p.R1+p.R2),p.Is,p.Is/2],
why:p=>{
  if(p.v=='B'){const Rq=p.R1+p.R2*p.R3/(p.R2+p.R3);return `Con el cable entre a y b, R2 y R3 quedan en paralelo: Req = R1 + R2·R3/(R2+R3) = ${fmt(Rq)} Ω. Corriente total = E/Req = ${fmt(p.V/Rq)} A. Con el divisor de corriente, In = ${fmt(p.V/Rq)}·${p.R2}/(${p.R2}+${p.R3}) = ${fmt(p.In)} A. Aquí no se desprecia ninguna resistencia.`}
  return `In = Is·R1/(R1+R2) = ${p.Is}·${p.R1}/(${p.R1}+${p.R2}) = ${fmt(p.In)} A (regla divisora de corriente).`+(p.trap?' R3 no cuenta: una resistencia en serie con una fuente de corriente no cambia la corriente que manda la fuente.':'');
},
sum:p=>`Resultados: Rn = ${fmt(p.Rth)} Ω · In = ${fmt(p.In)} A`};
function quiz(id,c){
  const g=x=>$('#'+id+x),pr={sc:0,so:0,ok:0,st:0,step:0,p:null,ans:'',lock:false,used:false},
  tier=()=>Math.min(3,pr.ok/3|0),hud=()=>{g('Solved').textContent=pr.so;g('Score').textContent=pr.sc;g('Lvl').textContent=tier()+1};
  function nu(){
    let p;const ti=tier(),t=c.pt[Math.min(2,ti)];
    if(!pr.used){pr.used=true;p=c.mk(...c.first)}
    else{const tp=ti>0&&Math.random()<[0,.3,.4,.5][ti];for(let i=0;i<300;i++){p=c.mk(pick(t.V),pick(t.R),pick(t.R),tp,pick(t.R));if(c.neat(p))break}}
    pr.p=p;pr.step=0;g('Orig').innerHTML=c.svg('orig',p);g('Data').textContent=c.data(p);g('Sum').hidden=true;show();
  }
  function show(){
    const p=pr.p,s=pr.step,m=g('Msg');pr.lock=false;
    g('Board').innerHTML=c.svg(c.kinds[s],p);{const cp=c.cap[s];g('Step').textContent=typeof cp=='function'?cp(p):cp}m.textContent='';m.className='msg';
    if(s==2){pr.so++;hud();g('Q').textContent='';g('Ans').innerHTML='';g('Sum').textContent=c.sum(p);g('Sum').hidden=false;m.textContent='¡Problema terminado!';g('Next').textContent='Otro problema';g('Next').hidden=false;return}
    g('Q').textContent=c.q[s];
    const v=s?p[c.k2]:p.Rth,u=s?c.u2:'Ω',set=new Set([fmt(v)]),x=s?c.dis(p):c.dis0(p);
    [...x,v*2,v/2,v+1,v+2,v*1.5].forEach(y=>{if(set.size<4&&y>0)set.add(fmt(y))});
    pr.ans=fmt(v);g('Ans').innerHTML=[...set].sort(()=>Math.random()-.5).map(o=>`<button data-a="${o}">${o} ${u}</button>`).join('');
    g('Next').hidden=true;hud();
  }
  function ans(a){
    if(pr.lock)return;pr.lock=true;
    const p=pr.p,s=pr.step,ok=a===pr.ans,m=g('Msg'),t0=tier(),why=s?c.why(p):c.why0(p);
    if(ok){pr.sc+=10+t0*5+Math.min(pr.st,5)*2;pr.st++;pr.ok++;m.className='msg ok';m.textContent='¡Correcto! '+why;if(tier()>t0)m.textContent+=` ¡Subes al nivel ${tier()+1}! Los problemas se ponen más difíciles y con trampa.`}
    else{pr.st=0;m.className='msg bad';m.textContent='Incorrecto. '+why}
    hud();g('Next').textContent=s<1?'Continuar':'Ver circuito equivalente';g('Next').hidden=false;
  }
  g('Ans').addEventListener('click',e=>{const b=e.target.closest('button');if(b)ans(b.dataset.a)});
  g('Next').onclick=()=>{if(pr.step<2){pr.step++;show()}else nu()};
  nu();
}
exDraw();reDraw();quiz('p',TH);quiz('n',NO);