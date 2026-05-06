// ── STARFIRE DEFENSE ── 星际防线 ──
const C=document.getElementById('g'),ctx=C.getContext('2d');
let W,H,SC;
let gs='title',score=0,lives=3,stage=1,ultG=0,ultR=0;
let pl,bls=[],ems=[],boss=null,pups=[],wings=[],parts=[],stars=[],txts=[];
let keys={},frm=0,bgOff=0;
let csData,csChar=0,csDone=false,csTimer=0;
let wvData,wvIdx=0,spQ=[],spT=0,wvClr=false,wvSp=0,wvDead=0,stTimer=0;
let animId=null;

function resize(){
  const w=gameWrap.clientWidth,hh=gameWrap.clientHeight;
  W=Math.min(w,420);H=Math.min(hh,800);
  if(W/H<0.5)W=H*0.5;
  if(H/W>2.2)H=W*2.2;
  C.width=W;C.height=H;
  SC=W/320;
}

// ── AUDIO ──
let actx;
function aI(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();}
function pT(f,d,t='square',v=0.08,s=0){
  try{aI();const o=actx.createOscillator(),g=actx.createGain();
  o.type=t;o.frequency.setValueAtTime(f,actx.currentTime);
  if(s)o.frequency.linearRampToValueAtTime(f+s,actx.currentTime+d);
  g.gain.setValueAtTime(v,actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+d);
  o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+d);}catch(e){}
}
const snd={shoot:()=>pT(880,0.06,'square',0.04,200),
  hit:()=>pT(220,0.1,'sawtooth',0.06,-100),
  exp:()=>{pT(80,0.3,'sawtooth',0.1,-60);setTimeout(()=>pT(50,0.4,'sawtooth',0.06),100);},
  pup:()=>{pT(660,0.1,'sine',0.06);setTimeout(()=>pT(880,0.1,'sine',0.06),100);setTimeout(()=>pT(1100,0.15,'sine',0.06),200);},
  ult:()=>{pT(200,0.5,'sawtooth',0.12,400);setTimeout(()=>pT(600,0.3,'sawtooth',0.1,300),100);setTimeout(()=>pT(1000,0.5,'sine',0.15),200);},
  bh:()=>pT(120,0.15,'sawtooth',0.1,-30),
  clr:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>pT(f,0.15,'sine',0.06),i*100));},
  lose:()=>{pT(300,0.2,'sawtooth',0.08);setTimeout(()=>pT(200,0.3,'sawtooth',0.08),200);setTimeout(()=>pT(100,0.5,'sawtooth',0.06),400);}};

// ── STARS ──
function iStars(){stars=[];for(let i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+0.5,b:Math.random()*0.5+0.3});}

// ── STAGE DATA ──
const STG=[
  {n:'ORBIT DEFENSE',b:'SENTINEL',bp:'2147年，Xenon帝国舰队突破木星轨道。\nJAX-20编队紧急升空！\n目标：摧毁前哨无人机群。\n\n"保持队形，菜鸟。"',bl:20},
  {n:'MOON SHADOW',b:'MOON SPIDER',bp:'月球基地失联。\n抵达后发现已被改造成敌军工厂。\n到处都是自动炮塔。\n\n"我们要把月亮夺回来。"',bl:30},
  {n:'ASTEROID STORM',b:'NEST QUEEN',bp:'追击残敌进入小行星带。\n这里潜伏着生物机械寄生体。\n通讯中断，孤立无援。\n\n"只能靠自己了。"',bl:40},
  {n:'STARGATE BATTLE',b:'GATE GUARDIAN',bp:'敌舰试图激活超空间星门。\n必须在星门充能完毕前摧毁它！\n能量护盾覆盖了整个区域。\n\n"这是最后的屏障！"',bl:50},
  {n:'HEART OF DARKNESS',b:'OVERMIND CORE',bp:'穿越星门抵达Xenon母星。\n主宰核心就在前方。\n这是最后的决战。\n\n"为了地球——出击！"',bl:60},
];

// ── PLAYER ──
function mkPl(){return{x:W/2,y:H*0.82,w:24,h:28,sp:W*0.005,ft:0,fr:6,pw:0,wl:0,sh:0,inv:0,al:true};}

