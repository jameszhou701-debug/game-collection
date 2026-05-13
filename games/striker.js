(function(){
var C=document.getElementById('g'),ctx=C.getContext('2d');
var GW=document.getElementById('gw');
var W,H,SC,gs='title',score=0,lives=3,stage=1,ultG=0,ultR=0,frm=0,bg=0;
var pl,bls=[],ems=[],boss=null,pups=[],wings=[],parts=[],stars=[];
var csD,csC=0,csDn=false,csT=0,stT=0;
var wvC=false,spTimer=0,bossSpawned=false,enKilled=0,enLimit=0;

function sz(){
  W=Math.min(GW.clientWidth,420);H=Math.min(GW.clientHeight,750);
  if(W/H<0.5)W=H*0.5;if(H/W>2.2)H=W*2.2;
  C.width=W;C.height=H;SC=W/260;
}
sz();window.addEventListener('resize',sz);

// ── Audio ──
var ac=null;
function ai(){if(!ac||ac.state==='closed'){ac=new(window.AudioContext||window.webkitAudioContext)();}
  if(ac.state==='suspended')ac.resume();}
function pt(f,d,t,v,dl){
  try{ai();if(!ac)return;
    var o=ac.createOscillator(),g=ac.createGain();
    var t0=(dl||0)+ac.currentTime;
    o.type=t||'square';
    o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(v||0.08,t0);
    g.gain.exponentialRampToValueAtTime(0.001,t0+Math.max(d,0.05));
    o.connect(g);g.connect(ac.destination);
    o.start(t0);o.stop(t0+Math.max(d,0.05));
  }catch(e){}}
function SF_sh(){pt(880,0.06,'square',0.04);}
function SF_hi(){pt(220,0.1,'sawtooth',0.06);}
function SF_ex(){pt(80,0.3,'sawtooth',0.12);pt(50,0.4,'sawtooth',0.08,0.12);}
function SF_pu(){pt(660,0.1,'sine',0.06);pt(880,0.1,'sine',0.06,0.1);pt(1100,0.15,'sine',0.06,0.22);}
function SF_ul(){pt(200,0.5,'sawtooth',0.15);pt(600,0.3,'sawtooth',0.12,0.12);pt(1000,0.5,'sine',0.18,0.25);}
function SF_bh(){pt(120,0.2,'sawtooth',0.12);}
function SF_cl(){pt(523,0.15,'sine',0.06);pt(659,0.15,'sine',0.06,0.1);pt(784,0.15,'sine',0.06,0.2);pt(1047,0.15,'sine',0.06,0.3);}
function SF_lo(){pt(300,0.2,'sawtooth',0.1);pt(200,0.3,'sawtooth',0.08,0.15);pt(100,0.5,'sawtooth',0.06,0.3);}
function SF_bs(){pt(60,0.4,'sawtooth',0.15);pt(45,0.6,'sawtooth',0.1,0.15);pt(30,0.8,'sawtooth',0.06,0.3);}

// ── Stars ──
function iS(){stars=[];for(var i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5+0.5,b:Math.random()*0.5+0.3});}

// ── Stage Data ──
var STG=[
{n:'ORBIT DEFENSE',b:'ORBIT SENTINEL',bp:'2147年→Xenon帝国突破欧星防线。\nJAX-20编队紧急升空。\n目标：摧毁前哨无人机群。\n"保持队形。菜鸟。"',bl:80,bsz:1.0,pts:80},
{n:'MOON SHADOW',b:'LUNAR SPIDER',bp:'月球基地失联。\n已被改造成敌军工厂。\n天空布满巡逻机和轰炸机。\n"为基地复仇。"',bl:150,bsz:1.3,pts:180},
{n:'ASTEROID STORM',b:'NEST QUEEN',bp:'追击残敌进入小行星带。\n这里潜伏着生物机械寄生体。\n通讯中断，孤立无援。\n"只能靠自己了。"',bl:230,bsz:1.6,pts:300},
{n:'STARGATE BATTLE',b:'GATE GUARDIAN',bp:'敌舰试图激活超空间星门。\n必须在充能完毕前摧毁它！\n敌方精锐尽出。\n"这是最后的屏障！为了地球！"',bl:350,bsz:2.0,pts:420},
{n:'HEART OF DARKNESS',b:'OVERMIND CORE',bp:'穿越星门抵达Xenon母星。\n主宰核心就在前方。\n整个文明的黑暗意志。\n"为所有失去的人。最后一战。"',bl:550,bsz:2.5,pts:600},
];

// ── Player ship ──
function mkPl(){return{x:W/2,y:H*0.82,w:24,h:28,ft:0,fr:6,pw:0,wl:0,sh:0,inv:0,al:true,tx:null,ty:null};}

// ── Enemy Types (9 types - fighters,UFOs,carrier) ──
// t1:drone t2:scout t3:heavyFighter t4:bomber t5:elite t6:turret t7:parasite t8:UFO t9:carrier
function se(t,x,y,dx,dy){
  if(!x)x=Math.random()*(W-70)+35;
  if(!y)y=-60;
  var sp=2+stage*0.2;
  var e={x:x,y:y,w:22,h:16,hp:1,sp:sp,al:true,hf:0,t:t,an:0,wa:0};
  e.dx=dx||0;e.dy=dy||sp;
  if(t===1){e.hp=1;e.w=22;e.h=16;e.c='#60a0ff';}
  else if(t===2){e.hp=2+Math.floor(stage/3);e.w=26;e.h=20;e.c='#ff6b6b';e.cf=true;e.cd=Math.random()*40+80;}
  else if(t===3){e.hp=3+stage;e.w=32;e.h=24;e.c='#ff8040';e.fa=true;e.cf=true;e.cd=Math.random()*25+60;}
  else if(t===4){e.hp=5+stage*2;e.w=36;e.h=28;e.c='#a040ff';e.cf=true;e.cd=Math.random()*20+50;}
  else if(t===5){e.hp=8+stage*3;e.w=44;e.h=34;e.c='#ff40a0';e.fa=true;e.cf=true;e.cd=Math.random()*15+35;}
  else if(t===6){e.hp=2;e.w=16;e.h=22;e.c='#f0c060';e.bo=true;e.vx=(Math.random()-0.5)*1.5;}
  else if(t===7){e.hp=1+stage;e.w=18;e.h=18;e.c='#60f0a0';e.bo=true;e.fa=true;e.vx=(Math.random()-0.5)*3;}
  else if(t===8){e.hp=3+stage;e.w=24;e.h=20;e.c='#80ff80';e.fa=true;e.cf=true;e.cd=Math.random()*25+50;}
  else if(t===9){e.hp=15+stage*5;e.w=60;e.h=40;e.c='#707080';e.heavy=true;e.sp=sp*0.25;e.cf=true;e.cd=Math.random()*10+20;}
  ems.push(e);
}

// ── Formation spawns (with entry path variations) ──
function spawnLine(ty,count){
  var gap=W/(count+1);
  for(var i=0;i<count;i++)se(ty,gap*(i+1),-(20+i*5));
}
function spawnV(ty,count){
  var cx=W/2;
  for(var i=0;i<count;i++){
    var off=Math.floor(count/2)-i;
    se(ty,cx+off*28,-(25+Math.abs(off)*18));
  }
}
function spawnWedge(ty,count){
  var cx=W/2;
  for(var i=0;i<count;i++){
    var off=Math.floor(count/2)-i;
    var row=Math.abs(off);
    se(ty,cx+off*32,-(20+row*25));
  }
}
function spawnCarrier(ty,count){
  var cx=W/2;
  se(4,cx,-80,0,0);
  for(var i=0;i<count;i++){
    se(ty,cx-40+i*20,-(60+i*5));
  }
}
function spawnSide(ty,count,fromRight){
  var x=fromRight?W+30:-30;
  for(var i=0;i<count;i++)se(ty,x,-(50+i*25),fromRight?-1.5:1.5,0);
}
function spawnDiagonal(ty,count,leftToRight){
  for(var i=0;i<count;i++){
    var x=leftToRight?-(30+i*20):W+30+i*20;
    se(ty,x,-(30+i*30),leftToRight?1.2:-1.2,0);
  }
}
function spawnZigzag(ty,count){
  var gap=W/(count+1);
  for(var i=0;i<count;i++){
    var e=se(ty,gap*(i+1),-(40+i*10));
    ems[ems.length-1].zig=true;
    ems[ems.length-1].zamp=30+Math.random()*40;
    ems[ems.length-1].zfreq=0.015+Math.random()*0.02;
  }
}

// ── Spawn controller (varied enemies + UFOs + carriers) ──
function doSpawn(){
  if(wvC)return;
  spTimer++;
  var rates=[38,30,24,20,16];
  var rate=rates[Math.min(stage-1,4)];
  if(spTimer>=rate){
    spTimer=0;
    var r=Math.random(),fr=Math.random()<0.5;
    if(stage===1){
      if(r<0.35)spawnLine(1,1+Math.floor(Math.random()*2));
      else if(r<0.65)spawnV(1,2);
      else if(r<0.85)spawnDiagonal(1,1+Math.floor(Math.random()*2),fr);
      else if(r<0.96)spawnZigzag(1,2);
      else spawnV(8,1);
    }else if(stage===2){
      if(r<0.25)spawnLine(1,2+Math.floor(Math.random()*2));
      else if(r<0.45)spawnV(2,2+Math.floor(Math.random()*2));
      else if(r<0.65)spawnDiagonal(2,1+Math.floor(Math.random()*2),fr);
      else if(r<0.80)spawnSide(3,2,fr);
      else if(r<0.85)spawnZigzag(6,2+Math.floor(Math.random()*1));
      else spawnV(8,2+Math.floor(Math.random()*2));
    }else if(stage===3){
      if(r<0.2)spawnV(2,2+Math.floor(Math.random()*2));
      else if(r<0.4)spawnWedge(3,2+Math.floor(Math.random()*2));
      else if(r<0.55)spawnDiagonal(3,2+Math.floor(Math.random()*2),fr);
      else if(r<0.7)spawnZigzag(4,2+Math.floor(Math.random()*2));
      else if(r<0.85)spawnSide(6,2,fr);
      else spawnV(8,2+Math.floor(Math.random()*2));
    }else if(stage===4){
      if(r<0.18)spawnWedge(3,2+Math.floor(Math.random()*3));
      else if(r<0.33)spawnV(4,2+Math.floor(Math.random()*2));
      else if(r<0.5)spawnDiagonal(5,2+Math.floor(Math.random()*2),fr);
      else if(r<0.65)spawnSide(6,2,fr);
      else if(r<0.8)spawnZigzag(8,2+Math.floor(Math.random()*2));
      else spawnV(8,2+Math.floor(Math.random()*3));
    }else{
      if(r<0.15)spawnWedge(4,3+Math.floor(Math.random()*2));
      else if(r<0.3)spawnV(5,2+Math.floor(Math.random()*2));
      else if(r<0.45)spawnDiagonal(5,2+Math.floor(Math.random()*2),fr);
      else if(r<0.6)spawnSide(6,2,fr);
      else if(r<0.75)spawnZigzag(8,2+Math.floor(Math.random()*3));
      else if(r<0.85)spawnV(8,2+Math.floor(Math.random()*3));
      else spawnWedge(9,1+Math.floor(Math.random()*1));
    }
  }
  enKilled=Math.floor(score/10);
  if(enKilled>=STG[Math.min(stage-1,4)].pts&&!bossSpawned){wvC=true;bossSpawned=true;}
}

// ── Boss ──
function sB(si){
  var st=STG[Math.min(si-1,4)];
  boss={x:W/2,y:-80,w:Math.round(80*st.bsz),h:Math.round(90*st.bsz),hp:st.bl,al:true,at:0,vx:0,hf:0,
    en:true,c:'#ff4080',n:st.b,ph:0,sz:st.bsz};
}
function uB(){
  if(!boss||!boss.al)return;
  if(boss.en){boss.y+=1.0*SC;if(boss.y>55*SC){boss.en=false;boss.vx=1.5*SC;}return;}
  boss.x+=boss.vx;
  var hw=boss.w*0.4;
  if(boss.x-hw<5||boss.x+hw>W-5)boss.vx*=-1;
  boss.at++;boss.ph++;
  var rate=Math.max(12,90-stage*10);
  if(boss.at>rate){
    boss.at=0;
    var bx=boss.x,by=boss.y+boss.h*0.3;
    var r2=Math.random();
    if(r2<0.3){
      for(var i=-1;i<=1;i++)bls.push({x:bx,y:by,w:8,h:8,vx:i*1.5*SC,vy:3*SC,al:true,en:true,c:'#ff4080'});
    }else if(r2<0.6&&pl){
      var ang=Math.atan2(pl.y-by,pl.x-bx);
      for(var i=-1;i<=1;i++){
        var a2=ang+i*0.3;
        bls.push({x:bx,y:by,w:7,h:7,vx:Math.cos(a2)*2.5*SC,vy:Math.sin(a2)*2.5*SC,al:true,en:true,c:'#ff80c0'});
      }
    }else if(r2<0.85){
      for(var i=0;i<5;i++)bls.push({x:bx+Math.cos(i*1.256)*35*SC,y:by+Math.sin(i*1.256)*35*SC,w:6,h:6,
        vx:Math.cos(i*1.256)*2*SC,vy:Math.sin(i*1.256)*2*SC+1*SC,al:true,en:true,c:'#ff4080'});
    }else{
      for(var i=0;i<8;i++)bls.push({x:boss.x+Math.random()*boss.w-boss.w/2,y:boss.y,w:5,h:5,
        vx:(Math.random()-0.5)*3*SC,vy:Math.random()*3*SC,al:true,en:true,c:'#ff80ff'});
    }
  }
}

// ── Effects ──
function eP(x,y,n,c){for(var i=0;i<n;i++){var a=Math.random()*6.28,sp=Math.random()*3+2;parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,lf:15+Math.random()*20,sz:1+Math.random()*3,c:c,al:true});}}
function eT(x,y){parts.push({x:x,y:y,vx:(Math.random()-0.5)*0.5,vy:Math.random()*0.8+0.3,lf:8,sz:2,c:'#4080ff',al:true});}

