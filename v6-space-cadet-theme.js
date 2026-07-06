"use strict";

// V6.4: original retro-space table presentation and mission computer.
const spaceMissionV64={
  index:0,
  targets:new Set(),
  completed:0,
  message:"HIT THE THREE MISSION TARGETS",
  flash:0
};
const spaceMissionDefsV64=[
  {id:"targets",title:"SELECT MISSION",description:"HIT ALL 3 MISSION TARGETS",reward:700,balls:2},
  {id:"start",title:"DEPLOY REELS",description:"HIT THE START REACTOR",reward:900,balls:3},
  {id:"gold",title:"GOLDEN ORBIT",description:"OPEN THE GOLD LOCK",reward:1400,balls:4},
  {id:"jackpot",title:"FINAL APPROACH",description:"CLEAR ALL 3 CRANK LEVELS",reward:2200,balls:6}
];

function currentSpaceMissionV64(){return spaceMissionDefsV64[spaceMissionV64.index%spaceMissionDefsV64.length];}
function spaceRankV64(){
  if(score>=50000)return"STAR CAPTAIN";
  if(score>=25000)return"COMMANDER";
  if(score>=12000)return"LIEUTENANT";
  if(score>=5000)return"ENSIGN";
  return"CADET";
}
function spaceMissionProgressTextV64(){
  const mission=currentSpaceMissionV64();
  if(mission.id==="targets")return`${spaceMissionV64.targets.size} / 3 TARGETS LIT`;
  if(mission.id==="start")return"START REACTOR ARMED";
  if(mission.id==="gold")return goldVaultV6.cooldown<=0?"GOLD LOCK READY":"GOLD LOCK RECHARGING";
  return"REACH THE FINAL DISC";
}
function updateSpaceMissionPanelV64(){
  const title=document.getElementById("spaceMissionTitle");
  const status=document.getElementById("spaceMissionStatus");
  const rank=document.getElementById("spaceRankStatus");
  const bonus=document.getElementById("spaceBonusStatus");
  const mission=currentSpaceMissionV64();
  if(title)title.textContent=mission.title;
  if(status)status.textContent=spaceMissionV64.flash>0?spaceMissionV64.message:`${mission.description}\n${spaceMissionProgressTextV64()}`;
  if(rank)rank.textContent=spaceRankV64();
  if(bonus)bonus.textContent=`MISSION ${spaceMissionV64.index+1}  BONUS ${mission.reward}`;
}
function completeSpaceMissionV64(){
  const mission=currentSpaceMissionV64();
  score+=mission.reward;
  ballsLeft+=mission.balls;
  spaceMissionV64.completed++;
  spaceMissionV64.message=`MISSION COMPLETE  +${mission.reward}`;
  spaceMissionV64.flash=2.6;
  showToast(`🚀 ${mission.title} 完成：+${mission.reward} 分、+${mission.balls} 顆`);
  burst(425,850,"#a982ff",55);
  sound(720,.16,.055,"square");
  setTimeout(()=>sound(980,.20,.05,"square"),90);
  spaceMissionV64.index=(spaceMissionV64.index+1)%spaceMissionDefsV64.length;
  spaceMissionV64.targets.clear();
  updateHUD();
}
function signalSpaceMissionV64(type,payload){
  const mission=currentSpaceMissionV64();
  if(mission.id==="targets"&&type==="target"){
    spaceMissionV64.targets.add(payload);
    spaceMissionV64.message=`TARGET ${payload} LIT`;
    spaceMissionV64.flash=1.1;
    if(spaceMissionV64.targets.size>=3)completeSpaceMissionV64();
  }else if(mission.id===type){
    completeSpaceMissionV64();
  }
  updateSpaceMissionPanelV64();
}

const baseBuildBoardV64=buildBoard;
buildBoard=function(){
  baseBuildBoardV64();
  const targetPositions=[[112,380],[112,435],[112,490]];
  for(let i=0;i<targetPositions.length;i++){
    const [x,y]=targetPositions[i];
    for(let p=pins.length-1;p>=0;p--)if(Math.hypot(pins[p].x-x,pins[p].y-y)<24)pins.splice(p,1);
    bumpers.push({x,y,r:11,power:1.07,color:i===0?"#ffe35e":i===1?"#5ee7ff":"#ff5c8b",flash:0,label:String(i+1),missionTarget:i+1,missionCooldown:0});
  }
};