// ── WAVE DEFS ──
const WV=[
  {w:[[{t:'dr',n:6,d:30},{t:'dr',n:8,d:20},{t:'dr',n:10,d:15}],[{t:'dr',n:5,d:40},{t:'gn',n:2,d:60},{t:'dr',n:6,d:25}],[{t:'dr',n:8,d:20},{t:'gn',n:4,d:40}]]},
  {w:[[{t:'dr',n:8,d:25},{t:'gn',n:3,d:50},{t:'rn',n:2,d:40}],[{t:'gn',n:4,d:45},{t:'rn',n:3,d:35},{t:'dr',n:10,d:20}],[{t:'gn',n:5,d:40},{t:'rn',n:4,d:30}]]},
  {w:[[{t:'rn',n:4,d:35},{t:'gn',n:4,d:40},{t:'sw',n:6,d:20}],[{t:'sw',n:8,d:15},{t:'rn',n:5,d:30},{t:'gn',n:5,d:35}],[{t:'sw',n:10,d:12},{t:'rn',n:6,d:25}]]},
  {w:[[{t:'gn',n:6,d:35},{t:'sw',n:8,d:18},{t:'rn',n:5,d:30},{t:'tk',n:2,d:60}],[{t:'sw',n:10,d:14},{t:'tk',n:3,d:50},{t:'gn',n:6,d:30}],[{t:'tk',n:4,d:45},{t:'sw',n:12,d:12}]]},
  {w:[[{t:'tk',n:3,d:50},{t:'sw',n:10,d:15},{t:'gn',n:6,d:30}],[{t:'tk',n:4,d:45},{t:'sw',n:12,d:12},{t:'rn',n:6,d:25}],[{t:'tk',n:5,d:40},{t:'sw',n:14,d:10}]]},
];

function iWv(){
  const wd=WV[stage-1]||WV[0];wvData=wd.w;wvIdx=0;spQ=[];spT=0;wvSp=0;wvDead=0;wvClr=false;ldWv();
}
function ldWv(){
  if(wvIdx>=wvData.length){wvClr=true;return;}
  const w=wvData[wvIdx];spQ=[];
  w.forEach(g=>{for(let i=0;i<g.n;i++)spQ.push({t:g.t,d:g.d*i});});
  spT=0;wvSp=0;
}
function spEm(t){
  const e={x:Math.random()*(W-40)+20,y:-30,w:20,h:20,hp:1,mh:1,sp:1+stage*0.2,
    t:t,vx:0,ft:Math.random()*120,al:true,hf:0};
  switch(t){
    case'dr':e.hp=1;e.sp=1+stage*0.15;e.w=16;e.h=16;e.c='#80c0ff';break;
    case'gn':e.hp=2+Math.floor(stage/2);e.mh=e.hp;e.sp=0.6+stage*0.1;e.w=22;e.h=22;e.c='#ff6b6b';e.cf=true;break;
    case'rn':e.hp=1+Math.floor(stage/3);e.mh=e.hp;e.sp=2+stage*0.2;e.w=14;e.h=14;e.c='#60f0a0';e.fa=true;break;
    case'sw':e.hp=1;e.sp=0.8+stage*0.1;e.w=12;e.h=12;e.c='#f0c060';e.bo=true;e.vx=(Math.random()-0.5)*2;break;
    case'tk':e.hp=5+stage*2;e.mh=e.hp;e.sp=0.3+stage*0.05;e.w=28;e.h=28;e.c='#a080ff';e.cf=true;e.to=true;break;
  }
  ems.push(e);
}
function spBoss(s){
  const st=STG[s-1];
  boss={x:W/2,y:-60,w:48,h:48,hp:st.bl,mh:st.bl,al:true,ph:0,at:0,ap:0,
    vx:0,vy:0,hf:0,en:true,c:'#ff4080',n:st.b};
}

// ── BULLETS ──
function eBullet(x,y,vx,vy){bls.push({x,y,w:6,h:6,vx,vy,al:true,en:true,c:'#ff4080'});}
function pFire(){
  if(!pl||!pl.al)return;
  const px=pl.x,py=pl.y-12*SC,p=pl.pw;
  bls.push({x:px,y:py,w:4,h:8,vx:0,vy:-8*SC,al:true,en:false,c:'#80c0ff'});
  if(p>=1){bls.push({x:px-6*SC,y:py,w:3,h:6,vx:0,vy:-7*SC,al:true,en:false,c:'#60f0a0'});
    bls.push({x:px+6*SC,y:py,w:3,h:6,vx:0,vy:-7*SC,al:true,en:false,c:'#60f0a0'});}
  if(p>=2){bls.push({x:px-12*SC,y:py+4*SC,w:3,h:5,vx:-0.5*SC,vy:-6*SC,al:true,en:false,c:'#f0c060'});
    bls.push({x:px+12*SC,y:py+4*SC,w:3,h:5,vx:0.5*SC,vy:-6*SC,al:true,en:false,c:'#f0c060'});}
  if(p>=3){bls.push({x:px-18*SC,y:py+8*SC,w:4,h:4,vx:-1*SC,vy:-5*SC,al:true,en:false,c:'#ff80c0'});
    bls.push({x:px+18*SC,y:py+8*SC,w:4,h:4,vx:1*SC,vy:-5*SC,al:true,en:false,c:'#ff80c0'});}
  wings.forEach(w=>{bls.push({x:w.x,y:w.y-8*SC,w:3,h:5,vx:0,vy:-7*SC,al:true,en:false,c:'#60f0a0'});});
}