// ── Player fire ──
function pF(){
  if(!pl||!pl.al)return;
  var px=pl.x,py=pl.y-14*SC;
  bls.push({x:px,y:py,w:4,h:10,vx:0,vy:-8*SC,al:true,en:false,c:'#80c0ff'});
  if(pl.pw>=1){bls.push({x:px-8*SC,y:py+2*SC,w:4,h:8,vx:0,vy:-7.5*SC,al:true,en:false,c:'#60f0a0'});bls.push({x:px+8*SC,y:py+2*SC,w:4,h:8,vx:0,vy:-7.5*SC,al:true,en:false,c:'#60f0a0'});}
  if(pl.pw>=2){bls.push({x:px-16*SC,y:py+6*SC,w:4,h:7,vx:-0.8*SC,vy:-7*SC,al:true,en:false,c:'#f0c060'});bls.push({x:px+16*SC,y:py+6*SC,w:4,h:7,vx:0.8*SC,vy:-7*SC,al:true,en:false,c:'#f0c060'});}
  if(pl.pw>=3){bls.push({x:px,y:py,w:6,h:12,vx:0,vy:-9*SC,al:true,en:false,c:'#ff80ff'});}
  wings.forEach(function(w){bls.push({x:w.x,y:w.y-8*SC,w:4,h:7,vx:0,vy:-7*SC,al:true,en:false,c:'#60f0a0'});});
}