const baseCollideBallCircleV64=collideBallCircle;
collideBallCircle=function(ball,obj,restitution=.82,power=1,isBumper=false){
  const dx=ball.x-obj.x,dy=ball.y-obj.y,minD=ball.r+obj.r;
  const approaching=dx*dx+dy*dy<minD*minD&&(ball.vx*dx+ball.vy*dy)<0;
  baseCollideBallCircleV64(ball,obj,restitution,power,isBumper);
  if(approaching&&obj.missionTarget&&obj.missionCooldown<=0){
    obj.missionCooldown=.7;
    signalSpaceMissionV64("target",obj.missionTarget);
    burst(obj.x,obj.y,obj.color,18);
  }
};

const baseUpdateFeatureV64=updateFeature;
updateFeature=function(dt){
  baseUpdateFeatureV64(dt);
  spaceMissionV64.flash=Math.max(0,spaceMissionV64.flash-dt);
  for(const b of bumpers)if(b.missionCooldown)b.missionCooldown=Math.max(0,b.missionCooldown-dt);
};

const baseStartFeatureV64=startFeature;
startFeature=function(...args){
  const before=feature.mode;
  const result=baseStartFeatureV64(...args);
  if(before==="idle"&&feature.mode==="slot")signalSpaceMissionV64("start");
  return result;
};

const baseReleaseGoldenBallV64=releaseGoldenBallV6;
releaseGoldenBallV6=function(...args){
  const released=baseReleaseGoldenBallV64(...args);
  if(released)signalSpaceMissionV64("gold");
  return released;
};

const baseFinishCrankV64=finishCrank;
finishCrank=function(success,...args){
  const result=baseFinishCrankV64(success,...args);
  if(success)signalSpaceMissionV64("jackpot");
  return result;
};

const baseUpdateHUDV64=updateHUD;
updateHUD=function(){
  baseUpdateHUDV64();
  updateSpaceMissionPanelV64();
};