// ── PARTICLES ──
function emitP(x,y,n=12,c='#ff8040'){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*3+1;
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,lf:30+Math.random()*20,
      mx:50,sz:2+Math.random()*3,c,al:true});}
}
function emitT(x,y,c='#4080ff'){
  parts.push({x,y,vx:(Math.random()-0.5)*0.3,vy:Math.random()*0.5+0.5,lf:8,mx:12,sz:2+Math.random()*2,c,al:true});
}

// ── ULTIMATE ──
function doUlt(){
  if(ultR<3)return;ultR=0;ultG=0;
  const oldGs=gs;gs='ult';snd.ult();
  let t=0;
  function ua(){
    t++;
    ems.forEach(e=>{if(e.al){e.hp=0;emitP(e.x,e.y,8,e.c);e.al=false;wvDead++;}});
    if(boss&&boss.al&&boss.hp>0){boss.hp-=10;emitP(boss.x,boss.y,20,'#ff80ff');snd.bh();}
    if(boss&&boss.hp<=0){boss.al=false;emitP(boss.x,boss.y,40,'#ff80ff');snd.exp();}
    dr();
    ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.3})`;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,100,200,0.2)';
    for(let i=0;i<5;i++)ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*100,2);
    ctx.fillStyle='#ff80ff';ctx.font=`bold ${Math.round(24*SC)}px monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#ff80ff';ctx.shadowBlur=30;
    ctx.fillText('⚡ 天 火 裁 决 ⚡',W/2,H/2);ctx.shadowBlur=0;
    if(t<30)requestAnimationFrame(ua);
    else{gs=oldGs;checkBD();}
  }
  ua();
}

// ── UPDATE BOSS ──
function updBoss(){
  if(!boss||boss.al===false)return;
  if(boss.en){boss.y+=0.5*SC;if(boss.y>50*SC){boss.en=false;boss.vx=1*SC;}return;}
  boss.x+=boss.vx;
  if(boss.x<30*SC||boss.x>W-30*SC)boss.vx*=-1;
  boss.at++;
  if(boss.at>40-stage*boss.ph*3){
    boss.at=0;const bx=boss.x,by=boss.y+boss.h*0.5;
    const pat=[
      ()=>{for(let i=-1;i<=1;i++)eBullet(bx,by,2*i,3);},
      ()=>{if(pl){const dx=pl.x-bx,dy=pl.y-by,d=Math.sqrt(dx*dx+dy*dy)||1;eBullet(bx,by,dx/d*2,dy/d*2);}},
      ()=>{for(let i=0;i<8;i++)eBullet(bx,by,Math.cos(i*Math.PI/4)*2.5,Math.sin(i*Math.PI/4)*2.5);},
    ];
    pat[Math.floor(Math.random()*pat.length)]();boss.hf=5;
  }
}

// ── INIT ──
function initG(){
  score=0;lives=3;stage=1;ultG=0;ultR=0;
  ems=[];bls=[];wings=[];parts=[];txts=[];boss=null;
  pl=mkPl();iStars();
  gs='cutscene';csChar=0;csDone=false;csTimer=0;
  csData=STG[0].bp;
}
function startS(){
  ems=[];bls=[];parts=[];txts=[];boss=null;
  pl=mkPl();iStars();
  gs='playing';stTimer=60;iWv();
}

// ── CHECK BOSS DEFEAT ──
function checkBD(){
  if(boss&&boss.hp<=0){boss.al=false;emitP(boss.x,boss.y,50,'#ff80ff');snd.exp();
    score+=100*stage;
    if(stage>=5){gs='win';return;}
    setTimeout(()=>{stage++;gs='cutscene';csChar=0;csDone=false;csTimer=0;csData=STG[stage-1].bp;},1500);
  }
}

