"use strict";

// V6 upgrade layer: mechanical playfield, golden ×10 ball and linked reel/disc rules.
const mechanismsV6=[];
let mechanismClockV6=0;
const mechanismBoostV6={timer:0,power:1};
const goldVaultV6={x:145,y:196,cooldown:0,maxCooldown:18,flash:0,released:0};

feature.multiplier=1;
feature.sourceGolden=false;
slot.effect="READY";
Object.assign(crank,{
  failMultiplier:1,effectLabel:"STANDARD ROUTE",theme:"#69ffb5",
  safeHoleCounts:[1,1,1],speedScale:1
});
crank.stages.forEach(stage=>stage.safeHoles=[0]);

const baseBuildBoardV6=buildBoard;
buildBoard=function(){
  baseBuildBoardV6();

  // Safety roof and side kickback rails reduce balls leaving the useful playfield.
  addSegment(74,186,110,126,1.02,"spring-guard");
  addSegment(110,126,520,84,.96,"spring-guard");
  addSegment(520,84,572,112,1.02,"spring-guard");
  addSegment(92,335,135,292,1.08,"spring-guard");
  addSegment(92,535,137,500,1.06,"spring-guard");
  addSegment(92,735,150,700,1.10,"spring-guard");
  addSegment(758,330,716,292,1.08,"spring-guard");
  addSegment(758,535,713,500,1.06,"spring-guard");
  addSegment(758,735,700,700,1.10,"spring-guard");
  addSegment(105,875,178,842,1.12,"spring-guard");
  addSegment(745,875,672,842,1.12,"spring-guard");

  bumpers.push(
    {x:118,y:760,r:23,power:1.30,color:"#59e7ff",flash:0,label:"K"},
    {x:732,y:760,r:23,power:1.30,color:"#59e7ff",flash:0,label:"K"},
    {x:145,y:265,r:13,power:1.38,color:"#ffd66b",flash:0,label:"G",triggerGold:true}
  );

  mechanismsV6.length=0;
  mechanismsV6.push(
    {type:"spinner",x:165,y:430,length:48,arms:3,angle:.2,speed:2.8,angularVelocity:2.8,restitution:1.02,color:"#59e7ff",flash:0},
    {type:"spinner",x:685,y:430,length:48,arms:3,angle:1.0,speed:-3.15,angularVelocity:-3.15,restitution:1.02,color:"#ff5ea8",flash:0},
    {type:"flipper",x:158,y:838,length:112,baseAngle:-.58,amplitude:.34,rate:3.2,phase:0,angle:-.58,angularVelocity:0,restitution:1.10,color:"#ffd66b",flash:0},
    {type:"flipper",x:692,y:838,length:112,baseAngle:Math.PI+.58,amplitude:.34,rate:3.2,phase:Math.PI,angle:Math.PI+.58,angularVelocity:0,restitution:1.10,color:"#ffd66b",flash:0},
    {type:"slider",baseX:425,x:425,y:882,length:88,amplitude:76,rate:1.75,phase:0,velocityX:0,restitution:1.06,color:"#69ffb5",flash:0}
  );
};

function updateMechanismsV6(dt){
  mechanismClockV6+=dt;
  goldVaultV6.cooldown=Math.max(0,goldVaultV6.cooldown-dt);
  goldVaultV6.flash=Math.max(0,goldVaultV6.flash-dt);
  mechanismBoostV6.timer=Math.max(0,mechanismBoostV6.timer-dt);
  mechanismBoostV6.power=mechanismBoostV6.timer>0?1.55:1;
  for(const m of mechanismsV6){
    m.flash=Math.max(0,m.flash-dt);
    if(m.type==="spinner"){
      m.angularVelocity=m.speed*mechanismBoostV6.power;
      m.angle+=m.angularVelocity*dt;
    }else if(m.type==="flipper"){
      const wave=mechanismClockV6*m.rate+m.phase;
      m.angle=m.baseAngle+Math.sin(wave)*m.amplitude;
      m.angularVelocity=Math.cos(wave)*m.amplitude*m.rate*mechanismBoostV6.power;
    }else if(m.type==="slider"){
      const wave=mechanismClockV6*m.rate+m.phase;
      m.x=m.baseX+Math.sin(wave)*m.amplitude;
      m.velocityX=Math.cos(wave)*m.amplitude*m.rate*mechanismBoostV6.power;
    }
  }
}