// ── Ultimate ──
function doU(){
  if(ultR<3)return;ultR=0;ultG=0;SF_ul();
  var t=0;
  (function ua(){t++;
    ems.forEach(function(e){if(e.al){e.hp=0;eP(e.x,e.y,8,e.c);e.al=false;}});
    if(boss&&boss.al&&boss.hp>0){boss.hp-=8;eP(boss.x,boss.y,30,'#ff80ff');SF_bh();}
    if(boss&&boss.hp<=0){boss.al=false;eP(boss.x,boss.y,60,'#ff80ff');SF_ex();}
    dr();
    ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.35)+')';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,100,200,0.25)';
    for(var i=0;i<8;i++)ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*120,3*SC);
    ctx.fillStyle='#ff80ff';ctx.font='bold '+Math.round(24*SC)+'px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#ff80ff';ctx.shadowBlur=40;ctx.fillText('⚡ 天 火 裁 决 ⚡',W/2,H/2);ctx.shadowBlur=0;
    if(t<30)requestAnimationFrame(ua);
    else{
      if(stage>=5&&(!boss||!boss.al)){gs='win';return;}
      if(boss&&!boss.al){SF_bs();
        setTimeout(function(){stage++;
          var si=Math.min(stage-1,4);
          gs='cutscene';csC=0;csDn=false;csT=0;csD=STG[si].bp;},1500);}
    }
  })();
}
function initG(){score=0;lives=3;stage=1;ultG=0;ultR=0;frm=0;ems=[];bls=[];wings=[];parts=[];boss=null;pups=[];pl=mkPl();iS();gs='title';enKilled=0;}
function startS(){ems=[];bls=[];parts=[];boss=null;pups=[];pl=mkPl();iS();gs='playing';stT=3;wvC=false;spTimer=0;bossSpawned=false;enKilled=0;}