// ── UPDATE ──
function upd(){
  if(gs!=='playing')return;
  frm++;bgOff=(bgOff+1)%H;
  if(stTimer>0){stTimer--;return;}
  stars.forEach(s=>{s.y+=s.s*SC;if(s.y>H){s.y=0;s.x=Math.random()*W;}});

  // player
  if(pl&&pl.al){
    if(pl.inv>0)pl.inv--;
    if(keys.l||keys.a){pl.x-=pl.sp;}
    if(keys.r||keys.d){pl.x+=pl.sp;}
    if(keys.u||keys.w){pl.y-=pl.sp;}
    if(keys.dn||keys.s){pl.y+=pl.sp;}
    pl.x=Math.max(10,Math.min(W-10,pl.x));
    pl.y=Math.max(20,Math.min(H-10,pl.y));
    pl.ft++;if(pl.ft>=pl.fr){pFire();pl.ft=0;snd.shoot();}
    if(frm%2===0)emitT(pl.x,pl.y+14*SC,'#4080ff');
  }

  // spawn
  if(spQ.length>0&&spQ[0].d<=wvSp){
    const sq=spQ.shift();
    spEm(sq.t);wvSp++;
  }
  // wave clear
  if(spQ.length===0&&ems.every(e=>!e.al)&&!wvClr){
    wvIdx++;
    if(wvIdx<wvData.length){ldWv();}
    else wvClr=true;
  }

  ems.forEach(e=>{
    if(!e.al)return;
    e.y+=e.sp*SC;
    if(e.fa){e.x+=Math.sin(frm*0.05+e.y*0.01)*0.5*SC;}
    if(e.bo){e.x+=e.vx*SC;if(e.x<10||e.x>W-10)e.vx*=-1;}
    if(e.hf>0)e.hf--;
    if(e.cf){
      e.ft++;if(e.ft>60&&pl&&pl.al){e.ft=0;
        const dx=pl.x-e.x,dy=pl.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        eBullet(e.x,e.y+10*SC,dx/d*1.5*SC,dy/d*1.5*SC);}
    }
  });

  // boss spawn
  if(wvClr&&!boss&&pl&&pl.al){spBoss(stage);}
  if(boss)updBoss();

  // bullets
  bls.forEach(b=>{
    if(!b.al)return;
    b.x+=b.vx*SC;b.y+=b.vy*SC;
    if(b.y<-20||b.y>H+20||b.x<-20||b.x>W+20)b.al=false;
    if(!b.en){
      ems.forEach(e=>{
        if(!e.al||!b.al)return;
        if(Math.abs(b.x-e.x)<e.w/2+3&&Math.abs(b.y-e.y)<e.h/2+3){
          e.hp--;b.al=false;e.hf=6;
          emitP(b.x,b.y,3,'#80c0ff');
          if(e.hp<=0){e.al=false;score+=10;wvDead++;
            emitP(e.x,e.y,12,e.c);snd.hit();
            if(Math.random()<0.15){
              const ts=['S','L','M','B','P'];
              pups.push({x:e.x,y:e.y,w:12,h:12,ty:ts[Math.floor(Math.random()*ts.length)],vy:1.5*SC,al:true});}
          }
        }
      });
      if(boss&&boss.al){
        if(Math.abs(b.x-boss.x)<boss.w/2+3&&Math.abs(b.y-boss.y)<boss.h/2+3){
          boss.hp--;b.al=false;boss.hf=6;emitP(b.x,b.y,6,'#ff80ff');
          snd.bh();ultG++;if(ultG>=50){ultG=0;if(ultR<3)ultR++;}
          if(boss.hp<=0){boss.al=false;emitP(boss.x,boss.y,50,'#ff80ff');snd.exp();
            score+=100*stage;snd.clr();
            if(stage>=5){gs='win';return;}
            setTimeout(()=>{stage++;gs='cutscene';csChar=0;csDone=false;csTimer=0;csData=STG[stage-1].bp;},1500);}
        }
      }
    }
    // enemy bullets hit player
    if(b.en&&pl&&pl.al&&pl.inv<=0){
      if(Math.abs(b.x-pl.x)<14&&Math.abs(b.y-pl.y)<16){
        b.al=false;
        // wingmen block
        if(wings.length>0){wings.pop();emitP(b.x,b.y,8,'#60f0a0');return;}
        // shield
        if(pl.sh>0){pl.sh--;emitP(b.x,b.y,8,'#f0c060');return;}
        pl.inv=60;lives--;snd.lose();
        emitP(pl.x,pl.y,20,'#ff8040');
        if(lives<=0){gs='over';return;}
      }
    }
  });
  // enemy collision
  ems.forEach(e=>{
    if(!e.al||!pl||!pl.al||pl.inv>0)return;
    if(Math.abs(e.x-pl.x)<(e.w+pl.w)/2-4&&Math.abs(e.y-pl.y)<(e.h+pl.h)/2-4){
      e.al=false;e.hp=0;emitP(e.x,e.y,12,e.c);
      if(wings.length>0){wings.pop();emitP(e.x,e.y,8,'#60f0a0');return;}
      if(pl.sh>0){pl.sh--;emitP(e.x,e.y,8,'#f0c060');return;}
      pl.inv=60;lives--;snd.lose();emitP(pl.x,pl.y,20,'#ff8040');
      if(lives<=0){gs='over';return;}
    }
  });

  // power-ups
  pups.forEach(p=>{
    if(!p.al)return;p.y+=p.vy;
    if(p.y>H+20)p.al=false;
    if(pl&&pl.al&&Math.abs(p.x-pl.x)<18&&Math.abs(p.y-pl.y)<18){
      p.al=false;snd.pup();
      switch(p.ty){
        case'S':pl.pw=Math.min(3,pl.pw+1);break;
        case'L':pl.fr=Math.max(3,pl.fr-2);break;
        case'M':pl.sh=Math.min(3,pl.sh+1);break;
        case'B':pl.wl=Math.min(2,pl.wl+1);wings.push({x:0,y:0});wings.push({x:0,y:0});break;
        case'P':score+=50;break;
      }
    }
  });
  wings=wings.slice(0,2);
  wings.forEach((w,i)=>{w.x=pl.x+(i===0?-16*SC:16*SC);w.y=pl.y+12*SC;});

  // particles
  parts.forEach(p=>{p.lf--;p.x+=p.vx;p.y+=p.vy;if(p.lf<=0)p.al=false;});
  parts=parts.filter(p=>p.al);
  bls=bls.filter(b=>b.al);
  ems=ems.filter(e=>e.al);
  pups=pups.filter(p=>p.al);
}