function mechanismSegmentsV6(m){
  if(m.type==="spinner"){
    const result=[];
    for(let i=0;i<m.arms;i++){
      const a=m.angle+i*Math.PI/m.arms;
      result.push({x1:m.x-Math.cos(a)*m.length,y1:m.y-Math.sin(a)*m.length,x2:m.x+Math.cos(a)*m.length,y2:m.y+Math.sin(a)*m.length,pivotX:m.x,pivotY:m.y,angularVelocity:m.angularVelocity});
    }
    return result;
  }
  if(m.type==="flipper")return [{x1:m.x,y1:m.y,x2:m.x+Math.cos(m.angle)*m.length,y2:m.y+Math.sin(m.angle)*m.length,pivotX:m.x,pivotY:m.y,angularVelocity:m.angularVelocity}];
  if(m.type==="slider")return [{x1:m.x-m.length/2,y1:m.y,x2:m.x+m.length/2,y2:m.y,velocityX:m.velocityX,velocityY:0}];
  return [];
}

function collideBallMechanismsV6(ball){
  for(const m of mechanismsV6){
    for(const s of mechanismSegmentsV6(m))collideBallMovingSegmentV6(ball,s,m);
  }
}

function collideBallMovingSegmentV6(ball,s,m){
  const vx=s.x2-s.x1,vy=s.y2-s.y1,len2=vx*vx+vy*vy;
  if(len2<.001)return;
  const wx=ball.x-s.x1,wy=ball.y-s.y1;
  const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/len2));
  const cx=s.x1+t*vx,cy=s.y1+t*vy;
  let dx=ball.x-cx,dy=ball.y-cy;
  const radius=ball.r+6,d2=dx*dx+dy*dy;
  if(d2>=radius*radius)return;
  let d=Math.sqrt(d2);
  if(d<.001){const len=Math.sqrt(len2);dx=-vy/len;dy=vx/len;d=1;}
  const nx=dx/d,ny=dy/d,penetration=radius-d;
  ball.x+=nx*penetration;ball.y+=ny*penetration;
  let surfaceVx=s.velocityX||0,surfaceVy=s.velocityY||0;
  if(Number.isFinite(s.angularVelocity)){
    const rx=cx-s.pivotX,ry=cy-s.pivotY;
    surfaceVx+=-ry*s.angularVelocity;surfaceVy+=rx*s.angularVelocity;
  }
  const vn=(ball.vx-surfaceVx)*nx+(ball.vy-surfaceVy)*ny;
  if(vn<0){
    const impulse=-(1+m.restitution*mechanismBoostV6.power)*vn;
    ball.vx+=impulse*nx+surfaceVx*.22;
    ball.vy+=impulse*ny+surfaceVy*.22;
    m.flash=.13;activeCombo++;bestCombo=Math.max(bestCombo,activeCombo);addFever(1.25);
    if(ball.lastHit<=0){sound(m.type==="flipper"?560:690,.045,.022,"triangle");ball.lastHit=.03;}
    if(Math.abs(vn)>220)burst(cx,cy,m.color,5);
  }
}

function releaseGoldenBallV6(sourceX=goldVaultV6.x,sourceY=goldVaultV6.y){
  if(goldVaultV6.cooldown>0)return false;
  if(balls.filter(b=>b.alive).length>=MAX_BALLS_ON_BOARD){showToast("黃金彈珠艙已解鎖，但盤面暫時沒有空間");return false;}
  goldVaultV6.cooldown=goldVaultV6.maxCooldown;goldVaultV6.flash=1.2;goldVaultV6.released++;
  const gold=new Ball(.25);
  Object.assign(gold,{golden:true,multiplier:10,x:goldVaultV6.x,y:goldVaultV6.y+25,vx:145+Math.random()*40,vy:55+Math.random()*35,spin:5,featureUsed:false});
  balls.push(gold);
  unlock("first-golden","釋放第一顆黃金彈珠");
  showToast("✨ 黃金彈珠釋放！這顆彈珠的所有得分 ×10");
  burst(sourceX,sourceY,"#ffd66b",44);sound(1180,.25,.075,"square");setTimeout(()=>sound(1568,.32,.055,"triangle"),100);
  return true;
}