// ── Update engine ──
function upd(){
  if(gs!=='playing')return;
  frm++;bg=(bg+1)%H;
  if(stT>0){stT--;stars.forEach(function(s){s.y+=s.s*SC;if(s.y>H){s.y=0;s.x=Math.random()*W;}});dr();return;}
  stars.forEach(function(s){s.y+=s.s*SC;if(s.y>H){s.y=0;s.x=Math.random()*W;}});
  if(pl&&pl.al){
    if(pl.inv>0)pl.inv--;
    if(pl.tx!==null&&pl.ty!==null){var dx=pl.tx-pl.x,dy=pl.ty-pl.y,d=Math.sqrt(dx*dx+dy*dy);if(d>2){pl.x+=dx*0.15;pl.y+=dy*0.15;}else{pl.x=pl.tx;pl.y=pl.ty;}}
    pl.x=Math.max(12,Math.min(W-12,pl.x));pl.y=Math.max(22,Math.min(H-12,pl.y));
    pl.ft++;if(pl.ft>=pl.fr){pF();pl.ft=0;}if(frm%2===0)eT(pl.x,pl.y+14*SC);
  }
  doSpawn();
  ems.forEach(function(e){
    if(!e.al)return;e.an++;
    if(e.bo){e.x+=e.vx*SC;if(e.x<15||e.x>W-15)e.vx*=-1;}
    if(e.fa){e.x+=Math.sin(e.an*0.03)*0.8*SC;}
    if(e.zig){e.x+=Math.sin(e.an*e.zfreq)*e.zamp*SC*0.02;}
    // Diagonal entry: move diagonally first, then straight down
    if(e.dx){e.x+=e.dx*SC;if(e.x>15&&e.x<W-15)e.dx*=0.98;}
    if(e.dy){e.y+=e.dy*SC*0.5;if(e.y>40*SC)e.dy=0;}
    else e.y+=e.sp*SC*0.6;
    if(e.heavy){if(e.y>H*0.15)e.y=H*0.15;e.x+=Math.sin(e.an*0.01)*0.5*SC;}
    if(e.y>H+60||e.x<-80||e.x>W+80)e.al=false;
    if(e.hf>0)e.hf--;
    if(e.cf){e.cd=(e.cd||90);e.cd--;
      if(e.cd<=0&&pl&&pl.al){e.cd=Math.max(30,100-stage*8);
        var dx=pl.x-e.x,dy=pl.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        bls.push({x:e.x,y:e.y+8*SC,w:5,h:5,vx:dx/d*1.5*SC,vy:dy/d*1.5*SC,al:true,en:true,c:e.c});}}
  });
  if(wvC&&!boss&&pl&&pl.al)sB(stage);
  if(boss)uB();
  bls.forEach(function(b){
    if(!b.al)return;b.x+=b.vx;b.y+=b.vy;
    if(b.y<-40||b.y>H+40||b.x<-40||b.x>W+40)b.al=false;
    if(!b.en){
      ems.forEach(function(e){
        if(!e.al||!b.al)return;
        var hw=e.w*0.4,hh=e.h*0.4;
        if(Math.abs(b.x-e.x)<hw+5&&Math.abs(b.y-e.y)<hh+5){
          e.hp--;b.al=false;e.hf=6;eP(b.x,b.y,3,'#80c0ff');
          if(e.hp<=0){e.al=false;score+=10+Math.floor(e.t*5);eP(e.x,e.y,10+Math.floor(e.t/2),e.c);
            if(Math.random()<0.22)pups.push({x:e.x,y:e.y,ty:e.t>=3?(Math.random()<0.3?'P':'L'):['S','L','B','M','P'][Math.floor(Math.random()*5)],vy:1.5*SC,al:true});}
        }
      });
      if(boss&&boss.al){
        var bw=boss.w*0.35,bh=boss.h*0.35;
        if(Math.abs(b.x-boss.x)<bw+8&&Math.abs(b.y-boss.y)<bh+8){
          boss.hp--;b.al=false;boss.hf=10;eP(b.x,b.y,6,'#ff80ff');ultG++;
          if(ultG>=25){ultG=0;if(ultR<3)ultR++;}
          if(boss.hp<=0){boss.al=false;SF_bs();eP(boss.x,boss.y,50,'#ff80ff');score+=500*stage;
            if(stage>=5){setTimeout(function(){gs='win';},2000);return;}
            setTimeout(function(){stage++;gs='cutscene';csC=0;csDn=false;csT=0;csD=STG[Math.min(stage-1,4)].bp;},2000);}
        }
      }
    }
    if(b.en&&pl&&pl.al&&pl.inv<=0&&Math.abs(b.x-pl.x)<12&&Math.abs(b.y-pl.y)<14){
      b.al=false;
      if(wings.length>0){wings.pop();eP(b.x,b.y,8,'#60f0a0');SF_hi();return;}
      if(pl.sh>0){pl.sh--;eP(b.x,b.y,8,'#f0c060');SF_hi();return;}
      pl.inv=60;lives--;SF_ex();eP(pl.x,pl.y,20,'#ff8040');
      if(lives<=0){gs='over';SF_lo();return;}
    }
  });
  ems.forEach(function(e){
    if(!e.al||!pl||!pl.al||pl.inv>0)return;
    var hw=(e.w+pl.w)*0.3,hh=(e.h+pl.h)*0.3;
    if(Math.abs(e.x-pl.x)<hw&&Math.abs(e.y-pl.y)<hh){
      e.al=false;eP(e.x,e.y,12,e.c);
      if(wings.length>0){wings.pop();SF_hi();return;}
      if(pl.sh>0){pl.sh--;SF_hi();return;}
      pl.inv=60;lives--;SF_ex();eP(pl.x,pl.y,20,'#ff8040');
      if(lives<=0){gs='over';SF_lo();return;}
    }
  });
  pups.forEach(function(p){if(!p.al)return;p.y+=p.vy;if(p.y>H+20)p.al=false;if(pl&&pl.al&&Math.abs(p.x-pl.x)<20&&Math.abs(p.y-pl.y)<20){p.al=false;SF_pu();if(p.ty==='S')pl.pw=Math.min(3,pl.pw+1);else if(p.ty==='L')pl.fr=Math.max(2,pl.fr-2);else if(p.ty==='B'){wings.push({x:0,y:0});wings.push({x:0,y:0});wings=wings.slice(0,2);}else if(p.ty==='M')pl.sh=Math.min(4,pl.sh+1);else if(p.ty==='P')score+=100;}});
  wings.forEach(function(w,i){w.x=pl.x+(i===0?-16*SC:16*SC);w.y=pl.y+10*SC;});
  parts=parts.filter(function(p){p.lf--;p.x+=p.vx;p.y+=p.vy;return p.lf>0;});
  bls=bls.filter(function(b){return b.al;});ems=ems.filter(function(e){return e.al;});pups=pups.filter(function(p){return p.al;});
}

