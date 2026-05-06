
(function(){
var C=document.getElementById('g'),ctx=C.getContext('2d');
var GW=document.getElementById('gw');
var W,H,SC,gs='title',score=0,lives=3,stage=1,ultG=0,ultR=0,frm=0,bg=0;
var pl,bls=[],ems=[],boss=null,pups=[],wings=[],parts=[],stars=[];
var csD,csC=0,csDn=false,csT=0,stT=0;
var wvD,wvI=0,spQ=[],wvS=0,wvC=false;
function sz(){
  W=Math.min(GW.clientWidth,420);H=Math.min(GW.clientHeight,800);
  if(W/H<0.5)W=H*0.5;if(H/W>2.2)H=W*2.2;
  C.width=W;C.height=H;SC=W/320;
}
sz();window.addEventListener('resize',sz);
var ac=null;
function ai(){if(!ac||ac.state==='closed'){ac=new(window.AudioContext||window.webkitAudioContext)();}
  if(ac.state==='suspended')ac.resume();
}
function pt(f,d,t,v){
  try{ai();
    if(!ac||ac.state==='closed')return;
    var o=ac.createOscillator(),g=ac.createGain();
    o.type=t||'square';
    o.frequency.setValueAtTime(f,ac.currentTime);
    if(d>0.05)g.gain.setValueAtTime(v||0.08,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+Math.max(d,0.05));
    o.connect(g);g.connect(ac.destination);
    try{o.start();o.stop(ac.currentTime+Math.max(d,0.05));}catch(ex){}
  }catch(e){}
}

var SA={sh:function(){pt(880,0.06,'square',0.04);},
hi:function(){pt(220,0.1,'sawtooth',0.06);},
ex:function(){pt(80,0.3,'sawtooth',0.1);setTimeout(function(){pt(50,0.4,'sawtooth',0.06);},100);},
pu:function(){pt(660,0.1,'sine',0.06);setTimeout(function(){pt(880,0.1,'sine',0.06);},100);setTimeout(function(){pt(1100,0.15,'sine',0.06);},200);},
ul:function(){pt(200,0.5,'sawtooth',0.12);setTimeout(function(){pt(600,0.3,'sawtooth',0.1);},100);setTimeout(function(){pt(1000,0.5,'sine',0.15);},200);},
bh:function(){pt(120,0.15,'sawtooth',0.1);},
cl:function(){var ns=[523,659,784,1047];for(var i=0;i<4;i++){(function(j){setTimeout(function(){pt(ns[j],0.15,'sine',0.06);},j*100);})(i);}},
lo:function(){pt(300,0.2,'sawtooth',0.08);setTimeout(function(){pt(200,0.3,'sawtooth',0.08);},200);setTimeout(function(){pt(100,0.5,'sawtooth',0.06);},400);}};
function iS(){stars=[];for(var i=0;i<50;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5+0.5,b:Math.random()*0.5+0.3});}
var STG=[
{n:'ORBIT DEFENSE',b:'SENTINEL',bp:'2147年，Xenon帝国舰队突破木星轨道。JAX-20编队紧急升空！目标：摧毁前哨无人机群。"保持队形，菜鸟。"',bl:15},
{n:'MOON SHADOW',b:'MOON SPIDER',bp:'月球基地失联。抵达后发现已被改造成敌军工厂。到处都是自动炮塔。"我们要把月亮夺回来。"',bl:20},
{n:'ASTEROID STORM',b:'NEST QUEEN',bp:'追击残敌进入小行星带。这里潜伏着生物机械寄生体。通讯中断，孤立无援。"只能靠自己了。"',bl:25},
{n:'STARGATE BATTLE',b:'GATE GUARDIAN',bp:'敌舰试图激活超空间星门。必须在星门充能完毕前摧毁它！能量护盾覆盖了整个区域。"这是最后的屏障！"',bl:30},
{n:'HEART OF DARKNESS',b:'OVERMIND CORE',bp:'穿越星门抵达Xenon母星。主宰核心就在前方。这是最后的决战。"为了地球出击！"',bl:35},
];
function mkPl(){return{x:W/2,y:H*0.82,w:24,h:28,sp:W*0.005,ft:0,fr:6,pw:0,wl:0,sh:0,inv:0,al:true,tx:null,ty:null};}
var WV=[[[{t:'d',n:5,d:30},{t:'d',n:7,d:22}],[{t:'d',n:6,d:20},{t:'g',n:2,d:40}],[{t:'d',n:8,d:18},{t:'g',n:3,d:35}]],[[{t:'d',n:7,d:25},{t:'g',n:3,d:38}],[{t:'g',n:3,d:32},{t:'r',n:2,d:32}],[{t:'g',n:4,d:28},{t:'r',n:3,d:28}]],[[{t:'r',n:3,d:28},{t:'g',n:3,d:32}],[{t:'s',n:5,d:16},{t:'r',n:3,d:22}],[{t:'s',n:7,d:12},{t:'g',n:4,d:28}]],[[{t:'g',n:4,d:28},{t:'s',n:5,d:18},{t:'t',n:1,d:45}],[{t:'s',n:7,d:14},{t:'t',n:2,d:38}],[{t:'t',n:2,d:32},{t:'s',n:8,d:12}]],[[{t:'t',n:2,d:38},{t:'s',n:7,d:16}],[{t:'t',n:3,d:32},{t:'s',n:8,d:12}],[{t:'t',n:3,d:28},{t:'s',n:10,d:10}]]];

function iW(){wvD=WV[Math.min(stage-1,4)];wvI=0;spQ=[];wvS=0;wvC=false;var w=wvD[wvI];spQ=[];w.forEach(function(g){for(var i=0;i<g.n;i++)spQ.push({t:g.t,d:g.d*i});});}
function se(t){
  var e={x:Math.random()*(W-40)+20,y:-30,w:20,h:20,hp:1,sp:1+stage*0.15,al:true,hf:0};
  if(t==='d'){e.hp=1;e.w=16;e.h=16;e.c='#80c0ff';}
  else if(t==='g'){e.hp=1+Math.floor(stage/3);e.sp=0.6+stage*0.08;e.w=22;e.h=22;e.c='#ff6b6b';e.cf=true;}
  else if(t==='r'){e.hp=1;e.sp=1.5+stage*0.15;e.w=14;e.h=14;e.c='#60f0a0';}
  else if(t==='s'){e.hp=1;e.sp=0.7+stage*0.08;e.w=12;e.h=12;e.c='#f0c060';e.bo=true;e.vx=(Math.random()-0.5)*2;}
  else if(t==='t'){e.hp=3+stage*2;e.sp=0.3;e.w=26;e.h=26;e.c='#a080ff';e.cf=true;}
  ems.push(e);
}
function sB(si){var st=STG[Math.min(si-1,4)];boss={x:W/2,y:-60,w:48,h:48,hp:st.bl,al:true,at:0,vx:0,hf:0,en:true,c:'#ff4080',n:st.b};}
function uB(){
  if(!boss||!boss.al)return;
  if(boss.en){boss.y+=0.5*SC;if(boss.y>50*SC){boss.en=false;boss.vx=1*SC;}return;}
  boss.x+=boss.vx;if(boss.x<30*SC||boss.x>W-30*SC)boss.vx*=-1;
  boss.at++;if(boss.at>50-stage*2){
    boss.at=0;var bx=boss.x,by=boss.y+boss.h*0.5;
    var r2=Math.random();
    if(r2<0.4){for(var i=-1;i<=1;i++)bls.push({x:bx,y:by,w:6,h:6,vx:2*i*SC,vy:3*SC,al:true,en:true,c:'#ff4080'});}
    else if(r2<0.7&&pl){bls.push({x:bx,y:by,w:6,h:6,vx:(pl.x-bx)*0.03,vy:(pl.y-by)*0.03+2*SC,al:true,en:true,c:'#ff80c0'});}
    else{for(var i=0;i<5;i++)bls.push({x:bx+Math.cos(i*1.26)*30*SC,y:by,w:6,h:6,vx:Math.cos(i*1.26)*2*SC,vy:Math.sin(i*1.26)*2*SC+1*SC,al:true,en:true,c:'#ff4080'});}
  }
}
function eP(x,y,n,c){for(var i=0;i<n;i++){var a=Math.random()*6.28,sp=Math.random()*2+1;parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,lf:15+Math.random()*15,sz:2+Math.random()*2,c:c,al:true});}}
function eT(x,y){parts.push({x:x,y:y,vx:(Math.random()-0.5)*0.5,vy:Math.random()*0.8+0.3,lf:6,sz:2,c:'#4080ff',al:true});}
function pF(){
  if(!pl||!pl.al)return;
  var px=pl.x,py=pl.y-12*SC;
  bls.push({x:px,y:py,w:4,h:8,vx:0,vy:-7*SC,al:true,en:false,c:'#80c0ff'});
  if(pl.pw>=1){bls.push({x:px-7*SC,y:py,w:3,h:6,vx:0,vy:-6.5*SC,al:true,en:false,c:'#60f0a0'});bls.push({x:px+7*SC,y:py,w:3,h:6,vx:0,vy:-6.5*SC,al:true,en:false,c:'#60f0a0'});}
  if(pl.pw>=2){bls.push({x:px-14*SC,y:py+4*SC,w:3,h:5,vx:-0.5*SC,vy:-5.5*SC,al:true,en:false,c:'#f0c060'});bls.push({x:px+14*SC,y:py+4*SC,w:3,h:5,vx:0.5*SC,vy:-5.5*SC,al:true,en:false,c:'#f0c060'});}
  wings.forEach(function(w){bls.push({x:w.x,y:w.y-8*SC,w:3,h:5,vx:0,vy:-6*SC,al:true,en:false,c:'#60f0a0'});});
}
function doU(){
  if(ultR<3)return;ultR=0;ultG=0;SA.ul();
  var t=0;
  (function ua(){t++;
    ems.forEach(function(e){if(e.al){e.hp=0;eP(e.x,e.y,8,e.c);e.al=false;}});
    if(boss&&boss.al&&boss.hp>0){boss.hp-=10;eP(boss.x,boss.y,20,'#ff80ff');SA.bh();}
    if(boss&&boss.hp<=0){boss.al=false;}
    dr();
    ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.3)+')';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,100,200,0.2)';
    for(var i=0;i<5;i++)ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*100,2);
    ctx.fillStyle='#ff80ff';ctx.font='bold '+(Math.round(22*SC))+'px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#ff80ff';ctx.shadowBlur=30;
    ctx.fillText('⚡ 天 火 裁 决 ⚡',W/2,H/2);ctx.shadowBlur=0;
    if(t<30)requestAnimationFrame(ua);
  })();
}
function initG(){score=0;lives=3;stage=1;ultG=0;ultR=0;frm=0;ems=[];bls=[];wings=[];parts=[];boss=null;pups=[];pl=mkPl();iS();gs='title';}
function startS(){ems=[];bls=[];parts=[];boss=null;pups=[];pl=mkPl();iS();gs='playing';stT=5;iW();}
function upd(){
  if(gs!=='playing')return;
  frm++;bg=(bg+1)%H;
  if(stT>0){stT--;stars.forEach(function(s){s.y+=s.s*SC;if(s.y>H){s.y=0;s.x=Math.random()*W;}});dr();return;}
  stars.forEach(function(s){s.y+=s.s*SC;if(s.y>H){s.y=0;s.x=Math.random()*W;}});
  if(pl&&pl.al){
    if(pl.inv>0)pl.inv--;
    if(pl.tx!==null&&pl.ty!==null){var dx=pl.tx-pl.x,dy=pl.ty-pl.y,d=Math.sqrt(dx*dx+dy*dy);if(d>3){pl.x+=dx*0.12;pl.y+=dy*0.12;}else{pl.x=pl.tx;pl.y=pl.ty;}}
    pl.x=Math.max(12,Math.min(W-12,pl.x));pl.y=Math.max(22,Math.min(H-12,pl.y));
    pl.ft++;if(pl.ft>=pl.fr){pF();pl.ft=0;}if(frm%2===0)eT(pl.x,pl.y+14*SC);
  }
  if(spQ.length>0&&spQ[0].d<=wvS){var q=spQ.shift();se(q.t);wvS++;}
  if(spQ.length===0&&ems.every(function(e){return !e.al;})&&!wvC){
    wvI++;if(wvI<wvD.length){var w=wvD[wvI];spQ=[];wvS=0;w.forEach(function(g){for(var i=0;i<g.n;i++)spQ.push({t:g.t,d:g.d*i});});}
    else wvC=true;
  }
  ems.forEach(function(e){
    if(!e.al)return;e.y+=e.sp*SC;
    if(e.bo){e.x+=e.vx*SC;if(e.x<10||e.x>W-10)e.vx*=-1;}
    if(e.hf>0)e.hf--;
    if(e.cf){var n=e.ft||0;e.ft=n+1;
      if(e.ft>50+stage*5&&pl&&pl.al){e.ft=0;var dx=pl.x-e.x,dy=pl.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        bls.push({x:e.x,y:e.y+12*SC,w:5,h:5,vx:dx/d*1.2*SC,vy:dy/d*1.2*SC,al:true,en:true,c:'#ff6b6b'});}}
  });
  if(wvC&&!boss&&pl&&pl.al)sB(stage);
  if(boss)uB();
  bls.forEach(function(b){
    if(!b.al)return;b.x+=b.vx*SC;b.y+=b.vy*SC;
    if(b.y<-30||b.y>H+30||b.x<-30||b.x>W+30)b.al=false;
    if(!b.en){
      ems.forEach(function(e){
        if(!e.al||!b.al)return;
        if(Math.abs(b.x-e.x)<e.w/2+3&&Math.abs(b.y-e.y)<e.h/2+3){
          e.hp--;b.al=false;e.hf=6;eP(b.x,b.y,3,'#80c0ff');
          if(e.hp<=0){e.al=false;score+=10;eP(e.x,e.y,10,e.c);if(Math.random()<0.12)pups.push({x:e.x,y:e.y,ty:['S','L','B','M','P'][Math.floor(Math.random()*5)],vy:1.2*SC,al:true});}
        }
      });
      if(boss&&boss.al&&Math.abs(b.x-boss.x)<boss.w/2+4&&Math.abs(b.y-boss.y)<boss.h/2+4){
        boss.hp--;b.al=false;boss.hf=8;eP(b.x,b.y,5,'#ff80ff');ultG++;if(ultG>=40){ultG=0;if(ultR<3)ultR++;}
        if(boss.hp<=0){boss.al=false;eP(boss.x,boss.y,40,'#ff80ff');score+=100*stage;
          if(stage>=5){gs='win';return;}
          setTimeout(function(){stage++;gs='cutscene';csC=0;csDn=false;csT=0;csD=STG[Math.min(stage-1,4)].bp;},1200);}
      }
    }
    if(b.en&&pl&&pl.al&&pl.inv<=0&&Math.abs(b.x-pl.x)<12&&Math.abs(b.y-pl.y)<14){
      b.al=false;
      if(wings.length>0){wings.pop();eP(b.x,b.y,6,'#60f0a0');return;}
      if(pl.sh>0){pl.sh--;eP(b.x,b.y,6,'#f0c060');return;}
      pl.inv=45;lives--;eP(pl.x,pl.y,15,'#ff8040');
      if(lives<=0){gs='over';return;}
    }
  });
  ems.forEach(function(e){
    if(!e.al||!pl||!pl.al||pl.inv>0)return;
    if(Math.abs(e.x-pl.x)<(e.w+20)/2&&Math.abs(e.y-pl.y)<(e.h+22)/2){e.al=false;eP(e.x,e.y,10,e.c);if(wings.length>0){wings.pop();return;}if(pl.sh>0){pl.sh--;return;}pl.inv=45;lives--;eP(pl.x,pl.y,15,'#ff8040');if(lives<=0){gs='over';return;}}
  });
  pups.forEach(function(p){if(!p.al)return;p.y+=p.vy;if(p.y>H+20)p.al=false;if(pl&&pl.al&&Math.abs(p.x-pl.x)<18&&Math.abs(p.y-pl.y)<18){p.al=false;if(p.ty==='S')pl.pw=Math.min(3,pl.pw+1);else if(p.ty==='L')pl.fr=Math.max(3,pl.fr-2);else if(p.ty==='B'){pl.wl=Math.min(2,pl.wl+1);wings.push({x:0,y:0});wings.push({x:0,y:0});wings=wings.slice(0,2);}else if(p.ty==='M')pl.sh=Math.min(3,pl.sh+1);else if(p.ty==='P')score+=50;}});
  wings.forEach(function(w,i){w.x=pl.x+(i===0?-14*SC:14*SC);w.y=pl.y+10*SC;});
  parts=parts.filter(function(p){p.lf--;p.x+=p.vx;p.y+=p.vy;return p.lf>0;});
  bls=bls.filter(function(b){return b.al;});ems=ems.filter(function(e){return e.al;});pups=pups.filter(function(p){return p.al;});
}
function dr(){
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.4;
  for(var i=0;i<H;i+=4*SC){var a2=0.02+Math.sin(i*0.01+bg*0.02)*0.01;ctx.fillStyle='rgba(50,80,150,'+a2+')';ctx.fillRect(0,i,W,2);}
  ctx.globalAlpha=1;
  stars.forEach(function(s){ctx.globalAlpha=s.b;ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,1.5*SC,1.5*SC);ctx.globalAlpha=1;});
  parts.forEach(function(p){ctx.globalAlpha=p.lf/15;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.sz*0.5*SC,0,6.28);ctx.fill();ctx.globalAlpha=1;});
  pups.forEach(function(p){var co=p.ty;var cc='#fff';if(co==='S')cc='#f0c060';else if(co==='L')cc='#ff6b6b';else if(co==='B')cc='#80c0ff';else if(co==='M')cc='#60f0a0';else if(co==='P')cc='#ff80c0';ctx.fillStyle=cc;
    ctx.shadowColor=cc;ctx.shadowBlur=8;ctx.font='bold '+(Math.round(11*SC))+'px monospace';ctx.textAlign='center';
    var lb='?';if(co==='S')lb='S';else if(co==='L')lb='L';else if(co==='B')lb='B';else if(co==='M')lb='M';else if(co==='P')lb='★';
    ctx.fillText(lb,p.x,p.y+4*SC);ctx.shadowBlur=0;});
  ems.forEach(function(e){if(!e.al)return;ctx.shadowColor=e.c;ctx.shadowBlur=e.hf>0?12:4;ctx.fillStyle=e.hf>0?'#fff':e.c;
    ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,6.28);ctx.fill();ctx.shadowBlur=0;});
  if(boss&&boss.al){
    var c2=boss.hf>0?'#fff':boss.c;ctx.shadowColor=boss.c;ctx.shadowBlur=15;ctx.fillStyle=c2;
    ctx.beginPath();ctx.moveTo(boss.x-boss.w/2,boss.y+boss.h/4);ctx.lineTo(boss.x-boss.w/3,boss.y-boss.h/2);
    ctx.lineTo(boss.x+boss.w/3,boss.y-boss.h/2);ctx.lineTo(boss.x+boss.w/2,boss.y+boss.h/4);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,0,100,0.2)';ctx.beginPath();ctx.arc(boss.x,boss.y+boss.h/4,boss.w/4,0,6.28);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(boss.x-35*SC,boss.y+boss.h/2+6*SC,70*SC,3*SC);
    var si2=Math.min(stage-1,4);ctx.fillStyle='#ff4080';ctx.fillRect(boss.x-35*SC,boss.y+boss.h/2+6*SC,70*SC*(boss.hp/STG[si2].bl),3*SC);
  }
  bls.forEach(function(b){if(!b.al)return;ctx.shadowColor=b.c;ctx.shadowBlur=5;ctx.fillStyle=b.c;
    if(b.en){ctx.beginPath();ctx.arc(b.x,b.y,b.w/2,0,6.28);ctx.fill();}else ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);ctx.shadowBlur=0;});
  if(pl&&pl.al){
    var blk=pl.inv>0&&Math.floor(pl.inv/4)%2;
    if(!blk){
      ctx.shadowColor='#80c0ff';ctx.shadowBlur=12;ctx.fillStyle='#6080a0';
      ctx.beginPath();ctx.moveTo(pl.x,pl.y-14*SC);ctx.lineTo(pl.x+12*SC,pl.y+8*SC);ctx.lineTo(pl.x+8*SC,pl.y+12*SC);
      ctx.lineTo(pl.x+4*SC,pl.y+7*SC);ctx.lineTo(pl.x-4*SC,pl.y+7*SC);ctx.lineTo(pl.x-8*SC,pl.y+12*SC);
      ctx.lineTo(pl.x-12*SC,pl.y+8*SC);ctx.closePath();ctx.fill();
      ctx.fillStyle='#80d0ff';ctx.globalAlpha=0.5;
      ctx.beginPath();ctx.ellipse(pl.x,pl.y-6*SC,3*SC,4*SC,0,0,6.28);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='#4080ff';ctx.globalAlpha=0.4+Math.sin(frm*0.2)*0.2;
      ctx.fillRect(pl.x-4*SC,pl.y+10*SC,3*SC,4*SC);ctx.fillRect(pl.x+2*SC,pl.y+10*SC,3*SC,4*SC);
      ctx.globalAlpha=1;ctx.shadowBlur=0;
      if(pl.sh>0){ctx.strokeStyle='rgba(100,200,255,0.12)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pl.x,pl.y,18*SC,0,6.28);ctx.stroke();}
    }
    wings.forEach(function(w){ctx.fillStyle='#50a070';ctx.globalAlpha=0.7;
      ctx.beginPath();ctx.moveTo(w.x,w.y-6*SC);ctx.lineTo(w.x+5*SC,w.y+3*SC);ctx.lineTo(w.x-5*SC,w.y+3*SC);ctx.closePath();ctx.fill();ctx.globalAlpha=1;});
  }
  ctx.fillStyle='#80c0ff';ctx.font='bold '+(Math.round(10*SC))+'px monospace';ctx.textAlign='left';
  ctx.fillText('SCORE:'+score,8,14*SC);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillText('STAGE '+stage,8,28*SC);
  ctx.textAlign='right';var ls='';for(var i=0;i<lives;i++)ls+='♥';
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText(ls,W-8,14*SC);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=Math.round(8*SC)+'px monospace';
  ctx.fillText('P'+pl.pw+' S'+pl.sh+' W'+wings.length,W-8,28*SC);
  var ugw=Math.min(W-20,180),ugx=(W-ugw)/2;
  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.beginPath();ctx.roundRect(ugx,H-14*SC,ugw,5*SC,2);ctx.fill();
  for(var i=0;i<3;i++){ctx.fillStyle=i<ultR?'rgba(255,64,128,0.5)':'rgba(255,255,255,0.03)';
    ctx.beginPath();ctx.roundRect(ugx+i*(ugw/3+1)+1,H-13.5*SC,ugw/3-2,4.5*SC,2);ctx.fill();}
  ctx.fillStyle='rgba(255,100,200,0.2)';ctx.font=Math.round(7*SC)+'px monospace';ctx.textAlign='right';ctx.fillText('ULT',ugx-4,H-10*SC);
  if(stT>0&&stT<40){var al=Math.min(1,stT/15);ctx.fillStyle='rgba(255,255,255,'+al+')';ctx.font='bold '+(Math.round(16*SC))+'px monospace';ctx.textAlign='center';
    ctx.fillText('STAGE '+stage,W/2,H/3);ctx.fillStyle='rgba(128,192,255,'+al+')';ctx.font=Math.round(10*SC)+'px monospace';
    ctx.fillText(STG[Math.min(stage-1,4)].n,W/2,H/3+20*SC);}
}
function drCS(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.02;for(var i=0;i<20;i++)ctx.fillRect(Math.random()*W,Math.random()*H,1,1);ctx.globalAlpha=1;
  ctx.fillStyle='rgba(100,180,255,0.06)';ctx.font=Math.round(13*SC)+'px monospace';ctx.textAlign='center';
  ctx.fillText('◆ 任 务 简 报 ◆',W/2,35*SC);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font=Math.round(8*SC)+'px monospace';
  ctx.fillText('CLASSIFIED // STAGE '+stage,W/2,50*SC);
  var text=csD.substring(0,csC);var lines=text.split('\n');
  ctx.textAlign='left';ctx.font=Math.round(10*SC)+'px monospace';
  var lh=17*SC;var sy2=85*SC;
lines.forEach(function(l,i){ctx.fillStyle=l.charAt(0)==='"'?'#f0c060':'#80c0ff';ctx.fillText(l,25*SC,sy2+i*lh);});
  if(csDn){if(Math.floor(frm/20)%2){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.textAlign='center';ctx.font=Math.round(11*SC)+'px monospace';ctx.fillText('▼ 触 屏 继 续 ▼',W/2,H-40*SC);}}
}
function drTitle(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  for(var i=0;i<30;i++){ctx.fillStyle='rgba(100,150,255,'+(Math.random()*0.03)+')';ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*60,1);}
  ctx.textAlign='center';ctx.shadowColor='#4080ff';ctx.shadowBlur=25;
  ctx.fillStyle='#80c0ff';ctx.font='bold '+(Math.round(24*SC))+'px monospace';
  ctx.fillText('星 际 防 线',W/2,H*0.28);ctx.shadowBlur=0;
  ctx.fillStyle='#f0c060';ctx.font=Math.round(9*SC)+'px monospace';
  ctx.fillText('STARFIRE DEFENSE',W/2,H*0.28+24*SC);
  var sx=W/2,sy=H*0.52;
  ctx.fillStyle='rgba(100,150,200,0.06)';
  ctx.beginPath();ctx.moveTo(sx,sy-28*SC);ctx.lineTo(sx+18*SC,sy+12*SC);ctx.lineTo(sx+12*SC,sy+20*SC);
  ctx.lineTo(sx+6*SC,sy+12*SC);ctx.lineTo(sx-6*SC,sy+12*SC);ctx.lineTo(sx-12*SC,sy+20*SC);ctx.lineTo(sx-18*SC,sy+12*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(100,150,200,0.04)';
  ctx.beginPath();ctx.moveTo(sx,sy-32*SC);ctx.lineTo(sx+10*SC,sy-2*SC);ctx.lineTo(sx-10*SC,sy-2*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=Math.round(8*SC)+'px monospace';ctx.fillText('JAX-20 星际战机',W/2,H*0.52+35*SC);
  if(Math.floor(frm/30)%2){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(12*SC)+'px monospace';ctx.fillText('触 屏 开 始',W/2,H*0.75);}
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font=Math.round(7*SC)+'px monospace';
  ctx.fillText('5关 僚机 火力升级 天火裁决',W/2,H*0.86);
}
function drOver(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
  ctx.fillStyle='#ff6b6b';ctx.font='bold '+(Math.round(20*SC))+'px monospace';
  ctx.fillText('GAME OVER',W/2,H*0.32);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(12*SC)+'px monospace';
  ctx.fillText('得分: '+score,W/2,H*0.44);ctx.fillText('到达: 第'+stage+'关',W/2,H*0.51);
  if(Math.floor(frm/20)%2){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=Math.round(10*SC)+'px monospace';ctx.fillText('触屏重新开始',W/2,H*0.66);}
}
function drWin(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  for(var i=0;i<15;i++){ctx.fillStyle='rgba(255,200,100,'+(Math.random()*0.06)+')';ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*40,1);}
  ctx.textAlign='center';ctx.shadowColor='#f0c060';ctx.shadowBlur=30;
  ctx.fillStyle='#f0c060';ctx.font='bold '+(Math.round(22*SC))+'px monospace';
  ctx.fillText('任 务 完 成',W/2,H*0.30);ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(12*SC)+'px monospace';
  ctx.fillText('地球得救了。',W/2,H*0.42);
  ctx.fillStyle='#f0c060';ctx.font='bold '+(Math.round(14*SC))+'px monospace';
  ctx.fillText('FINAL SCORE: '+score,W/2,H*0.54);
  if(Math.floor(frm/20)%2){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=Math.round(10*SC)+'px monospace';ctx.fillText('触屏再来一次',W/2,H*0.68);}
}
var tX=null,tY=null,tID=null;
C.addEventListener('touchstart',function(e){e.preventDefault();ai();
  var t=e.changedTouches[0];tX=t.clientX;tY=t.clientY;tID=t.identifier;
  ht(t.clientX,t.clientY);
  if(gs==='playing'&&pl&&pl.al){var r=C.getBoundingClientRect();pl.tx=(t.clientX-r.left)*W/r.width;pl.ty=(t.clientY-r.top)*H/r.height;}
},{passive:false});
C.addEventListener('touchmove',function(e){e.preventDefault();
  for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];
    if(t.identifier===tID&&pl&&pl.al&&gs==='playing'){
      var r=C.getBoundingClientRect();
      pl.tx=(t.clientX-r.left)*W/r.width;pl.ty=(t.clientY-r.top)*H/r.height;}}
},{passive:false});
C.addEventListener('touchend',function(e){tX=null;tY=null;},{passive:true});
C.addEventListener('click',function(e){ai();ht(e.clientX,e.clientY);});

function ht(cx,cy){
  ai();
  if(gs==='title'){gs='cutscene';csC=0;csDn=false;csT=0;frm=0;csD=STG[0].bp;return;}
  if(gs==='cutscene'&&csDn){startS();return;}
  if(gs==='over'||gs==='win'){stage=1;initG();gs='title';return;}
  if(gs==='playing'&&ultR>=3){doU();}
}

function main(){
  if(gs==='title'){frm++;drTitle();}
  else if(gs==='cutscene'){frm++;csT++;if(!csDn&&csT%2===0&&csC<csD.length)csC++;if(csC>=csD.length)csDn=true;drCS();}
  else if(gs==='playing'){upd();dr();}
  else if(gs==='over'){frm++;drOver();}
  else if(gs==='win'){frm++;drWin();}
  requestAnimationFrame(main);
}

initG();main();
})();