Ball.prototype.update=function(dt){
  this.multiplier=this.golden?10:(this.multiplier||1);
  this.age+=dt;this.lastHit-=dt;this.vy+=gravity*dt;
  this.vx*=Math.pow(.9993,dt*120);this.vy*=Math.pow(.9996,dt*120);this.spin*=Math.pow(.997,dt*120);
  this.x+=this.vx*dt;this.y+=this.vy*dt;
  const speed=Math.hypot(this.vx,this.vy);
  if(speed>80){const magnus=Math.max(-18,Math.min(18,this.spin*speed*.002));this.vx+=(-this.vy/speed)*magnus*dt;this.vy+=(this.vx/speed)*magnus*dt;}
  for(const s of segments)collideBallSegment(this,s);
  for(const p of pins)collideBallCircle(this,p,.83,1,false);
  for(const b of bumpers)collideBallCircle(this,b,.90,b.power,true);
  collideBallMechanismsV6(this);
  if(this.y>1099&&this.x>760){this.y=1099;if(this.vy>0)this.vy*=-.42;}
  if(this.y>1050&&this.x<765){const pocket=pockets.find(p=>this.x>=p.x0&&this.x<p.x1);if(pocket){award(pocket,this.x,this.y,this);this.alive=false;}}
  if(this.y>1220||this.x<-80||this.x>980||this.age>(this.golden?32:24)){this.alive=false;activeCombo=0;}
  if(this.age%0.035<dt){this.trail.push({x:this.x,y:this.y,a:.35});if(this.trail.length>10)this.trail.shift();}
  for(const t of this.trail)t.a*=.89;
};

collideBallCircle=function(ball,obj,restitution=.82,power=1,isBumper=false){
  const dx=ball.x-obj.x,dy=ball.y-obj.y,minD=ball.r+obj.r,d2=dx*dx+dy*dy;
  if(d2>=minD*minD||d2===0)return;
  const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,pen=minD-d;
  ball.x+=nx*pen;ball.y+=ny*pen;
  const vn=ball.vx*nx+ball.vy*ny;
  if(vn<0){
    const tx=-ny,ty=nx,vt=ball.vx*tx+ball.vy*ty,impulse=-(1+restitution)*vn*power;
    ball.vx+=impulse*nx;ball.vy+=impulse*ny;
    const slip=vt-ball.spin*ball.r;ball.vx-=tx*slip*.035;ball.vy-=ty*slip*.035;ball.spin+=slip*.018;
    const irregular=Math.sin(obj.x*1.91+obj.y*.73+ball.hitCount)*3.5;ball.vx+=tx*irregular;ball.vy+=ty*irregular;
    obj.flash=.12;ball.hitCount++;activeCombo++;bestCombo=Math.max(bestCombo,activeCombo);addFever(isBumper?2.4:.38);
    if(ball.lastHit<=0){sound(isBumper?760:430+Math.min(220,Math.abs(vn)*.08),isBumper?.06:.025,isBumper?.04:.012,"triangle");ball.lastHit=.025;}
    if(isBumper){
      shake=Math.min(8,shake+2.8);burst(obj.x,obj.y,obj.color,10);
      if(obj.triggerSlot&&feature.cooldown<=0&&!ball.featureUsed){ball.featureUsed=true;startFeature(ball.multiplier||1,Boolean(ball.golden));}
      if(obj.triggerGold&&goldVaultV6.cooldown<=0)releaseGoldenBallV6(obj.x,obj.y);
    }
  }
};

function enhancedCrankV6(base){
  const boost=difficulties[difficulty].crankBoost*(fever.active?1.08:1);
  return base.map(v=>Math.min(.97,v*boost));
}
function chooseSlotResultV6(){
  const boost=difficulties[difficulty].slotBoost*(fever.active?1.35:1),r=Math.random();
  if(r<.020*boost)return[3,3,3];if(r<.050*boost)return[5,5,5];if(r<.095*boost)return[4,4,4];if(r<.150*boost)return[2,2,2];if(r<.225*boost)return[1,1,1];if(r<.315*boost)return[0,0,0];
  if(r<Math.min(.74,.610+(boost-1)*.18)){const pair=Math.floor(Math.random()*6),odd=(pair+1+Math.floor(Math.random()*5))%6,result=[pair,pair,odd];result.sort(()=>Math.random()-.5);return result;}
  return[0,0,0].map(()=>Math.floor(Math.random()*6));
}

