
// ── Audio engine ──
var ac=null;
function ai(){if(!ac||ac.state==='closed'){ac=new(window.AudioContext||window.webkitAudioContext)();}
  if(ac.state==='suspended')ac.resume();}
function pt(f,d,t,v,dl){
  try{ai();if(!ac)return;
    var o=ac.createOscillator(),g=ac.createGain();
    var t0=(dl||0)+ac.currentTime;
    o.type=t||'sine';
    o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(v||0.06,t0);
    g.gain.exponentialRampToValueAtTime(0.001,t0+Math.max(d,0.03));
    o.connect(g);g.connect(ac.destination);
    o.start(t0);o.stop(t0+Math.max(d,0.05));
  }catch(e){}}

var sndLastBump=0;
function sndDrop(type){ai();pt(220+(type+1)*40,0.12,'sine',0.05);}
function sndMerge(type){ai();var b=330+type*60;pt(b,0.15,'sine',0.08);pt(b*1.25,0.12,'sine',0.06,0.06);pt(b*1.5,0.15,'sine',0.08,0.12);}
function sndBump(f){if(Date.now()-sndLastBump<100)return;sndLastBump=Date.now();pt(80+f*30,0.06,'square',Math.min(0.04,f*0.01));}
function sndGameOver(){pt(200,0.3,'sawtooth',0.1);pt(150,0.3,'sawtooth',0.08,0.2);pt(80,0.5,'sawtooth',0.06,0.4);}
function sndNewBest(){var n=[523,659,784,1047,1319];for(var i=0;i<5;i++)pt(n[i],0.18,'sine',0.08,i*0.12);}
function sndExplode(){ai();for(var i=0;i<6;i++)pt(40+i*20,0.25,'sawtooth',0.06,i*0.05);pt(600,0.4,'square',0.15,0.1);pt(300,0.3,'square',0.1,0.2);}
function sndDurian(){pt(90,0.2,'square',0.08,0);pt(110,0.2,'square',0.06,0.15);pt(70,0.3,'square',0.05,0.3);}

// ── Leaderboard ──
var LB_KEY='wm_leaderboard';
function loadLB(){try{return JSON.parse(localStorage.getItem(LB_KEY)||'[]');}catch(e){return[];}}
function saveLB(arr){localStorage.setItem(LB_KEY,JSON.stringify(arr.slice(0,8)));}
function addScore(s){var lb=loadLB();lb.push({s:s,t:Date.now()});lb.sort(function(a,b){return b.s-a.s;});lb=lb.slice(0,8);saveLB(lb);return lb;}
function renderLB(lb,hs){var el=document.getElementById('leaderboard');var h='<div class="lb-title">🏆 排行榜</div>';var rk=['🥇','🥈','🥉','4','5','6','7','8'];for(var i=0;i<lb.length;i++){var c=lb[i].s===hs?'lb-row highlight':'lb-row';h+='<div class="'+c+'"><span class="lb-rank">'+rk[i]+'</span><span class="lb-score">'+lb[i].s+'</span></div>';}el.innerHTML=h;}

// ── Game engine ──
const canvas=document.getElementById('gc'),ctx=canvas.getContext('2d');
const wrap=document.getElementById('gameWrap');
const scoreEl=document.getElementById('score'),nextEl=document.getElementById('nextFruit');
const overlay=document.getElementById('overlay'),finalScore=document.getElementById('finalScore');
const restartBtn=document.getElementById('restartBtn');

var CW,CH,score=0,gs='playing',newBest=false;
var bodies=[],curBody=null,nextType=0,dragX=0,dropReady=false,lastDrop=0;
var countdowns=[]; // {body,text,timeLeft,x,y} for floating countdown text

// Type 4=lemon, type 10=watermelon, type 11=durian
const FRUITS=[
  {r:14,emoji:'🍒',color:'#dc2626',score:1,name:'cherry'},
  {r:20,emoji:'🍓',color:'#e11d48',score:3,name:'strawberry'},
  {r:26,emoji:'🍇',color:'#7c3aed',score:6,name:'grape'},
  {r:32,emoji:'🍊',color:'#f97316',score:10,name:'orange'},
  {r:37,emoji:'🍋',color:'#eab308',score:15,name:'lemon'},
  {r:43,emoji:'🍎',color:'#ef4444',score:21,name:'apple'},
  {r:49,emoji:'🍐',color:'#84cc16',score:28,name:'pear'},
  {r:56,emoji:'🍑',color:'#f97316',score:36,name:'peach'},
  {r:64,emoji:'🍍',color:'#eab308',score:45,name:'pineapple'},
  {r:76,emoji:'🍈',color:'#22c55e',score:55,name:'melon'},
  {r:90,emoji:'🍉',color:'#16a34a',score:70,name:'watermelon'},
  {r:40,emoji:'💣',color:'#8b5cf6',score:0,name:'durian'},
];
var LEMON=4, WATERMELON=10, DURIAN=11;

