"use strict";

const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("highScore");
  const ballsEl = document.getElementById("balls");
  const comboEl = document.getElementById("combo");
  const feverFill = document.getElementById("feverFill");
  const feverText = document.getElementById("feverText");
  const feverCard = document.getElementById("feverCard");
  const missionText = document.getElementById("missionText");
  const missionFill = document.getElementById("missionFill");
  const launchStat = document.getElementById("launchStat");
  const startStat = document.getElementById("startStat");
  const jackpotStat = document.getElementById("jackpotStat");
  const toastEl = document.getElementById("toast");
  const powerFill = document.getElementById("powerFill");
  const powerText = document.getElementById("powerText");
  const launchBtn = document.getElementById("launchBtn");
  const autoBtn = document.getElementById("autoBtn");
  const soundBtn = document.getElementById("soundBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const difficultySelect = document.getElementById("difficultySelect");
  const addBtn = document.getElementById("addBtn");
  const resetBtn = document.getElementById("resetBtn");

  const W = 900, H = 1200;
  const BALL_R = 9.5;
  const FIXED_DT = 1 / 120;
  let gravity = 1010;
  const MAX_BALLS_ON_BOARD = 9;

  let score = 0;
  let ballsLeft = 30;
  let bestCombo = 0;
  let activeCombo = 0;
  let charging = false;
  let charge = 0;
  let chargeDirection = 1;
  let lastTime = performance.now();
  let accumulator = 0;
  let muted = false;
  let shake = 0;
  let jackpotFlash = 0;
  let lampPhase = 0;

  const STORAGE_KEY = "spark-pachinko-v5";
  const difficulties = {
    casual:{gravity:930, slotBoost:1.28, crankBoost:1.10, feverGain:1.25, prize:0.85},
    classic:{gravity:1010, slotBoost:1.00, crankBoost:1.00, feverGain:1.00, prize:1.00},
    extreme:{gravity:1090, slotBoost:0.82, crankBoost:0.90, feverGain:0.82, prize:1.45}
  };
  let difficulty="classic";
  let highScore=0;
  let autoFire=false;
  let autoTimer=.4;
  let toastTimer=0;
  const fever={value:0,active:false,timer:0,duration:12};
  const lifetime={launches:0,starts:0,jackpots:0};
  const achievements=new Set();
  const missions=[
    {name:"啟動 START 3 次",kind:"starts",target:3,reward:500,balls:5},
    {name:"發射 25 顆彈珠",kind:"launches",target:25,reward:350,balls:4},
    {name:"單局累積 3000 分",kind:"score",target:3000,reward:800,balls:6},
    {name:"取得 1 次最終 JACKPOT",kind:"jackpots",target:1,reward:1500,balls:10}
  ];
  let missionIndex=0;
  let missionBase={launches:0,starts:0,jackpots:0,score:0};

  const slotSymbols = [
    {text:"🍒", name:"CHERRY"},
    {text:"🔔", name:"BELL"},
    {text:"BAR", name:"BAR"},
    {text:"7", name:"SEVEN"},
    {text:"★", name:"STAR"},
    {text:"💎", name:"DIAMOND"}
  ];

  const feature = {
    mode:"idle",
    cooldown:0,
    transition:0,
    tier:"NONE"
  };

  const slot = {
    spinning:false,
    evaluated:false,
    elapsed:0,
    qualified:false,
    tier:"NONE",
    message:"HIT START",
    result:[0,1,4],
    reels:[
      {pos:0,speed:16,stopped:true},
      {pos:1,speed:19,stopped:true},
      {pos:4,speed:22,stopped:true}
    ]
  };

  const crank = {
    running:false,
    stage:0,
    timer:0,
    message:"WAITING",
    outcome:[false,false,false],
    passChance:[0.67,0.48,0.28],
    finalPrize:3000,
    extraBalls:15,
    tier:"STANDARD",
    targetHole:[1,2,3],
    stages:[
      {diskAngle:0.2, speed:1.70, ballAngle:2.4, orbit:74, resolved:false},
      {diskAngle:1.0, speed:-1.42, ballAngle:4.7, orbit:82, resolved:false},
      {diskAngle:2.1, speed:1.18, ballAngle:1.2, orbit:90, resolved:false}
    ]
  };

  const balls = [];
  const pins = [];
  const bumpers = [];
  const segments = [];
  const particles = [];
  const pockets = [
    {x0:85,  x1:205, value:10,  label:"10"},
    {x0:205, x1:325, value:30,  label:"30"},
    {x0:325, x1:445, value:100, label:"100"},
    {x0:445, x1:565, value:0,   label:"START", slot:true},
    {x0:565, x1:685, value:50,  label:"50"},
    {x0:685, x1:765, value:20,  label:"20"}
  ];

  function safeLoad(){
    try{
      const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
      highScore=Number(data.highScore)||0;
      difficulty=difficulties[data.difficulty]?data.difficulty:"classic";
      difficultySelect.value=difficulty;
      Object.assign(lifetime,data.lifetime||{});
      (data.achievements||[]).forEach(id=>achievements.add(id));
      missionIndex=Math.max(0,Math.min(missions.length-1,Number(data.missionIndex)||0));
      missionBase=Object.assign(missionBase,data.missionBase||{});
      muted=Boolean(data.muted);
      applyDifficulty();
    }catch(_){ applyDifficulty(); }
  }

  function saveProgress(){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({
        highScore,difficulty,lifetime,achievements:[...achievements],missionIndex,missionBase,muted
      }));
    }catch(_){}
  }

  function applyDifficulty(){
    gravity=difficulties[difficulty].gravity;
  }

  function showToast(message){
    toastEl.textContent=message;
    toastEl.classList.add("show");
    toastTimer=2.7;
  }

  function unlock(id,label){
    if(achievements.has(id))return;
    achievements.add(id);
    showToast(`🏆 成就解鎖：${label}`);
    saveProgress();
  }

  function addFever(amount){
    if(fever.active)return;
    fever.value=Math.min(100,fever.value+amount*difficulties[difficulty].feverGain);
    if(fever.value>=100){
      fever.active=true;
      fever.timer=fever.duration;
      fever.value=100;
      unlock("first-fever","第一次進入 FEVER");
      showToast("🔥 FEVER！12 秒內每次發射變成三球");
      burst(425,850,"#ff4b97",70);
      sound(980,.3,.07,"square");
    }
  }

  function missionProgress(){
    const m=missions[missionIndex];
    if(m.kind==="score")return Math.max(0,score-missionBase.score);
    return Math.max(0,lifetime[m.kind]-missionBase[m.kind]);
  }

  function checkMission(){
    const m=missions[missionIndex];
    const progress=missionProgress();
    if(progress<m.target)return;
    score+=Math.round(m.reward*difficulties[difficulty].prize);
    ballsLeft+=m.balls;
    showToast(`✅ 任務完成：+${Math.round(m.reward*difficulties[difficulty].prize)} 分、+${m.balls} 顆`);
    missionIndex=(missionIndex+1)%missions.length;
    missionBase={launches:lifetime.launches,starts:lifetime.starts,jackpots:lifetime.jackpots,score};
    saveProgress();
    updateHUD();
  }

  function enhancedCrank(base){
    const boost=difficulties[difficulty].crankBoost*(fever.active?1.08:1);
    return base.map(v=>Math.min(.97,v*boost));
  }

  let audioCtx = null;
  function sound(freq=520, duration=.035, volume=.025, type="sine") {
    if (muted) return;
    try {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(volume, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
      o.connect(g).connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function addSegment(x1,y1,x2,y2,restitution=.72,kind="wall"){
    segments.push({x1,y1,x2,y2,restitution,kind});
  }

  function addArc(cx,cy,r,a0,a1,steps,restitution=.82,kind="rail"){
    let px = cx + Math.cos(a0)*r;
    let py = cy + Math.sin(a0)*r;
    for(let i=1;i<=steps;i++){
      const a = a0 + (a1-a0)*(i/steps);
      const x = cx + Math.cos(a)*r;
      const y = cy + Math.sin(a)*r;
      addSegment(px,py,x,y,restitution,kind);
      px=x; py=y;
    }
  }

  function buildBoard(){
    pins.length=0; bumpers.length=0; segments.length=0;
    addSegment(74,186,74,1070,.72);
    addSegment(74,1070,765,1070,.60);
    addSegment(825,210,825,1115,.65);
    addSegment(765,235,765,1000,.76,"lane-divider");
    addSegment(765,1000,725,1070,.65);
    addSegment(825,1115,765,1115,.55);
    addSegment(765,1115,765,1070,.55);
    addArc(648,215,177,0.00,-1.80,22,.84,"outer-rail");
    addArc(648,215,120,0.00,-1.63,18,.84,"inner-rail");
    addSegment(620,96,565,112,.80,"guide");
    addSegment(565,112,535,135,.80,"guide");
    const cuts = [85,205,325,445,565,685,765];
    for (let i=1;i<cuts.length-1;i++){
      const x=cuts[i];
      addSegment(x,920,x-22,1070,.62,"divider");
      addSegment(x,920,x+22,1070,.62,"divider");
    }
    addSegment(85,920,85,1070,.65,"divider");
    addSegment(765,920,765,1070,.65,"divider");
    addSegment(238,620,305,670,.72,"guide");
    addSegment(305,670,235,725,.72,"guide");
    addSegment(612,620,545,670,.72,"guide");
    addSegment(545,670,615,725,.72,"guide");
    let row=0;
    for(let y=225;y<=885;y+=54){
      const offset = (row%2)*27;
      for(let x=120+offset;x<=720;x+=54){
        if (x>720) continue;
        const blocked =
          ((x>235 && x<615) && (y>170 && y<820)) ||
          Math.hypot(x-235,y-570)<58 ||
          Math.hypot(x-615,y-570)<58 ||
          (y>760 && Math.abs(x-505)<45);
        if (!blocked){
          const jitterX = Math.sin(x*12.17+y*.71)*2.2;
          const jitterY = Math.cos(x*.19+y*3.11)*1.4;
          pins.push({x:x+jitterX,y:y+jitterY,r:5.4,flash:0});
        }
      }
      row++;
    }
    bumpers.push(
      {x:425,y:850,r:34,power:1.16,color:"#ff5ea8",flash:0,label:"START",triggerSlot:true},
      {x:235,y:570,r:31,power:1.08,color:"#59e7ff",flash:0,label:""},
      {x:615,y:570,r:31,power:1.08,color:"#59e7ff",flash:0,label:""},
      {x:425,y:745,r:25,power:1.13,color:"#ffd66b",flash:0,label:""}
    );
  }

  class Ball {
    constructor(power){
      this.x = 795;
      this.y = 1076;
      this.vx = -18 - power*42;
      this.vy = -(1120 + power*1050);
      this.r = BALL_R;
      this.spin = (Math.random()-.5)*7;
      this.age = 0;
      this.alive = true;
      this.trail = [];
      this.hitCount = 0;
      this.lastHit = 0;
      this.alpha = 1;
    }
    update(dt){
      this.age += dt;
      this.lastHit -= dt;
      this.vy += gravity*dt;
      this.vx *= Math.pow(.9993,dt*120);
      this.vy *= Math.pow(.9996,dt*120);
      this.spin *= Math.pow(.997,dt*120);
      this.x += this.vx*dt;
      this.y += this.vy*dt;
      const speed = Math.hypot(this.vx,this.vy);
      if(speed>80){
        const magnus = Math.max(-18,Math.min(18,this.spin*speed*.002));
        this.vx += (-this.vy/speed)*magnus*dt;
        this.vy += ( this.vx/speed)*magnus*dt;
      }
      for(const s of segments) collideBallSegment(this,s);
      for(const p of pins) collideBallCircle(this,p,.83,1,false);
      for(const b of bumpers) collideBallCircle(this,b,.90,b.power,true);
      if(this.y>1099 && this.x>760){
        this.y=1099;
        if(this.vy>0) this.vy*=-.42;
      }
      if(this.y > 1050 && this.x < 765){
        const pocket = pockets.find(p => this.x>=p.x0 && this.x<p.x1);
        if(pocket){
          award(pocket,this.x,this.y);
          this.alive=false;
        }
      }
      if(this.y>1220 || this.x<-60 || this.x>960 || this.age>24){
        this.alive=false;
        activeCombo=0;
      }
      if(this.age%0.035<dt){
        this.trail.push({x:this.x,y:this.y,a:.35});
        if(this.trail.length>10)this.trail.shift();
      }
      for(const t of this.trail)t.a*=.89;
    }
  }

  function collideBallCircle(ball,obj,restitution=0.82,power=1,isBumper=false){
    const dx=ball.x-obj.x, dy=ball.y-obj.y;
    const minD=ball.r+obj.r;
    const d2=dx*dx+dy*dy;
    if(d2>=minD*minD || d2===0)return;
    const d=Math.sqrt(d2);
    const nx=dx/d, ny=dy/d;
    const pen=minD-d;
    ball.x += nx*pen;
    ball.y += ny*pen;
    const vn=ball.vx*nx+ball.vy*ny;
    if(vn<0){
      const tx=-ny, ty=nx;
      const vt=ball.vx*tx+ball.vy*ty;
      const impulse=-(1+restitution)*vn*power;
      ball.vx += impulse*nx;
      ball.vy += impulse*ny;
      const slip=vt-ball.spin*ball.r;
      ball.vx -= tx*slip*.035;
      ball.vy -= ty*slip*.035;
      ball.spin += slip*.018;
      const irregular=(Math.sin(obj.x*1.91+obj.y*.73+ball.hitCount)*.5)*7;
      ball.vx += tx*irregular;
      ball.vy += ty*irregular;
      obj.flash=.12;
      ball.hitCount++;
      activeCombo++;
      bestCombo=Math.max(bestCombo,activeCombo);
      addFever(isBumper?2.4:.38);
      if(ball.lastHit<=0){
        sound(isBumper ? 760 : 430+Math.min(220,Math.abs(vn)*.08), isBumper?.06:.025, isBumper?.04:.012, "triangle");
        ball.lastHit=.025;
      }
      if(isBumper){
        shake=Math.min(8,shake+2.8);
        burst(obj.x,obj.y,obj.color,10);
        if(obj.triggerSlot && feature.cooldown<=0) startFeature();
      }
    }
  }

  function collideBallSegment(ball,s){
    const vx=s.x2-s.x1, vy=s.y2-s.y1;
    const wx=ball.x-s.x1, wy=ball.y-s.y1;
    const len2=vx*vx+vy*vy;
    const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/len2));
    const cx=s.x1+t*vx, cy=s.y1+t*vy;
    let dx=ball.x-cx, dy=ball.y-cy;
    const d2=dx*dx+dy*dy;
    if(d2>=ball.r*ball.r)return;
    let d=Math.sqrt(d2);
    if(d<.0001){
      const len=Math.sqrt(len2);
      dx=-vy/len;dy=vx/len;d=1;
    }
    const nx=dx/d, ny=dy/d;
    const pen=ball.r-d;
    ball.x+=nx*pen;
    ball.y+=ny*pen;
    const vn=ball.vx*nx+ball.vy*ny;
    if(vn<0){
      const tx=-ny,ty=nx;
      const vt=ball.vx*tx+ball.vy*ty;
      const j=-(1+s.restitution)*vn;
      ball.vx+=j*nx;
      ball.vy+=j*ny;
      ball.vx-=tx*vt*.015;
      ball.vy-=ty*vt*.015;
      ball.spin+=vt*.0015;
      if(Math.abs(vn)>250 && ball.lastHit<=0){
        sound(330+Math.min(180,Math.abs(vn)*.06),.022,.009,"triangle");
        ball.lastHit=.025;
      }
    }
  }

  function launch(){
    const alive=balls.filter(b=>b.alive).length;
    if(ballsLeft<=0 || alive>=MAX_BALLS_ON_BOARD)return;
    const p=Math.max(.05,charge);
    const count=fever.active?Math.min(3,MAX_BALLS_ON_BOARD-alive):1;
    for(let i=0;i<count;i++){
      const spread=(i-(count-1)/2)*42;
      const ball=new Ball(Math.max(.05,Math.min(1,p+(Math.random()-.5)*.045)));
      ball.vx+=spread;
      ball.x+=(i-(count-1)/2)*3;
      balls.push(ball);
    }
    ballsLeft--;
    lifetime.launches++;
    if(lifetime.launches===1)unlock("first-launch","第一次發射");
    checkMission();
    updateHUD();
    saveProgress();
    sound(110+p*90,.12,.045,"sawtooth");
    charge=0;
  }