startFeature=function(multiplier=1,sourceGolden=false){
  if(feature.mode!=="idle"||feature.cooldown>0)return;
  feature.mode="slot";feature.transition=0;feature.multiplier=Math.max(1,multiplier||1);feature.sourceGolden=Boolean(sourceGolden||feature.multiplier>1);
  lifetime.starts++;addFever(8);if(lifetime.starts===1)unlock("first-start","第一次啟動 START");checkMission();saveProgress();
  slot.spinning=true;slot.evaluated=false;slot.elapsed=0;slot.qualified=false;slot.tier="NONE";slot.effect=feature.sourceGolden?"GOLD SCORE ×10":"SELECTING ROUTE";slot.message=feature.sourceGolden?"GOLD SPIN ×10":"SPINNING";slot.result=chooseSlotResultV6();
  slot.reels.forEach((reel,i)=>{reel.stopped=false;reel.speed=16+i*3+Math.random()*2;reel.pos=(reel.pos%6+6)%6;});
  sound(feature.sourceGolden?620:170,.18,.055,"sawtooth");setTimeout(()=>sound(feature.sourceGolden?880:245,.12,.035,"square"),90);burst(425,280,feature.sourceGolden?"#ffd66b":"#ff5ea8",feature.sourceGolden?38:20);
};

function slotConfigV6(result){
  const[a,b,c]=result,sorted=[a,b,c].sort((x,y)=>x-y).join(","),triple=a===b&&b===c,pair=a===b?a:a===c?a:b===c?b:-1;
  if(triple)return({
    3:{tier:"LEGEND",message:"777 • TRIPLE GATE",effect:"3/3/2 GO HOLES • SLOW DISCS",pass:[.94,.84,.68],safe:[3,3,2],speed:.72,prize:7000,extra:35,immediate:1200,theme:"#ff4f8b",fail:2.2,fever:35,gold:true},
    5:{tier:"DIAMOND",message:"DIAMOND • GEM ROUTE",effect:"2 GO HOLES EACH • GOLD LOCK READY",pass:[.88,.74,.54],safe:[2,2,2],speed:.80,prize:5500,extra:25,immediate:850,theme:"#59e7ff",fail:1.8,fever:24,gold:true},
    4:{tier:"STAR",message:"STAR • CONSTELLATION",effect:"2/2/1 GO HOLES • SLOW DISCS",pass:[.85,.70,.48],safe:[2,2,1],speed:.78,prize:4600,extra:20,immediate:650,theme:"#ffd66b",fail:1.6,fever:40},
    2:{tier:"POWER",message:"BAR • POWER DRIVE",effect:"POWER FLIPPERS • 1/2/1 GO HOLES",pass:[.79,.63,.42],safe:[1,2,1],speed:1.12,prize:4000,extra:18,immediate:500,theme:"#ff8d57",fail:1.45,mechanism:14},
    1:{tier:"BELL",message:"BELL • BALL RAIN",effect:"+25 BALLS • 2/1/1 GO HOLES",pass:[.81,.61,.39],safe:[2,1,1],speed:.94,prize:3400,extra:25,immediate:360,theme:"#ffd66b",fail:1.3,fever:18},
    0:{tier:"CHERRY",message:"CHERRY • EASY ENTRY",effect:"EASY LEVEL 1 • 2/1/1 GO HOLES",pass:[.80,.56,.33],safe:[2,1,1],speed:1,prize:2700,extra:12,immediate:260,theme:"#ff5e7e",fail:1.15,fever:16}
  })[a];
  if(sorted==="3,4,5")return{tier:"ROYAL",message:"7 + STAR + GEM • ROYAL",effect:"2 GO HOLES EACH • GOLD LOCK READY",pass:[.88,.73,.52],safe:[2,2,2],speed:.76,prize:5200,extra:22,immediate:777,theme:"#e9b7ff",fail:1.8,fever:30,gold:true};
  if(sorted==="0,1,2")return{tier:"MACHINE",message:"CHERRY + BELL + BAR",effect:"MECHANICAL OVERDRIVE • EXTRA BALLS",pass:[.77,.58,.36],safe:[2,1,1],speed:1.05,prize:3000,extra:18,immediate:333,theme:"#69ffb5",fail:1.35,mechanism:12};
  if(pair>=0)return({
    3:{tier:"DOUBLE 7",message:"DOUBLE 7 • HOT ROUTE",effect:"2/2/1 GO HOLES",pass:[.79,.61,.39],safe:[2,2,1],speed:.88,prize:3100,extra:12,immediate:220,theme:"#ff4f8b",fail:1.45},
    5:{tier:"GEM PAIR",message:"DIAMOND PAIR • GEM PATH",effect:"2 GO HOLES EACH",pass:[.77,.59,.38],safe:[2,2,2],speed:.88,prize:2900,extra:11,immediate:190,theme:"#59e7ff",fail:1.4,gold:true},
    4:{tier:"STAR PAIR",message:"STAR PAIR • FINAL LIGHT",effect:"2 GO HOLES ON FINAL",pass:[.73,.52,.38],safe:[1,1,2],speed:.86,prize:2600,extra:10,immediate:170,theme:"#ffd66b",fail:1.3,fever:20},
    2:{tier:"BAR PAIR",message:"BAR PAIR • KICKBACK",effect:"POWER FLIPPERS • FAST DISCS",pass:[.70,.50,.29],safe:[1,2,1],speed:1.2,prize:2400,extra:9,immediate:150,theme:"#ff8d57",fail:1.25,mechanism:9},
    1:{tier:"BELL PAIR",message:"BELL PAIR • BALL BONUS",effect:"+8 BALLS • EASY LEVEL 1",pass:[.72,.48,.27],safe:[2,1,1],speed:.96,prize:2100,extra:8,immediate:130,theme:"#ffd66b",fail:1.15},
    0:{tier:"CHERRY PAIR",message:"CHERRY PAIR • ENTRY GATE",effect:"2 GO HOLES ON LEVEL 1",pass:[.72,.46,.25],safe:[2,1,1],speed:1,prize:1900,extra:6,immediate:110,theme:"#ff5e7e",fail:1.1}
  })[pair];
  return{tier:"MISS",message:"NO MATCH",effect:"SMALL RETURN • NO DISC GATE",qualified:false,immediate:30,extra:0,fever:3};
}