function resize(){
  var w=Math.min(wrap.clientWidth-4,420);
  CW=w;CH=Math.round(w/0.55);
  canvas.width=CW;canvas.height=CH;
}
resize();window.addEventListener('resize',resize);

function lerp(a,b,t){return a+(b-a)*t;}

function createBody(type,x,y,vx,vy,opts){
  opts=opts||{};
  var f=FRUITS[type],sc=CW/420;
  var b={x:x,y:y,r:f.r*sc,type:type,vy:vy||0,vx:vx||0,
    active:true,merged:false,justSpawned:true,damp:0.98,restitution:0.3,groundCount:0,
    spawnTime:Date.now(),explodeAt:0,isExploding:false};
  if(type===WATERMELON){
    b.explodeAt=Date.now()+9000;
  }
  bodies.push(b);return b;
}

function spawnDrop(){
  if(gs!=='playing')return;
  if(nextType===undefined||nextType===DURIAN)nextType=Math.floor(Math.random()*5);
  curBody=createBody(nextType,CW/2,-60,0,4);
  curBody.isHeld=true;curBody.vy=0;curBody.justSpawned=false;
  dragX=CW/2;dropReady=true;
  var maxT=Math.min(4+Math.floor(score/50),10);
  nextType=Math.floor(Math.random()*maxT);
  nextEl.textContent=FRUITS[nextType].emoji;
  sndDrop(curBody.type);
}

function dropBody(){
  if(!curBody||!dropReady)return;
  if(Date.now()-lastDrop<400)return;
  lastDrop=Date.now();
  curBody.isHeld=false;curBody.vy=5;
  dropReady=false;
  setTimeout(spawnDrop,600);
}

// ── Explosion ──
function explodeWatermelon(wm){
  if(wm.isExploding||!wm.active)return;
  wm.isExploding=true;wm.active=false;
  try{sndExplode();}catch(e){}
  var blastR=wm.r*1.6; // only touching fruits
  // Explosion particles
  for(var i=0;i<20;i++){
    var ang=Math.random()*Math.PI*2,sp=2+Math.random()*4;
    parts.push({x:wm.x,y:wm.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:15+Math.random()*15,r:2+Math.random()*4,c:'#f97316'});
  }
  // Destroy only touching fruits (not overlapping, just tangent)
  for(var i=0;i<bodies.length;i++){
    var b=bodies[i];
    if(!b.active||b===wm||b.isHeld)continue;
    var dx=b.x-wm.x,dy=b.y-wm.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=wm.r+b.r+2){
      b.active=false;
      for(var j=0;j<4;j++){
        var a2=Math.random()*Math.PI*2,s2=1+Math.random()*2;
        parts.push({x:b.x,y:b.y,vx:Math.cos(a2)*s2,vy:Math.sin(a2)*s2,life:8+Math.random()*10,r:2+Math.random()*3,c:FRUITS[b.type].color});
      }
      score+=FRUITS[b.type].score;
    }
  }
  score+=50;
  updateScore();
}

// ── Durian infection ──
function infectNearby(durian){
  if(!durian.active||durian.isHeld||durian.merged)return;
  for(var i=0;i<bodies.length;i++){
    var b=bodies[i];
    if(!b.active||b===durian||b.type===DURIAN||b.isHeld||b.merged)continue;
    var dx=b.x-durian.x,dy=b.y-durian.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<durian.r+b.r+4){
      // Infect this fruit to durian
      b.type=DURIAN;b.merged=false;
      var f2=FRUITS[DURIAN];var sc=CW/420;
      b.r=(b.r+f2.r*sc)/2; // transition size
      b.durianAt=Date.now();
      b.spawnTime=b.durianAt; // reset spawn time so it won't immediately re-infect
      // Regrow to full durian size over 300ms
      b.targetR=f2.r*sc;
      b.growStart=b.r;
      b.growEnd=f2.r*sc;
      b.growT=0;
      // Particles
      for(var j=0;j<6;j++){
        var a2=Math.random()*Math.PI*2,s2=1+Math.random()*2;
        parts.push({x:b.x,y:b.y,vx:Math.cos(a2)*s2,vy:Math.sin(a2)*s2,life:10+Math.random()*10,r:2+Math.random()*3,c:'#8b5cf6'});
      }
      sndDurian();
    }
  }
}