// ── DRAW ──
function dr(){
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.5;
  for(let i=0;i<H;i+=4*SC){ctx.fillStyle=`rgba(50,80,150,${0.02+Math.sin(i*0.01+bgOff*0.02)*0.01})`;
    ctx.fillRect(0,i,W,2);}
  ctx.globalAlpha=1;
  // stars
  stars.forEach(s=>{ctx.globalAlpha=s.b;ctx.fillStyle='#fff';
    ctx.fillRect(s.x,s.y,1.5*SC,1.5*SC);ctx.globalAlpha=1;});
  // particles
  parts.forEach(p=>{ctx.globalAlpha=p.lf/p.mx;ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x,p.y,p.sz*0.5*SC,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
  // power-ups
  pups.forEach(p=>{ctx.fillStyle={S:'#f0c060',L:'#ff6b6b',M:'#60f0a0',B:'#80c0ff',P:'#ff80c0'}[p.ty]||'#fff';
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;
    ctx.font=`bold ${Math.round(12*SC)}px monospace`;ctx.textAlign='center';
    ctx.fillText({S:'S',L:'L',M:'M',B:'B',P:'★'}[p.ty],p.x,p.y+4*SC);ctx.shadowBlur=0;});
  // enemies
  ems.forEach(e=>{
    if(!e.al)return;
    ctx.shadowColor=e.c;ctx.shadowBlur=e.hf>0?15:5;
    const c=e.hf>0?'#fff':e.c;
    ctx.fillStyle=c;
    // draw different shapes per type
    if(e.t==='dr'){ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();}
    else if(e.t==='gn'){ctx.beginPath();const s=e.w/2;ctx.moveTo(e.x,e.y-s);ctx.lineTo(e.x+s,e.y);ctx.lineTo(e.x,e.y+s);ctx.lineTo(e.x-s,e.y);ctx.closePath();ctx.fill();}
    else if(e.t==='rn'){ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);}
    else if(e.t==='sw'){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2;ctx.lineTo(e.x+Math.cos(a)*e.w/2,e.y+Math.sin(a)*e.h/2);}ctx.closePath();ctx.fill();}
    else if(e.t==='tk'){ctx.beginPath();ctx.roundRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h,4);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(e.x-e.w/4,e.y-e.h/2,e.w/2,2);}
    ctx.shadowBlur=0;
    // HP bar for tanks
    if(e.to&&e.hp<e.mh){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(e.x-e.w/2,e.y-e.h/2-6,e.w,3);
      ctx.fillStyle='#ff6b6b';ctx.fillRect(e.x-e.w/2,e.y-e.h/2-6,e.w*(e.hp/e.mh),3);}
  });
  // boss
  if(boss&&boss.al){
    const c=boss.hf>0?'#fff':boss.c;
    ctx.shadowColor=boss.c;ctx.shadowBlur=20;
    ctx.fillStyle=c;
    // Boss shape - menacing
    const bw=boss.w,bh=boss.h;
    ctx.beginPath();
    ctx.moveTo(boss.x-bw/2,boss.y+bh/3);
    ctx.lineTo(boss.x-bw/3,boss.y-bh/2);
    ctx.lineTo(boss.x+bw/3,boss.y-bh/2);
    ctx.lineTo(boss.x+bw/2,boss.y+bh/3);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,0,100,0.3)';
    ctx.beginPath();ctx.arc(boss.x,boss.y+bh/4,bw/4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff4080';
    ctx.beginPath();ctx.arc(boss.x-8*SC,boss.y-bh/6,4*SC,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(boss.x+8*SC,boss.y-bh/6,4*SC,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(boss.x-8*SC,boss.y-bh/6,2*SC,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(boss.x+8*SC,boss.y-bh/6,2*SC,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Boss name
    ctx.fillStyle='rgba(255,64,128,0.5)';ctx.font=`bold ${Math.round(8*SC)}px monospace`;
    ctx.textAlign='center';ctx.fillText('◆ '+boss.n+' ◆',boss.x,boss.y-bh/2-12*SC);
    // Boss HP
    if(boss.hp<boss.mh){
      ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(boss.x-40*SC,boss.y+bh/2+8*SC,80*SC,4*SC);
      ctx.fillStyle='#ff4080';ctx.fillRect(boss.x-40*SC,boss.y+bh/2+8*SC,80*SC*(boss.hp/boss.mh),4*SC);}
  }
  // bullets
  bls.forEach(b=>{
    if(!b.al)return;
    ctx.shadowColor=b.c;ctx.shadowBlur=6;
    ctx.fillStyle=b.c;
    if(b.en){ctx.beginPath();ctx.arc(b.x,b.y,b.w/2,0,Math.PI*2);ctx.fill();}
    else{ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);}
    ctx.shadowBlur=0;
  });
  // player
  if(pl&&pl.al){
    const blink=pl.inv>0&&Math.floor(pl.inv/4)%2;
    if(!blink){
      // J-20 inspired pixel ship
      ctx.shadowColor='#80c0ff';ctx.shadowBlur=15;
      const px=pl.x,py=pl.y;
      // Main body - delta wing
      ctx.fillStyle='#6080a0';
      ctx.beginPath();
      ctx.moveTo(px,py-14*SC); // nose
      ctx.lineTo(px+14*SC,py+8*SC); // right wing tip
      ctx.lineTo(px+10*SC,py+12*SC);
      ctx.lineTo(px+6*SC,py+8*SC); // right engine
      ctx.lineTo(px-6*SC,py+8*SC); // left engine
      ctx.lineTo(px-10*SC,py+12*SC);
      ctx.lineTo(px-14*SC,py+8*SC); // left wing tip
      ctx.closePath();ctx.fill();
      // Canard (small front wings - J-20 signature)
      ctx.fillStyle='#5070a0';
      ctx.beginPath();ctx.moveTo(px-6*SC,py-6*SC);ctx.lineTo(px-10*SC,py-2*SC);ctx.lineTo(px-6*SC,py-4*SC);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(px+6*SC,py-6*SC);ctx.lineTo(px+10*SC,py-2*SC);ctx.lineTo(px+6*SC,py-4*SC);ctx.closePath();ctx.fill();
      // Cockpit
      ctx.fillStyle='#80d0ff';ctx.globalAlpha=0.6;
      ctx.beginPath();ctx.ellipse(px,py-6*SC,3*SC,5*SC,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      // Engines
      ctx.fillStyle='#405060';
      ctx.fillRect(px-5*SC,py+7*SC,3*SC,5*SC);
      ctx.fillRect(px+3*SC,py+7*SC,3*SC,5*SC);
      // Engine glow
      ctx.fillStyle='#4080ff';ctx.globalAlpha=0.4+Math.sin(frm*0.2)*0.2;
      ctx.fillRect(px-5*SC,py+12*SC,3*SC,4*SC);
      ctx.fillRect(px+3*SC,py+12*SC,3*SC,4*SC);
      ctx.globalAlpha=1;
      // Shield bubble
      if(pl.sh>0){ctx.strokeStyle='rgba(100,200,255,0.15)';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(px,py,20*SC,0,Math.PI*2);ctx.stroke();}
      ctx.shadowBlur=0;
    }
    // Wingmen
    wings.forEach((w,i)=>{
      ctx.fillStyle='#50a070';ctx.globalAlpha=0.8;
      ctx.beginPath();ctx.moveTo(w.x,w.y-8*SC);ctx.lineTo(w.x+6*SC,w.y+4*SC);
      ctx.lineTo(w.x-6*SC,w.y+4*SC);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;
    });
  }
  // HUD
  ctx.fillStyle='#80c0ff';ctx.font=`bold ${Math.round(10*SC)}px monospace`;
  ctx.textAlign='left';ctx.fillText('SCORE: '+score,8,14*SC);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillText('STAGE '+stage,8,28*SC);
  ctx.textAlign='right';
  let livesStr='';for(let i=0;i<lives;i++)livesStr+='🚀';
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText('LIVES: '+livesStr,W-8,14*SC);
  ctx.fillStyle='#80c0ff';ctx.font=`${Math.round(9*SC)}px monospace`;
  ctx.fillText('S:'+(pl?pl.pw:0)+' SH:'+(pl?pl.sh:0)+' W:'+wings.length,W-8,28*SC);
  // Ultimate gauge
  const gw=Math.min(W-20,200);const gx=(W-gw)/2;
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.beginPath();ctx.roundRect(gx,H-16*SC,gw,6*SC,3);ctx.fill();
  for(let i=0;i<3;i++){
    const filled=i<ulR;
    ctx.fillStyle=filled?'rgba(255,64,128,0.6)':'rgba(255,255,255,0.05)';
    const segW=gw/3-2;
    ctx.beginPath();ctx.roundRect(gx+i*(segW+2)+1,H-15.5*SC,segW,5*SC,2);ctx.fill();
    if(filled){ctx.shadowColor='#ff4080';ctx.shadowBlur=6;ctx.fill();ctx.shadowBlur=0;}
  }
  ctx.fillStyle='rgba(255,100,200,0.3)';ctx.font=`${Math.round(7*SC)}px monospace`;
  ctx.textAlign='right';ctx.fillText('ULT',gx-4,H-11*SC);
  // stage start
  if(stTimer>0&&stTimer<60){
    ctx.fillStyle=`rgba(255,255,255,${Math.min(1,stTimer/20)})`;
    ctx.font=`bold ${Math.round(18*SC)}px monospace`;ctx.textAlign='center';
    ctx.fillText('STAGE '+stage,W/2,H/3);
    ctx.fillStyle=`rgba(128,192,255,${Math.min(1,stTimer/20)})`;
    ctx.font=`${Math.round(12*SC)}px monospace`;
    ctx.fillText(STG[stage-1].n,W/2,H/3+24*SC);
  }
}

// ── DRAW CUTSCENE ──
function drCS(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.02;
  for(let i=0;i<30;i++)ctx.fillRect(Math.random()*W,Math.random()*H,2,1);
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(100,180,255,0.08)';
  ctx.font=`${Math.round(14*SC)}px monospace`;ctx.textAlign='center';
  ctx.fillText('◆ 任 务 简 报 ◆',W/2,40*SC);
  ctx.fillStyle='rgba(255,255,255,0.15)';
  ctx.font=`${Math.round(9*SC)}px monospace`;
  ctx.fillText('CLASSIFIED // STAGE '+stage,W/2,55*SC);
  const text=csData.substring(0,csChar);
  const lines=text.split('\n');
  ctx.textAlign='left';
  ctx.font=`${Math.round(10*SC)}px monospace`;
  const lh=18*SC;
  lines.forEach((l,i)=>{
    ctx.fillStyle=l.startsWith('"')?'#f0c060':'#80c0ff';
    ctx.fillText(l,30*SC,90*SC+i*lh);
  });
  if(csDone){
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.font=`${Math.round(10*SC)}px monospace`;ctx.textAlign='center';
    if(Math.floor(frm/20)%2)ctx.fillText('触 屏 继 续',W/2,H-50*SC);
  }
}

// ── TITLE ──
function drTitle(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){ctx.fillStyle=`rgba(100,150,255,${Math.random()*0.03})`;
    ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*80,1);}
  ctx.textAlign='center';
  ctx.shadowColor='#4080ff';ctx.shadowBlur=30;
  ctx.fillStyle='#80c0ff';ctx.font=`bold ${Math.round(28*SC)}px monospace`;
  ctx.fillText('星 际 防 线',W/2,H*0.3);
  ctx.shadowBlur=0;
  ctx.fillStyle='#f0c060';ctx.font=`${Math.round(10*SC)}px monospace`;
  ctx.fillText('STARFIRE DEFENSE',W/2,H*0.3+28*SC);
  // J-20 silhouette
  ctx.fillStyle='rgba(100,150,200,0.08)';
  const sx=W/2,sy=H*0.55;
  ctx.beginPath();ctx.moveTo(sx,sy-30*SC);ctx.lineTo(sx+20*SC,sy+15*SC);
  ctx.lineTo(sx+14*SC,sy+22*SC);ctx.lineTo(sx+8*SC,sy+14*SC);
  ctx.lineTo(sx-8*SC,sy+14*SC);ctx.lineTo(sx-14*SC,sy+22*SC);
  ctx.lineTo(sx-20*SC,sy+15*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(100,150,200,0.05)';
  ctx.beginPath();ctx.moveTo(sx,sy-35*SC);ctx.lineTo(sx+12*SC,sy-5*SC);
  ctx.lineTo(sx-12*SC,sy-5*SC);ctx.closePath();ctx.fill();

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=`${Math.round(9*SC)}px monospace`;
  ctx.fillText('JAX-20 星际战机  ·  J-20 星改',W/2,H*0.55+40*SC);
  if(Math.floor(frm/30)%2){
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=`${Math.round(12*SC)}px monospace`;
    ctx.fillText('触 屏 开 始',W/2,H*0.78);
  }
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font=`${Math.round(7*SC)}px monospace`;
  ctx.fillText('5 大關卡 · 多種敵機 · 僚機系統 · 天火裁決',W/2,H*0.88);
}

// ── GAME OVER ──
function drOver(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle='#ff6b6b';ctx.font=`bold ${Math.round(22*SC)}px monospace`;
  ctx.fillText('💀 GAME OVER',W/2,H*0.35);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font=`${Math.round(12*SC)}px monospace`;
  ctx.fillText('得分: '+score,W/2,H*0.45);
  ctx.fillText('到达: 第 '+stage+' 关',W/2,H*0.51);
  if(Math.floor(frm/20)%2){
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=`${Math.round(10*SC)}px monospace`;
    ctx.fillText('触屏重新开始',W/2,H*0.68);
  }
}

// ── WIN ──
function drWin(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,200,100,0.1)';
  for(let i=0;i<20;i++)ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*50,1);
  ctx.textAlign='center';
  ctx.shadowColor='#f0c060';ctx.shadowBlur=40;
  ctx.fillStyle='#f0c060';ctx.font=`bold ${Math.round(24*SC)}px monospace`;
  ctx.fillText('🏆 任 务 完 成 🏆',W/2,H*0.3);
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font=`${Math.round(14*SC)}px monospace`;
  ctx.fillText('地球得救了。',W/2,H*0.42);
  ctx.fillStyle='rgba(255,200,100,0.6)';ctx.font=`${Math.round(12*SC)}px monospace`;
  ctx.fillText('最终得分: '+score,W/2,H*0.52);
  if(Math.floor(frm/20)%2){
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=`${Math.round(10*SC)}px monospace`;
    ctx.fillText('触屏再来一次',W/2,H*0.68);
  }
}