function applySlotConfigV6(config){
  slot.qualified=config.qualified!==false;slot.tier=config.tier;slot.message=config.message+(feature.sourceGolden?" • ×10":"");slot.effect=config.effect;feature.tier=config.tier;
  if(slot.qualified){
    crank.passChance=enhancedCrankV6(config.pass);crank.safeHoleCounts=config.safe.slice();crank.speedScale=config.speed;crank.finalPrize=config.prize;crank.extraBalls=config.extra;crank.failMultiplier=config.fail||1;crank.theme=config.theme;crank.effectLabel=config.effect;
    if(config.mechanism){mechanismBoostV6.timer=Math.max(mechanismBoostV6.timer,config.mechanism);showToast(`⚙️ 機械增壓 ${config.mechanism} 秒`);}
    if(config.gold){goldVaultV6.cooldown=0;goldVaultV6.flash=1.2;}
  }
  const immediate=Math.round(config.immediate*difficulties[difficulty].prize*feature.multiplier);score+=immediate;ballsLeft+=config.extra||0;addFever(config.fever??Math.min(20,config.immediate/45));feature.transition=1.35;checkMission();updateHUD();
  if(slot.qualified){sound(config.tier==="LEGEND"?1050:720,.22,.06,"square");burst(425,305,config.theme,config.tier==="LEGEND"?60:34);shake=config.tier==="LEGEND"?13:8;}else{sound(220,.22,.035,"sawtooth");shake=4;}
}
evaluateSlot=function(){if(slot.evaluated)return;slot.evaluated=true;applySlotConfigV6(slotConfigV6(slot.result));};