// ── Physics ──
function step(dt){
  dt=dt||16;
  if(gs!=='playing')return;
  var now=Date.now();

  // Tick lemon timers and durian mutation
  for(var j=0;j<bodies.length;j++){
    var b=bodies[j];
    if(!b.active||b.isHeld||b.justSpawned)continue;

    // Lemon -> durian after 30 seconds
    if(b.type===LEMON&&!b.merged&&now-b.spawnTime>30000&&!b.mutated){
      b.type=DURIAN;b.mutated=true;
      var f2=FRUITS[DURIAN];var sc=CW/420;
      b.r=f2.r*sc;
      b.spawnTime=now; // reset for infection timing
      b.durianAt=now;
      // Mutation particles
      for(var k=0;k<10;k++){
        var a2=Math.random()*Math.PI*2,s2=2+Math.random()*3;
        parts.push({x:b.x,y:b.y,vx:Math.cos(a2)*s2,vy:Math.sin(a2)*s2,life:15+Math.random()*15,r:2+Math.random()*4,c:'#8b5cf6'});
      }
      sndDurian();
    }

    // Durian infection pulse every 30s
    if(b.type===DURIAN&&b.durianAt&&now-b.durianAt>30000){
      infectNearby(b);
      b.durianAt=now;
    }
  }

  // Grow durian sizes smoothly
  for(var j=0;j<bodies.length;j++){
    var b=bodies[j];
    if(b.growEnd&&b.growT<1){
      b.growT+=dt/300;
      if(b.growT>=1){b.r=b.growEnd;b.growEnd=null;}
      else b.r=b.growStart+(b.growEnd-b.growStart)*b.growT;
    }
  }

  // Collect bodies to explode BEFORE physics
  var toExplode=[];
  for(var j=0;j<bodies.length;j++){
    var b=bodies[j];
    if(b.active&&!b.isHeld&&b.type===WATERMELON&&b.explodeAt>0&&now>=b.explodeAt&&!b.isExploding){
      toExplode.push(b);
    }
  }

  // Physics: 2 sub-steps
  var newBodies=[];
  for(var i=0;i<2;i++){
    // Movement
    for(var j=0;j<bodies.length;j++){
      var b=bodies[j];if(!b.active)continue;
      if(b.isHeld){b.x=lerp(b.x,dragX,0.25);b.y=-50;continue;}
      b.vy+=0.55;b.x+=b.vx;b.y+=b.vy;
      if(b.x-b.r<0){b.x=b.r;b.vx*= -0.3;}
      if(b.x+b.r>CW){b.x=CW-b.r;b.vx*= -0.3;}
      if(b.y+b.r>CH){b.y=CH-b.r;b.vy*= -0.15;b.vx*=0.9;b.groundCount++;try{sndBump(0.4);}catch(e){};}
      if(b.y-b.r<0&&!b.isHeld){b.y=b.r;b.vy=Math.abs(b.vy)*0.2;}
      b.vx*=b.damp;b.vy*=b.damp;
      if(i===1)b.justSpawned=false;
      // Game over check (only after sub-step 2)
      if(i===1&&!b.merged&&!b.justSpawned&&b.groundCount>3&&b.y<CH*0.12){endGame();return;}
    }
    // Collision detection (fixed bounds, no re-entry for new bodies)
    var blen=bodies.length;
    for(var j=0;j<blen;j++){
      for(var k=j+1;k<blen;k++){
        var a=bodies[j],b2=bodies[k];
        if(!a.active||!b2.active||a.isHeld||b2.isHeld)continue;
        var dx=b2.x-a.x,dy=b2.y-a.y,dist=Math.sqrt(dx*dx+dy*dy);
        var minDist=a.r+b2.r;
        if(dist<minDist&&dist>0){
          var overlap=minDist-dist,nx=dx/dist,ny=dy/dist;
          a.x-=nx*overlap*0.5;a.y-=ny*overlap*0.5;
          b2.x+=nx*overlap*0.5;b2.y+=ny*overlap*0.5;
          var relVn=(b2.vx-a.vx)*nx+(b2.vy-a.vy)*ny;
          if(relVn<0){var imp=relVn*0.7;a.vx+=imp*nx*0.5;a.vy+=imp*ny*0.5;b2.vx-=imp*nx*0.5;b2.vy-=imp*ny*0.5;}
          if(a.type===b2.type&&!a.merged&&!b2.merged&&a.type!==DURIAN&&a.type<WATERMELON){
            a.merged=true;b2.merged=true;a.active=false;b2.active=false;
            var nt=a.type+1,mx=(a.x+b2.x)/2,my=(a.y+b2.y)/2;
            var nb=createBody(nt,mx,my,0,-2);
            nb.justSpawned=true;
            nb.spawnTime=Date.now();
            newBodies.push(nb);
            score+=FRUITS[nt].score;updateScore();
            spawnParts(mx,my,FRUITS[nt].color);
            try{sndMerge(nt);}catch(e){}
          }
        }
      }
    }
  }
  // Merge new bodies from this frame
  for(var ni=0;ni<newBodies.length;ni++)bodies.push(newBodies[ni]);

  bodies=bodies.filter(function(b){return b.active;});

  // Process explosions AFTER physics
  for(var ei=0;ei<toExplode.length;ei++){
    var wb=toExplode[ei];
    var stillThere=false;
    for(var bi=0;bi<bodies.length;bi++){if(bodies[bi]===wb){stillThere=true;break;}}
    if(stillThere&&wb.active&&!wb.isExploding)explodeWatermelon(wb);
  }
  bodies=bodies.filter(function(b){return b.active;});

  // Update countdown positions
  countdowns=[];
  for(var j=0;j<bodies.length;j++){
    var b=bodies[j];
    if(!b.active||b.isHeld)continue;
    if(b.type===WATERMELON&&b.explodeAt>0&&!b.isExploding){
      var tl=Math.max(0,Math.ceil((b.explodeAt-now)/1000));
      countdowns.push({body:b,text:tl,x:b.x,y:b.y-r-8});
    }
  }
}