function drawTriangleInsertV64(x,y,angle,color,on=true){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.fillStyle=on?color:"#15213d";
  ctx.shadowColor=on?color:"transparent";ctx.shadowBlur=on?12:0;
  ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(8,7);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#ffffff88";ctx.lineWidth=1;ctx.stroke();ctx.restore();
}
function drawSpaceTableOverlayV64(){
  ctx.save();

  // Subtle starfield and circuit traces on the playfield.
  for(let i=0;i<76;i++){
    const x=86+(i*97%650),y=178+(i*173%690);
    if(x>250&&x<610&&y<815)continue;
    const pulse=.35+.35*Math.sin(lampPhase*2+i);
    ctx.globalAlpha=pulse;
    ctx.fillStyle=i%7===0?"#b694ff":"#d9efff";
    ctx.beginPath();ctx.arc(x,y,i%11===0?1.8:1,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // Red metallic orbit rails along both outer playfield edges.
  ctx.lineCap="round";
  ctx.strokeStyle="#5b1024";ctx.lineWidth=18;ctx.shadowColor="#ff456b";ctx.shadowBlur=9;
  ctx.beginPath();ctx.moveTo(91,250);ctx.bezierCurveTo(72,410,78,680,104,868);ctx.stroke();
  ctx.beginPath();ctx.moveTo(744,332);ctx.bezierCurveTo(770,470,766,690,738,868);ctx.stroke();
  ctx.strokeStyle="#f05270";ctx.lineWidth=4;ctx.shadowBlur=4;
  ctx.beginPath();ctx.moveTo(91,250);ctx.bezierCurveTo(72,410,78,680,104,868);ctx.stroke();
  ctx.beginPath();ctx.moveTo(744,332);ctx.bezierCurveTo(770,470,766,690,738,868);ctx.stroke();
  ctx.shadowBlur=0;

  // Mission target bank housing.
  const bank=ctx.createLinearGradient(80,350,150,515);
  bank.addColorStop(0,"#b9c3d4");bank.addColorStop(.18,"#313a4c");bank.addColorStop(1,"#090c14");
  ctx.fillStyle=bank;ctx.beginPath();ctx.roundRect(82,348,61,171,14);ctx.fill();
  ctx.strokeStyle="#d74c68";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#e7ecf6";ctx.font="900 9px system-ui";ctx.textAlign="center";ctx.fillText("MISSION",112,365);
  [380,435,490].forEach((y,i)=>{
    const lit=spaceMissionV64.targets.has(i+1);
    const color=i===0?"#ffe35e":i===1?"#5ee7ff":"#ff5c8b";
    ctx.fillStyle=lit?color:"#111827";ctx.shadowColor=lit?color:"transparent";ctx.shadowBlur=lit?16:0;
    ctx.beginPath();ctx.arc(112,y,12,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=lit?"#06101a":"#9aa5ba";ctx.font="1000 9px system-ui";ctx.fillText(String(i+1),112,y+3);
  });
  ctx.shadowBlur=0;

  // Central reactor around START.
  ctx.save();ctx.translate(425,850);
  const reactor=ctx.createRadialGradient(-12,-16,5,0,0,72);
  reactor.addColorStop(0,"#d7fbff");reactor.addColorStop(.2,"#34aed5");reactor.addColorStop(.56,"#123d74");reactor.addColorStop(1,"#040813");
  ctx.fillStyle=reactor;ctx.shadowColor="#5ee7ff";ctx.shadowBlur=18;
  ctx.beginPath();ctx.arc(0,0,69,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle="#8f77ff";ctx.lineWidth=4;ctx.stroke();
  for(let i=0;i<16;i++){
    const a=i*Math.PI*2/16,r=57;
    const on=(i+Math.floor(lampPhase*5))%4!==0;
    ctx.fillStyle=on?(i%2?"#ffd956":"#5ee7ff"):"#172441";
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=on?10:0;
    ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,5.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();ctx.shadowBlur=0;

  // Slingshot panels behind the flippers.
  for(const side of [-1,1]){
    const cx=side<0?183:667;
    ctx.fillStyle="#070a12";ctx.strokeStyle="#ec4365";ctx.lineWidth=4;
    ctx.shadowColor="#ff4e75";ctx.shadowBlur=10;
    ctx.beginPath();
    if(side<0){ctx.moveTo(112,890);ctx.lineTo(210,785);ctx.lineTo(253,905);}else{ctx.moveTo(738,890);ctx.lineTo(640,785);ctx.lineTo(597,905);}
    ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.strokeStyle="#b67cff";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(cx-22*side,843);ctx.lineTo(cx+17*side,809);ctx.lineTo(cx+6*side,866);ctx.stroke();
  }

  // Directional inserts point toward missions and the reactor.
  const arrows=[
    [170,555,-.25,"#ffe35e"],[210,605,-.18,"#ffe35e"],[680,560,.22,"#5ee7ff"],
    [655,615,.15,"#5ee7ff"],[335,820,-.35,"#ff5c8b"],[515,820,.35,"#ff5c8b"]
  ];
  arrows.forEach((a,i)=>drawTriangleInsertV64(a[0],a[1],a[2],a[3],(i+Math.floor(lampPhase*4))%3!==0));

  // Rank ladder lights across the top-left playfield.
  ctx.font="900 8px system-ui";ctx.textAlign="center";
  ["C","E","L","C","S"].forEach((label,i)=>{
    const x=126+i*25,y=215;
    const on=i<=Math.min(4,Math.floor(score/10000));
    ctx.fillStyle=on?"#ffe35e":"#263251";ctx.shadowColor=on?"#ffe35e":"transparent";ctx.shadowBlur=on?9:0;
    ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#08101c";ctx.fillText(label,x,y+3);
  });
  ctx.shadowBlur=0;

  ctx.restore();
}

const baseResetV64=reset;
reset=function(){
  baseResetV64();
  spaceMissionV64.index=0;spaceMissionV64.targets.clear();spaceMissionV64.completed=0;
  spaceMissionV64.message="HIT THE THREE MISSION TARGETS";spaceMissionV64.flash=0;
  updateSpaceMissionPanelV64();
};

const baseDrawBoardV64=drawBoard;
drawBoard=function(){
  baseDrawBoardV64();
  drawSpaceTableOverlayV64();
};

resetBtn?.addEventListener("click",()=>{
  spaceMissionV64.index=0;spaceMissionV64.targets.clear();spaceMissionV64.completed=0;
  spaceMissionV64.message="HIT THE THREE MISSION TARGETS";spaceMissionV64.flash=0;
  updateSpaceMissionPanelV64();
});