function safeHolesV6(count){return count>=3?[0,2,4]:count===2?[0,3]:[0];}
chooseCrankOutcome=function(){const r=[false,false,false];r[0]=Math.random()<crank.passChance[0];r[1]=r[0]&&Math.random()<crank.passChance[1];r[2]=r[1]&&Math.random()<crank.passChance[2];return r;};
startCrank=function(tier){
  feature.mode="crank";feature.transition=0;crank.running=true;crank.stage=0;crank.timer=0;crank.tier=tier;crank.message=`${tier}${feature.sourceGolden?" ×10":""} • LEVEL 1`;crank.outcome=chooseCrankOutcome();
  crank.stages.forEach((stage,i)=>{stage.diskAngle=Math.random()*Math.PI*2;stage.ballAngle=Math.random()*Math.PI*2;stage.orbit=70+i*7;stage.speed=(i%2===0?1:-1)*(1.78-i*.23)*crank.speedScale;stage.resolved=false;stage.safeHoles=safeHolesV6(crank.safeHoleCounts[i]);const unsafe=[0,1,2,3,4,5].filter(h=>!stage.safeHoles.includes(h));stage.targetHole=crank.outcome[i]?stage.safeHoles[Math.floor(Math.random()*stage.safeHoles.length)]:unsafe[Math.floor(Math.random()*unsafe.length)];crank.targetHole[i]=stage.targetHole;});
  sound(145,.22,.06,"sawtooth");setTimeout(()=>sound(205,.14,.04,"square"),100);burst(425,470,crank.theme,30);
};
finishCrank=function(success,failedStage=2){
  crank.running=false;feature.mode="result";feature.transition=1.8;feature.cooldown=1;
  if(success){const reward=Math.round(crank.finalPrize*difficulties[difficulty].prize*feature.multiplier);score+=reward;ballsLeft+=crank.extraBalls;lifetime.jackpots++;addFever(30);unlock("first-jackpot","第一次完成三層 JACKPOT");checkMission();saveProgress();crank.message=`${crank.tier} JACKPOT +${reward}`;jackpotFlash=3.2;shake=17;burst(425,620,crank.theme,115);sound(784,.25,.075,"square");setTimeout(()=>sound(1046,.28,.07,"square"),100);setTimeout(()=>sound(1318,.35,.065,"square"),220);setTimeout(()=>sound(1568,.42,.06,"square"),350);}
  else{const base=[40,180,650],prize=Math.round(base[failedStage]*crank.failMultiplier*difficulties[difficulty].prize*feature.multiplier),extras=[0,1,4];score+=prize;ballsLeft+=extras[failedStage];crank.message=`LEVEL ${failedStage+1} MISS +${prize}`;shake=7+failedStage*2;burst(425,485+failedStage*104,crank.theme,24+failedStage*12);sound(260-failedStage*25,.24,.045,"sawtooth");}
  updateHUD();
};
updateCrank=function(dt){
  crank.stages.forEach(stage=>{stage.diskAngle+=stage.speed*(crank.running?1:.24)*dt;});if(!crank.running)return;crank.timer+=dt;
  const stage=crank.stages[crank.stage],settle=1.72,resolve=2.72;
  if(crank.timer<settle){stage.ballAngle+=(5.8-crank.stage*.55)*Math.max(.78,crank.speedScale)*dt;stage.orbit=Math.max(42,stage.orbit-10.8*dt);}else{const target=stage.diskAngle+stage.targetHole*Math.PI*2/6,pull=Math.min(1,(crank.timer-settle)/(resolve-settle));stage.ballAngle+=shortestAngle(stage.ballAngle,target)*dt*(2.9+pull*8.6);stage.orbit=Math.max(33,stage.orbit-22*dt);stage.speed*=Math.pow(.23,dt);}
  if(crank.timer>=resolve&&!stage.resolved){stage.resolved=true;const passed=crank.outcome[crank.stage];if(passed){stage.ballAngle=stage.diskAngle+stage.targetHole*Math.PI*2/6;sound(690+crank.stage*130,.16,.055,"triangle");burst(425,485+crank.stage*104,crank.theme,36);shake=9;if(crank.stage===2)finishCrank(true);else{crank.stage++;crank.timer=0;crank.message=crank.stage===2?`${crank.tier}${feature.sourceGolden?" ×10":""} • FINAL`:`${crank.tier}${feature.sourceGolden?" ×10":""} • LEVEL ${crank.stage+1}`;const next=crank.stages[crank.stage];next.ballAngle=Math.random()*Math.PI*2;next.orbit=70+crank.stage*7;}}else finishCrank(false,crank.stage);}
};