// ── INPUT ──
let touchX=null,touchY=null,touchId=null;
C.addEventListener('touchstart',e=>{
  e.preventDefault();aI();
  const t=e.changedTouches[0];
  touchX=t.clientX;touchY=t.clientY;touchId=t.identifier;
  handleTap(t.clientX,t.clientY);
},{passive:false});
C.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(let t of e.changedTouches){
    if(t.identifier===touchId){
      const r=C.getBoundingClientRect();
      const x=(t.clientX-r.left)*W/r.width;
      const y=(t.clientY-r.top)*H/r.height;
      if(pl&&pl.al&&gs==='playing'){pl.x=x;pl.y=y;}
    }
  }
},{passive:false});
C.addEventListener('touchend',e=>{touchX=null;touchY=null;touchId=null;},{passive:true});

C.addEventListener('click',e=>{
  aI();const r=C.getBoundingClientRect();
  handleTap(e.clientX,e.clientY);
});

document.addEventListener('keydown',e=>{
  aI();
  const m={ArrowUp:'u',ArrowDown:'dn',ArrowLeft:'l',ArrowRight:'r',KeyW:'w',KeyS:'s',KeyA:'a',KeyD:'d'};
  if(m[e.code]){e.preventDefault();keys[m[e.code]]=true;}
  if(e.code==='Space'){e.preventDefault();if(gs==='playing')doUlt();}
});
document.addEventListener('keyup',e=>{
  const m={ArrowUp:'u',ArrowDown:'dn',ArrowLeft:'l',ArrowRight:'r',KeyW:'w',KeyS:'s',KeyA:'a',KeyD:'d'};
  if(m[e.code]){e.preventDefault();keys[m[e.code]]=false;}
});