var parts=[];
function spawnParts(x,y,color){
  for(var i=0;i<10;i++){
    var a=Math.random()*Math.PI*2,sp=Math.random()*4+2;
    parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:18+Math.random()*12,r:2+Math.random()*3,c:color});
  }
}

function updateScore(){scoreEl.textContent=score;}

function endGame(){
  gs='over';finalScore.textContent=score;sndGameOver();
  var lb=addScore(score);renderLB(lb,score);
  if(score>=lb[0].s){newBest=true;sndNewBest();}
  overlay.classList.add('show');
}

function restart(){
  bodies=[];parts=[];countdowns=[];score=0;gs='playing';newBest=false;
  curBody=null;dropReady=false;nextType=Math.floor(Math.random()*5);
  nextEl.textContent=FRUITS[nextType].emoji;
  updateScore();overlay.classList.remove('show');
  renderLB(loadLB(),-1);
  spawnDrop();
}

// ── Render ──
function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,CW,CH);
  ctx.strokeStyle='rgba(255,255,255,0.015)';ctx.lineWidth=0.5;
  for(var i=0;i<CW;i+=30){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,CH);ctx.stroke();}
  for(var i=0;i<CH;i+=30){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(CW,i);ctx.stroke();}
  var dlY=CH*0.15;
  ctx.fillStyle='rgba(239,68,68,0.03)';ctx.fillRect(0,0,CW,dlY);
  ctx.strokeStyle='rgba(239,68,68,0.18)';ctx.lineWidth=1;
  ctx.setLineDash([6,10]);ctx.beginPath();ctx.moveTo(0,dlY);ctx.lineTo(CW,dlY);ctx.stroke();ctx.setLineDash([]);

  for(var i=0;i<bodies.length;i++){
    var b=bodies[i];if(!b.active)continue;
    var f=FRUITS[b.type],r=b.r;

    // Durian glow
    if(b.type===DURIAN){
      var pulse=0.5+0.5*Math.sin(Date.now()*0.005);
      ctx.fillStyle='rgba(139,92,246,'+(0.1+pulse*0.15)+')';
      ctx.beginPath();ctx.arc(b.x,b.y,r+4,0,Math.PI*2);ctx.fill();
    }

    // Watermelon shake when about to explode
    var sx=0,sy=0;
    if(b.type===WATERMELON&&b.explodeAt>0&&!b.isExploding&&b.explodeAt-Date.now()<1000){
      sx=(Math.random()-0.5)*3;sy=(Math.random()-0.5)*3;
    }

    ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.arc(b.x+sx+2,b.y+sy+2,r,0,Math.PI*2);ctx.fill();
    var grad=ctx.createRadialGradient(b.x+sx-r*0.3,b.y+sy-r*0.3,r*0.1,b.x+sx,b.y+sy,r);
    grad.addColorStop(0,'rgba(255,255,255,0.25)');
    grad.addColorStop(0.5,f.color);grad.addColorStop(1,'rgba(0,0,0,0.2)');
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(b.x+sx,b.y+sy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=b.type===DURIAN?'rgba(139,92,246,0.5)':'rgba(255,255,255,0.12)';
    ctx.lineWidth=b.type===DURIAN?2:1.2;
    ctx.beginPath();ctx.arc(b.x+sx,b.y+sy,r,0,Math.PI*2);ctx.stroke();

    // Emoji
    var fs=Math.round(r*1.2);
    ctx.font='bold '+fs+'px -apple-system,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    ctx.shadowColor='rgba(0,0,0,0.4)';ctx.shadowBlur=b.type===DURIAN?6:2;
    ctx.fillText(f.emoji,b.x+sx,b.y+sy+1);ctx.shadowBlur=0;

    // Lemon timer indicator (small dot under it)
    if(b.type===LEMON&&!b.merged&&!b.mutated){
      var age=Date.now()-b.spawnTime;
      var pct=Math.min(1,age/30000);
      var dotR=3;
      ctx.fillStyle='rgba(255,255,255,0.3)';
      ctx.beginPath();ctx.arc(b.x,b.y+r-dotR-1,dotR*(1-pct),0,Math.PI*2);ctx.fill();
    }
  }

  // Held fruit
  if(curBody&&curBody.isHeld&&dropReady){
    var f=FRUITS[curBody.type],r=curBody.r,x=curBody.x,y=curBody.y;
    if(y<r)y=r;y=Math.max(-20,y);
    ctx.globalAlpha=0.85;
    var g2=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
    g2.addColorStop(0,'rgba(255,255,255,0.3)');g2.addColorStop(0.5,f.color);g2.addColorStop(1,'rgba(0,0,0,0.2)');
    ctx.fillStyle=g2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
    ctx.font='bold '+Math.round(r*1.2)+'px -apple-system,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    ctx.shadowColor='rgba(0,0,0,0.4)';ctx.shadowBlur=3;ctx.fillText(f.emoji,x,y+1);ctx.shadowBlur=0;
    ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=0.5;
    ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();ctx.setLineDash([]);
  }

  // Countdown text on watermelons
  for(var i=0;i<countdowns.length;i++){
    var cd=countdowns[i];
    var urgency=cd.text<=1;
    ctx.font='bold '+(urgency?16:13)+'px -apple-system,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillStyle=urgency?'#ef4444':'#fff';
    ctx.shadowColor=urgency?'rgba(239,68,68,0.8)':'rgba(0,0,0,0.6)';
    ctx.shadowBlur=4;
    ctx.fillText(cd.text,cd.x,cd.y);
    ctx.shadowBlur=0;
  }

  // Particles
  for(var i=0;i<parts.length;i++){
    var p=parts[i];ctx.globalAlpha=p.life/30;ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  parts=parts.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;return p.life>0;});
}