const baseUpdateSlotV6=updateSlot;
updateFeature=function(dt){
  updateMechanismsV6(dt);feature.cooldown=Math.max(0,feature.cooldown-dt);
  if(feature.mode==="slot"){baseUpdateSlotV6(dt);if(!slot.spinning&&slot.evaluated&&feature.transition>0){feature.transition-=dt;if(feature.transition<=0){if(slot.qualified)startCrank(slot.tier);else{feature.mode="idle";feature.cooldown=.75;feature.multiplier=1;feature.sourceGolden=false;slot.message="HIT START";slot.effect="READY";}}}}
  else if(feature.mode==="crank")updateCrank(dt);
  else{updateCrank(dt);if(feature.mode==="result"&&feature.transition>0){feature.transition-=dt;if(feature.transition<=0){feature.mode="idle";feature.multiplier=1;feature.sourceGolden=false;slot.message="HIT START";slot.effect="READY";crank.message="WAITING";crank.effectLabel="STANDARD ROUTE";}}}
};

award=function(pocket,x,y,ball){
  const multiplier=ball?.golden?10:(ball?.multiplier||1);
  if(pocket.slot){score+=25*multiplier;activeCombo=0;shake=multiplier>1?10:6;burst(x,y,multiplier>1?"#ffd66b":"#ff5ea8",multiplier>1?42:24);startFeature(multiplier,Boolean(ball?.golden));updateHUD();return;}
  const reward=Math.round(pocket.value*difficulties[difficulty].prize*multiplier);score+=reward;addFever(Math.max(1,pocket.value/18)*(multiplier>1?1.8:1));activeCombo=0;shake=pocket.value>=100?9:4;const color=multiplier>1?"#ffd66b":pocket.value>=100?"#ffd66b":"#59e7ff";sound(520+pocket.value*2+(multiplier>1?280:0),.13,multiplier>1?.06:.04,"sine");burst(x,y,color,multiplier>1?38:18);if(multiplier>1)showToast(`✨ 黃金彈珠得分 ×10：+${reward}`);checkMission();updateHUD();
};

const baseResetV6=reset;
reset=function(){
  baseResetV6();mechanismBoostV6.timer=0;mechanismBoostV6.power=1;goldVaultV6.cooldown=0;goldVaultV6.flash=0;feature.multiplier=1;feature.sourceGolden=false;slot.effect="READY";Object.assign(crank,{failMultiplier:1,effectLabel:"STANDARD ROUTE",theme:"#69ffb5",safeHoleCounts:[1,1,1],speedScale:1});crank.stages.forEach(stage=>stage.safeHoles=[0]);
};