function handleTap(cx,cy){
  aI();
  if(gs==='title'){gs='cutscene';csChar=0;csDone=false;csTimer=0;csData=STG[0].bp;return;}
  if(gs==='cutscene'&&csDone){
    if(stage===1&&!pl)initG();
    startS();return;
  }
  if(gs==='over'||gs==='win'){stage=1;initG();gs='cutscene';csChar=0;csDone=false;csTimer=0;csData=STG[0].bp;return;}
  if(gs==='playing'&&ultR>=3){
    const r=C.getBoundingClientRect();
    const y=(cy-r.top)*H/r.height;
    if(y>H-30*SC)doUlt();
  }
}

// ── MAIN LOOP ──
function main(t){
  if(gs==='cutscene'){
    csTimer++;frm++;
    if(!csDone&&csTimer%2===0&&csChar<csData.length)csChar++;
    if(csChar>=csData.length)csDone=true;
    drCS();
  }else if(gs==='title'){frm++;drTitle();}
  else if(gs==='playing'){upd();dr();}
  else if(gs==='over'){frm++;drOver();}
  else if(gs==='win'){frm++;drWin();}
  animId=requestAnimationFrame(main);
}

// ── START ──
resize();initG();
gs='title';frm=0;
pl=mkPl();iStars();
main(0);

// ── RESIZE ──
window.addEventListener('resize',()=>{resize();});