// ── Input ──
canvas.addEventListener('touchstart',function(e){
  e.preventDefault();ai();
  if(gs!=='playing'){restart();return;}
  var t=e.touches[0],r=canvas.getBoundingClientRect();
  dragX=(t.clientX-r.left)/r.width*CW;
  if(!dropReady)spawnDrop();
},{passive:false});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();if(!dropReady||!curBody)return;
  var t=e.touches[0],r=canvas.getBoundingClientRect();
  dragX=(t.clientX-r.left)/r.width*CW;
},{passive:false});
canvas.addEventListener('touchend',function(e){e.preventDefault();dropBody();},{passive:false});
canvas.addEventListener('mousedown',function(e){
  ai();if(gs!=='playing'){restart();return;}
  var r=canvas.getBoundingClientRect();dragX=(e.clientX-r.left)/r.width*CW;
  if(!dropReady)spawnDrop();
});
canvas.addEventListener('mousemove',function(e){
  if(!dropReady||!curBody)return;
  var r=canvas.getBoundingClientRect();dragX=(e.clientX-r.left)/r.width*CW;
});
canvas.addEventListener('mouseup',function(e){dropBody();});
restartBtn.addEventListener('click',function(e){e.stopPropagation();restart();});

// ── Init ──
renderLB(loadLB(),-1);
spawnDrop();
var lastTime=0;
function loop(t){
  try{
    var dt=t-lastTime;lastTime=t;
    step(dt);draw();
  }catch(e){console.log('game loop error:',e);}
  requestAnimationFrame(loop);
}
requestAnimationFrame(function(t){lastTime=t;loop(t);});