function drawMechanismsV6(){
  ctx.save();
  for(const m of mechanismsV6){
    ctx.lineCap="round";ctx.lineWidth=m.type==="flipper"?16:12;ctx.shadowColor=m.color;ctx.shadowBlur=m.flash>0?26:10;
    for(const seg of mechanismSegmentsV6(m)){
      const metal=ctx.createLinearGradient(seg.x1,seg.y1,seg.x2,seg.y2);metal.addColorStop(0,"#3a4658");metal.addColorStop(.35,"#f4f7fb");metal.addColorStop(.58,m.color);metal.addColorStop(1,"#29313e");ctx.strokeStyle=metal;ctx.beginPath();ctx.moveTo(seg.x1,seg.y1);ctx.lineTo(seg.x2,seg.y2);ctx.stroke();ctx.strokeStyle="#ffffffaa";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(seg.x1,seg.y1-2);ctx.lineTo(seg.x2,seg.y2-2);ctx.stroke();ctx.lineWidth=m.type==="flipper"?16:12;
    }
    ctx.fillStyle="#0b1018";ctx.shadowColor=m.color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(m.x,m.y,m.type==="slider"?8:12,0,Math.PI*2);ctx.fill();ctx.strokeStyle=m.color;ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;
  }
  ctx.restore();drawGoldVaultV6();
}
function drawGoldVaultV6(){
  const ready=goldVaultV6.cooldown<=0,x=105,y=155,w=80,h=88;ctx.save();const frame=ctx.createLinearGradient(x,y,x+w,y+h);frame.addColorStop(0,"#5d410c");frame.addColorStop(.3,"#fff0a3");frame.addColorStop(.55,"#bd8122");frame.addColorStop(1,"#332006");ctx.fillStyle=frame;ctx.shadowColor=ready?"#ffd66b":"#4a3c20";ctx.shadowBlur=ready?20:5;ctx.beginPath();ctx.roundRect(x,y,w,h,15);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#080b10";ctx.beginPath();ctx.roundRect(x+7,y+7,w-14,h-14,10);ctx.fill();ctx.strokeStyle=ready?"#ffd66b":"#6b624b";ctx.lineWidth=2;ctx.stroke();
  if(ready){const gg=ctx.createRadialGradient(goldVaultV6.x-6,goldVaultV6.y-8,2,goldVaultV6.x,goldVaultV6.y,19);gg.addColorStop(0,"#fffbd0");gg.addColorStop(.28,"#ffe56d");gg.addColorStop(.66,"#d89313");gg.addColorStop(1,"#583006");ctx.fillStyle=gg;ctx.shadowColor="#ffd66b";ctx.shadowBlur=22+goldVaultV6.flash*15;ctx.beginPath();ctx.arc(goldVaultV6.x,goldVaultV6.y,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff4a8";ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;}else{ctx.fillStyle="#332b1c";ctx.beginPath();ctx.arc(goldVaultV6.x,goldVaultV6.y,17,0,Math.PI*2);ctx.fill();}
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=ready?"#ffe98b":"#8b816b";ctx.font="1000 10px system-ui";ctx.fillText("GOLD ×10",goldVaultV6.x,226);if(!ready){ctx.font="900 8px system-ui";ctx.fillText(`${Math.ceil(goldVaultV6.cooldown)}s`,goldVaultV6.x,196);}ctx.restore();
}
function drawCrankOverlayV6(){
  if(feature.sourceGolden){ctx.fillStyle="#ffd66b";ctx.shadowColor="#ffd66b";ctx.shadowBlur=12;ctx.font="1000 11px system-ui";ctx.textAlign="center";ctx.fillText("GOLD ×10",543,197);ctx.shadowBlur=0;}
  ctx.font="900 9px system-ui";ctx.fillStyle=feature.sourceGolden?"#ffe66b":"#9cb1d2";ctx.textAlign="center";ctx.fillText(slot.effect,425,365);
  const centers=[{y:470,rx:122,ry:40},{y:580,rx:134,ry:44},{y:690,rx:146,ry:49}];
  centers.forEach((c,i)=>{const safe=crank.stages[i].safeHoles||[0];safe.forEach(h=>{if(h===0)return;const a=crank.stages[i].diskAngle+h*Math.PI*2/6,hx=425+Math.cos(a)*(c.rx-41),hy=c.y+Math.sin(a)*(c.ry-18)-2;ctx.fillStyle="#000";ctx.shadowColor=crank.theme;ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(hx,hy,13,6.5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=crank.theme;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#d8ffe9";ctx.font="1000 8px system-ui";ctx.fillText("GO",hx,hy);ctx.shadowBlur=0;});});
  ctx.font="900 9px system-ui";ctx.fillStyle="#9eb0cb";ctx.fillText(feature.mode==="crank"||feature.mode==="result"?crank.effectLabel:slot.effect,425,791);
}

const baseDrawHybridFeatureV6=drawHybridFeature;
drawHybridFeature=function(){baseDrawHybridFeatureV6();drawCrankOverlayV6();};
const baseDrawBoardV6=drawBoard;
drawBoard=function(){baseDrawBoardV6();for(const s of segments){if(s.kind!=="spring-guard")continue;ctx.strokeStyle="#f2f7ff";ctx.lineWidth=9;ctx.shadowColor="#59e7ff";ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.shadowBlur=0;}drawMechanismsV6();};
const baseDrawBallsV6=drawBalls;
drawBalls=function(){baseDrawBallsV6();for(const ball of balls){if(!ball.golden)continue;const bg=ctx.createRadialGradient(ball.x-4,ball.y-5,1,ball.x,ball.y,ball.r);bg.addColorStop(0,"#fffbd2");bg.addColorStop(.24,"#ffe66b");bg.addColorStop(.58,"#d99a18");bg.addColorStop(1,"#5b3106");ctx.fillStyle=bg;ctx.shadowColor="#ffd66b";ctx.shadowBlur=18;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r+.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff1a1";ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;}};