// ── Draw: enemy aircraft (fighters, UFOs, carrier) ──
function drEnemy(e){
  if(!e.al)return;
  var x=e.x,y=e.y,s=SC;
  var bc=e.hf>0?'#fff':e.c;
  var bl=e.hf>0?14:5;
  ctx.shadowColor=bc;ctx.shadowBlur=bl;
  if(e.t===1){
    ctx.fillStyle=bc;ctx.beginPath();
    ctx.moveTo(x,y-9*s);ctx.lineTo(x+4*s,y-6*s);ctx.lineTo(x+11*s,y+2*s);
    ctx.lineTo(x+7*s,y+7*s);ctx.lineTo(x+2*s,y+2*s);ctx.lineTo(x-2*s,y+2*s);
    ctx.lineTo(x-7*s,y+7*s);ctx.lineTo(x-11*s,y+2*s);ctx.lineTo(x-4*s,y-6*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.ellipse(x,y-2*s,2.5*s,3*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.3;ctx.beginPath();ctx.arc(x,y-2*s,1*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
  }else if(e.t===2){
    ctx.fillStyle=bc;ctx.beginPath();
    ctx.moveTo(x,y-12*s);ctx.lineTo(x+3*s,y-8*s);
    ctx.lineTo(x+14*s,y+3*s);ctx.lineTo(x+9*s,y+8*s);
    ctx.lineTo(x+3*s,y+3*s);ctx.lineTo(x-3*s,y+3*s);
    ctx.lineTo(x-9*s,y+8*s);ctx.lineTo(x-14*s,y+3*s);
    ctx.lineTo(x-3*s,y-8*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.ellipse(x,y-3*s,4*s,3*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.25;ctx.beginPath();ctx.arc(x,y-3*s,1.2*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
  }else if(e.t===3){
    ctx.fillStyle=bc;ctx.beginPath();
    ctx.moveTo(x,y-14*s);ctx.lineTo(x+5*s,y-9*s);
    ctx.lineTo(x+17*s,y+4*s);ctx.lineTo(x+11*s,y+10*s);
    ctx.lineTo(x+4*s,y+4*s);ctx.lineTo(x-4*s,y+4*s);
    ctx.lineTo(x-11*s,y+10*s);ctx.lineTo(x-17*s,y+4*s);
    ctx.lineTo(x-5*s,y-9*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.ellipse(x,y-5*s,5*s,4*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.2;ctx.beginPath();ctx.arc(x,y-5*s,1.5*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x-1*s,y-14*s,2*s,5*s);
  }else if(e.t===4){
    ctx.fillStyle=bc;ctx.beginPath();
    ctx.moveTo(x,y-16*s);ctx.lineTo(x+5*s,y-8*s);
    ctx.lineTo(x+20*s,y+5*s);ctx.lineTo(x+13*s,y+11*s);
    ctx.lineTo(x+5*s,y+5*s);ctx.lineTo(x-5*s,y+5*s);
    ctx.lineTo(x-13*s,y+11*s);ctx.lineTo(x-20*s,y+5*s);
    ctx.lineTo(x-5*s,y-8*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.ellipse(x,y-6*s,6*s,5*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.25;ctx.beginPath();ctx.arc(x,y-6*s,2*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
  }else if(e.t===5){
    ctx.fillStyle=bc;ctx.beginPath();
    ctx.moveTo(x,y-18*s);ctx.lineTo(x+6*s,y-10*s);
    ctx.lineTo(x+24*s,y+6*s);ctx.lineTo(x+16*s,y+13*s);
    ctx.lineTo(x+5*s,y+6*s);ctx.lineTo(x-5*s,y+6*s);
    ctx.lineTo(x-16*s,y+13*s);ctx.lineTo(x-24*s,y+6*s);
    ctx.lineTo(x-6*s,y-10*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.ellipse(x,y-8*s,7*s,6*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.2;ctx.beginPath();ctx.arc(x,y-8*s,2.5*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(x-1.5*s,y-18*s,3*s,6*s);
  }else if(e.t===6){
    ctx.fillStyle=bc;ctx.beginPath();ctx.arc(x,y,8*s,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.arc(x,y,5*s,0,6.28);ctx.fill();
    ctx.fillStyle='#000';ctx.globalAlpha=0.3;ctx.beginPath();ctx.arc(x,y,2.5*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=bc;ctx.fillRect(x-1.5*s,y-14*s,3*s,8*s);
  }else if(e.t===7){
    ctx.fillStyle=bc;ctx.beginPath();ctx.ellipse(x,y,9*s,5*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.ellipse(x,y-2*s,5*s,3*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(x,y-4*s,2*s,0,6.28);ctx.fill();
  }else if(e.t===8){
    ctx.fillStyle=bc;ctx.beginPath();ctx.ellipse(x,y+2*s,12*s,4*s,0,0,6.28);ctx.fill();
    ctx.fillStyle=bc;ctx.beginPath();ctx.ellipse(x,y-1*s,8*s,5*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(x,y-5*s,4*s,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.arc(x,y-5*s,2*s,0,6.28);ctx.fill();
    for(var i=0;i<4;i++){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.beginPath();ctx.arc(x+Math.cos(i*1.57)*8*s,y+2*s,1.5*s,0,6.28);ctx.fill();}
  }else if(e.t===9){
    ctx.fillStyle=bc;
    ctx.beginPath();ctx.moveTo(x-30*s,y-5*s);ctx.lineTo(x-20*s,y-18*s);ctx.lineTo(x-8*s,y-18*s);
    ctx.lineTo(x,y-22*s);ctx.lineTo(x+8*s,y-18*s);ctx.lineTo(x+20*s,y-18*s);ctx.lineTo(x+30*s,y-5*s);
    ctx.lineTo(x+28*s,y+2*s);ctx.lineTo(x+20*s,y+10*s);ctx.lineTo(x+5*s,y+12*s);
    ctx.lineTo(x-5*s,y+12*s);ctx.lineTo(x-20*s,y+10*s);ctx.lineTo(x-28*s,y+2*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.beginPath();ctx.ellipse(x,y-8*s,15*s,8*s,0,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.beginPath();ctx.rect(x-18*s,y-15*s,36*s,6*s);ctx.fill();
    for(var i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.arc(x-15+i*15*s,y-12*s,2.5*s,0,6.28);ctx.fill();}
    ctx.fillStyle='#000';ctx.globalAlpha=0.3;ctx.beginPath();ctx.arc(x,y+2*s,8*s,0,6.28);ctx.fill();ctx.globalAlpha=1;
  }else{
    ctx.fillStyle=bc;ctx.beginPath();ctx.arc(x,y,e.w/2,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(x,y,e.w/3,0,6.28);ctx.fill();
  }
  ctx.shadowBlur=0;
}

// ── Draw: boss ──
function drBoss(){
  if(!boss||!boss.al)return;
  var x=boss.x,y=boss.y,sz=boss.sz||1;
  var bw=boss.w,bh=boss.h;
  var bc=boss.hf>0?'#fff':boss.c;
  ctx.shadowColor=bc;ctx.shadowBlur=20;
  ctx.fillStyle=bc;
  ctx.beginPath();
  ctx.arc(x,y,bw*0.35,0,6.28);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-bw*0.45,y+bh*0.1);
  ctx.lineTo(x-bw*0.55,y-bh*0.2);ctx.lineTo(x-bw*0.25,y-bh*0.45);
  ctx.lineTo(x,y-bh*0.55);ctx.lineTo(x+bw*0.25,y-bh*0.45);
  ctx.lineTo(x+bw*0.55,y-bh*0.2);ctx.lineTo(x+bw*0.45,y+bh*0.1);
  ctx.closePath();ctx.fill();
  ctx.fillStyle=boss.hf>0?'#ff80ff':'rgba(255,0,100,0.35)';
  ctx.beginPath();ctx.arc(x,y+bh*0.05,bw*0.25,0,6.28);ctx.fill();
  ctx.fillStyle=boss.hf>0?'#ffccff':'rgba(255,64,128,0.5)';
  ctx.beginPath();ctx.arc(x,y+bh*0.05,bw*0.15,0,6.28);ctx.fill();
  ctx.shadowBlur=0;
  var hpW=bw*0.7;
  ctx.fillStyle='rgba(255,255,255,0.1)';
  ctx.fillRect(x-hpW/2,y+bh/2+8*SC,hpW,4*SC);
  var si=Math.min(stage-1,4);
  ctx.fillStyle=boss.hf>0?'#fff':boss.c;
  ctx.fillRect(x-hpW/2,y+bh/2+8*SC,hpW*(boss.hp/STG[si].bl),4*SC);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold '+Math.round(10*SC)+'px monospace';ctx.textAlign='center';
  ctx.fillText(boss.n,x,y+bh/2+20*SC);
}

// ── Draw: player ──
function drPlayer(){
  if(!pl||!pl.al)return;
  var x=pl.x,y=pl.y;
  if(pl.inv>0&&Math.floor(pl.inv/4)%2)return;
  ctx.shadowColor='#80c0ff';ctx.shadowBlur=14;
  ctx.fillStyle='#5070a0';
  ctx.beginPath();ctx.moveTo(x,y-18*SC);ctx.lineTo(x+13*SC,y+10*SC);ctx.lineTo(x+8*SC,y+14*SC);
  ctx.lineTo(x+4*SC,y+8*SC);ctx.lineTo(x-4*SC,y+8*SC);ctx.lineTo(x-8*SC,y+14*SC);
  ctx.lineTo(x-13*SC,y+10*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(130,220,255,0.5)';
  ctx.beginPath();ctx.ellipse(x,y-8*SC,4*SC,5*SC,0,0,6.28);ctx.fill();
  ctx.fillStyle='rgba(60,120,255,'+(0.3+Math.sin(frm*0.2)*0.2)+')';
  ctx.fillRect(x-4*SC,y+12*SC,3*SC,5*SC);ctx.fillRect(x+1*SC,y+12*SC,3*SC,5*SC);
  ctx.shadowBlur=0;
  if(pl.sh>0){
    ctx.strokeStyle='rgba(100,200,255,0.15)';ctx.lineWidth=2*SC;
    ctx.beginPath();ctx.arc(x,y,20*SC,0,6.28);ctx.stroke();
  }
  wings.forEach(function(w){
    ctx.fillStyle='rgba(80,170,120,0.7)';
    ctx.beginPath();ctx.moveTo(w.x,w.y-7*SC);ctx.lineTo(w.x+6*SC,w.y+4*SC);
    ctx.lineTo(w.x-6*SC,w.y+4*SC);ctx.closePath();ctx.fill();
  });
}

// ── Draw: main render ──
function dr(){
  ctx.fillStyle='#080818';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.4;
  for(var i=0;i<H;i+=4*SC){
    var a2=0.015+Math.sin(i*0.01+bg*0.02)*0.01;
    ctx.fillStyle='rgba(40,70,140,'+a2+')';ctx.fillRect(0,i,W,2);
  }
  ctx.globalAlpha=1;
  stars.forEach(function(s){ctx.globalAlpha=s.b;ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,1.5*SC,1.5*SC);ctx.globalAlpha=1;});
  parts.forEach(function(p){ctx.globalAlpha=p.lf/15;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.sz*0.5*SC,0,6.28);ctx.fill();ctx.globalAlpha=1;});
  pups.forEach(function(p){
    var cc='#fff';
    if(p.ty==='S')cc='#f0c060';else if(p.ty==='L')cc='#ff6b6b';
    else if(p.ty==='B')cc='#80c0ff';else if(p.ty==='M')cc='#60f0a0';else if(p.ty==='P')cc='#ff80c0';
    ctx.fillStyle=cc;ctx.shadowColor=cc;ctx.shadowBlur=10;
    ctx.font='bold '+Math.round(12*SC)+'px monospace';ctx.textAlign='center';
    ctx.fillText(p.ty==='P'?'★':p.ty,p.x,p.y+4*SC);
    ctx.shadowBlur=0;
  });
  ems.forEach(function(e){drEnemy(e);});
  if(boss)drBoss();
  bls.forEach(function(b){
    if(!b.al)return;
    ctx.shadowColor=b.c;ctx.shadowBlur=5;ctx.fillStyle=b.c;
    if(b.en){ctx.beginPath();ctx.arc(b.x,b.y,b.w/2,0,6.28);ctx.fill();}
    else ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
    ctx.shadowBlur=0;
  });
  drPlayer();
  ctx.fillStyle='#80c0ff';ctx.font='bold '+Math.round(10*SC)+'px monospace';ctx.textAlign='left';
  ctx.fillText('SCORE:'+score,8,14*SC);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillText('STAGE '+stage,8,28*SC);
  ctx.textAlign='right';
  var ls='';for(var i=0;i<lives;i++)ls+='♥';
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText(ls,W-8,14*SC);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=Math.round(8*SC)+'px monospace';
  ctx.fillText('P'+pl.pw+' S'+pl.sh+' W'+wings.length,W-8,28*SC);
  var ugw=Math.min(W-20,180),ugx=(W-ugw)/2;
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.beginPath();ctx.roundRect(ugx,H-14*SC,ugw,5*SC,2);ctx.fill();
  for(var i=0;i<3;i++){
    ctx.fillStyle=i<ultR?'rgba(255,64,128,0.6)':'rgba(255,255,255,0.04)';
    ctx.beginPath();ctx.roundRect(ugx+i*(ugw/3+1)+1,H-13.5*SC,ugw/3-2,4.5*SC,2);ctx.fill();
  }
  ctx.fillStyle='rgba(255,100,200,0.25)';ctx.font=Math.round(7*SC)+'px monospace';ctx.textAlign='right';
  ctx.fillText('ULT',ugx-4,H-10*SC);
  if(stT>0){
    var al=Math.min(1,stT/1);
    ctx.fillStyle='rgba(255,255,255,'+al+')';ctx.font='bold '+Math.round(18*SC)+'px monospace';ctx.textAlign='center';
    ctx.fillText('STAGE '+stage,W/2,H/3);
    ctx.fillStyle='rgba(128,192,255,'+al+')';ctx.font=Math.round(10*SC)+'px monospace';
    ctx.fillText(STG[Math.min(stage-1,4)].n,W/2,H/3+22*SC);
  }
}

// ── Cutscene ──
function drCS(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.02;for(var i=0;i<20;i++)ctx.fillRect(Math.random()*W,Math.random()*H,1,1);ctx.globalAlpha=1;
  ctx.fillStyle='rgba(100,180,255,0.06)';ctx.font=Math.round(13*SC)+'px monospace';ctx.textAlign='center';
  ctx.fillText('◆ 任 务 简 报 ◆',W/2,35*SC);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font=Math.round(8*SC)+'px monospace';
  ctx.fillText('CLASSIFIED // STAGE '+stage,W/2,52*SC);
  var text=csD.substring(0,csC);
  var lines=text.split('\n');
  ctx.textAlign='left';ctx.font=Math.round(10*SC)+'px monospace';
  var sy=85*SC,lh=17*SC;
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    ctx.fillStyle=l.charAt(0)==='"'?'#f0c060':'#80c0ff';
    ctx.fillText(l,18*SC,sy+i*lh);
  }
  if(csDn){
    if(Math.floor(frm/22)%2){ctx.fillStyle='rgba(255,255,255,0.45)';ctx.textAlign='center';ctx.font=Math.round(11*SC)+'px monospace';ctx.fillText('▼ 触 屏 继 续 ▼',W/2,H-40*SC);}
  }
}

// ── Title ──
function drTitle(){
  ctx.fillStyle='#050510';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.03;for(var i=0;i<30;i++)ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*60,1);ctx.globalAlpha=1;
  ctx.textAlign='center';
  ctx.shadowColor='#4080ff';ctx.shadowBlur=30;
  ctx.fillStyle='#80c0ff';ctx.font='bold '+Math.round(26*SC)+'px monospace';
  ctx.fillText('星 际 防 线',W/2,H*0.26);ctx.shadowBlur=0;
  ctx.fillStyle='#f0c060';ctx.font=Math.round(9*SC)+'px monospace';
  ctx.fillText('STARFIRE DEFENSE',W/2,H*0.26+28*SC);
  var sx=W/2,sy=H*0.5;
  ctx.fillStyle='rgba(100,150,200,0.06)';
  ctx.beginPath();ctx.moveTo(sx,sy-28*SC);ctx.lineTo(sx+18*SC,sy+12*SC);
  ctx.lineTo(sx+12*SC,sy+20*SC);ctx.lineTo(sx+6*SC,sy+12*SC);
  ctx.lineTo(sx-6*SC,sy+12*SC);ctx.lineTo(sx-12*SC,sy+20*SC);
  ctx.lineTo(sx-18*SC,sy+12*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(100,150,200,0.04)';
  ctx.beginPath();ctx.moveTo(sx,sy-32*SC);ctx.lineTo(sx+10*SC,sy-2*SC);ctx.lineTo(sx-10*SC,sy-2*SC);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=Math.round(8*SC)+'px monospace';
  ctx.fillText('JAX-20 星际战机',W/2,H*0.5+35*SC);
  if(Math.floor(frm/30)%2){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(12*SC)+'px monospace';ctx.fillText('触 屏 开 始',W/2,H*0.74);}
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font=Math.round(7*SC)+'px monospace';
  ctx.fillText('5关 僚机 火力升级 天火裁决',W/2,H*0.86);
}

// ── Game Over ──
function drOver(){
  ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
  ctx.fillStyle='#ff6b6b';ctx.font='bold '+Math.round(22*SC)+'px monospace';
  ctx.fillText('GAME OVER',W/2,H*0.32);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(13*SC)+'px monospace';
  ctx.fillText('得分: '+score,W/2,H*0.44);ctx.fillText('到达: 第'+stage+'关',W/2,H*0.52);
  if(Math.floor(frm/20)%2){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=Math.round(11*SC)+'px monospace';ctx.fillText('触屏重新开始',W/2,H*0.66);}
}

// ── Victory ──
function drWin(){
  ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
  for(var i=0;i<20;i++){ctx.fillStyle='rgba(255,200,100,'+(Math.random()*0.06)+')';ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*40,1);}
  ctx.textAlign='center';
  ctx.shadowColor='#f0c060';ctx.shadowBlur=35;
  ctx.fillStyle='#f0c060';ctx.font='bold '+Math.round(24*SC)+'px monospace';
  ctx.fillText('任 务 完 成',W/2,H*0.28);ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=Math.round(13*SC)+'px monospace';
  ctx.fillText('地球得救了。',W/2,H*0.40);
  ctx.fillStyle='#f0c060';ctx.font='bold '+Math.round(15*SC)+'px monospace';
  ctx.fillText('FINAL SCORE: '+score,W/2,H*0.52);
  if(Math.floor(frm/20)%2){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=Math.round(11*SC)+'px monospace';ctx.fillText('触屏再来一次',W/2,H*0.66);}
}

// ── Touch input ──
var tID=null;
C.addEventListener('touchstart',function(e){e.preventDefault();ai();
  var t=e.changedTouches[0];tID=t.identifier;
  ht(t.clientX,t.clientY);
  if(gs==='playing'&&pl&&pl.al){var r=C.getBoundingClientRect();pl.tx=(t.clientX-r.left)*W/r.width;pl.ty=(t.clientY-r.top)*H/r.height;}
},{passive:false});
C.addEventListener('touchmove',function(e){e.preventDefault();
  for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];
    if(t.identifier===tID&&pl&&pl.al&&gs==='playing'){
      var r=C.getBoundingClientRect();
      pl.tx=(t.clientX-r.left)*W/r.width;pl.ty=(t.clientY-r.top)*H/r.height;}}
},{passive:false});
C.addEventListener('click',function(e){ai();ht(e.clientX,e.clientY);});

function ht(cx,cy){
  ai();
  if(gs==='title'){gs='cutscene';csC=0;csDn=false;csT=0;frm=0;csD=STG[0].bp;return;}
  if(gs==='cutscene'&&csDn){startS();return;}
  if(gs==='over'||gs==='win'){stage=1;initG();gs='title';return;}
  if(gs==='playing'&&ultR>=3){doU();}
}

// ── Main loop ──
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
