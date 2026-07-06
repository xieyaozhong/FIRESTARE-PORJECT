"use strict";

// V6.5 perimeter rebound layout.
// Keeps the V6 mechanical + golden-ball systems, removes the upper blocking
// guards, and replaces rigid edge baffles with distributed elastic bumpers.
const PERIMETER_COLORS_V65=["#59e7ff","#ff5ea8","#ffd66b","#69ffb5"];

const baseBuildBoardV65=buildBoard;
buildBoard=function(){
  baseBuildBoardV65();

  // Remove every added rigid spring guard and the rendered safety-cage segments.
  // The positional containment logic from V6.1 still keeps balls inside safely.
  for(let i=segments.length-1;i>=0;i--){
    const s=segments[i];
    const upperGuide=s.kind==="guide" && Math.max(s.y1,s.y2)<175;
    if(s.kind==="spring-guard" || s.kind==="safety-boundary" || upperGuide){
      segments.splice(i,1);
    }
  }

  // Open launch exit: two short lips steer the ball inward without forming a roof.
  addSegment(616,98,584,113,.72,"entry-lip");
  addSegment(584,113,557,137,.70,"entry-lip");

  // Elastic objects placed around the perimeter. The central reel/crank module,
  // golden lock, START target, and lower score lanes remain unobstructed.
  const layout=[
    {x:112,y:252,r:19,power:1.18,label:"",color:0},
    {x:170,y:205,r:17,power:1.16,label:"",color:2},
    {x:694,y:235,r:18,power:1.18,label:"",color:1},
    {x:735,y:300,r:20,power:1.20,label:"",color:3},
    {x:105,y:360,r:21,power:1.22,label:"",color:1},
    {x:106,y:485,r:20,power:1.20,label:"",color:0},
    {x:107,y:615,r:22,power:1.23,label:"",color:2},
    {x:110,y:750,r:21,power:1.22,label:"",color:3},
    {x:145,y:850,r:23,power:1.25,label:"L",color:1},
    {x:730,y:410,r:20,power:1.20,label:"",color:2},
    {x:731,y:535,r:21,power:1.22,label:"",color:0},
    {x:730,y:660,r:22,power:1.23,label:"",color:1},
    {x:724,y:790,r:21,power:1.22,label:"",color:3},
    {x:690,y:858,r:23,power:1.25,label:"R",color:0},
    {x:220,y:875,r:18,power:1.17,label:"",color:2},
    {x:630,y:875,r:18,power:1.17,label:"",color:2}
  ];

  for(const item of layout){
    for(let i=pins.length-1;i>=0;i--){
      if(Math.hypot(pins[i].x-item.x,pins[i].y-item.y)<item.r+18)pins.splice(i,1);
    }
    bumpers.push({
      x:item.x,y:item.y,r:item.r,power:item.power,
      color:PERIMETER_COLORS_V65[item.color],flash:0,label:item.label,
      perimeterRebound:true
    });
  }
};

// Keep the full strength range, but raise the minimum launch impulse enough for
// even a light press to complete the original curved launch rail.
const baseLaunchV65=launch;
launch=function(){
  const before=balls.length;
  const requested=Math.max(.05,charge);
  baseLaunchV65();
  const spawned=balls.slice(before);
  spawned.forEach((ball,index)=>{
    const spread=(index-(spawned.length-1)/2)*34;
    ball.vy=-(1500+requested*650+Math.random()*24);
    ball.vx=-24-requested*34+spread;
  });
};

// Invisible one-way return at the launch-lane crown. It replaces the removed
// upper baffle: balls are nudged into the open pin field without drawing a wall.
const baseBallUpdateV65=Ball.prototype.update;
Ball.prototype.update=function(dt){
  baseBallUpdateV65.call(this,dt);
  if(!this.alive)return;

  if(this.x>752 && this.y<365){
    this.perimeterEntryAge=(this.perimeterEntryAge||0)+dt;
    this.vx-=520*dt;
    this.vy+=150*dt;

    if(this.y<145 || this.perimeterEntryAge>.42){
      this.x=736;
      this.y=Math.max(178,Math.min(250,this.y));
      this.vx=-245-Math.random()*55;
      this.vy=150+Math.random()*55;
      this.spin*=.72;
      this.perimeterEntryAge=0;
    }
  }else{
    this.perimeterEntryAge=Math.max(0,(this.perimeterEntryAge||0)-dt*3);
  }
};

// Slightly soften repeated bumper hits so a ball stays lively but does not gain
// exponential speed after touching several perimeter objects in succession.
const baseCollideBallCircleV65=collideBallCircle;
collideBallCircle=function(ball,obj,restitution=.82,power=1,isBumper=false){
  const appliedPower=obj?.perimeterRebound?Math.min(power,1.20):power;
  baseCollideBallCircleV65(ball,obj,restitution,appliedPower,isBumper);
  if(obj?.perimeterRebound && typeof capBallSpeedV61==="function"){
    capBallSpeedV61(ball,1580);
  }
};

function drawPerimeterGuideV65(){
  ctx.save();
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="900 10px system-ui";
  ctx.fillStyle="#9edfff";
  ctx.shadowColor="#59e7ff";
  ctx.shadowBlur=8;
  ctx.fillText("OPEN PIN FIELD",584,153);
  ctx.shadowBlur=0;

  for(let i=0;i<3;i++){
    const x=610-i*22,y=168+i*16;
    ctx.strokeStyle="#8beaff";
    ctx.lineWidth=2.5;
    ctx.lineCap="round";
    ctx.beginPath();
    ctx.moveTo(x-7,y-5);ctx.lineTo(x,y+5);ctx.lineTo(x+7,y-5);ctx.stroke();
  }
  ctx.restore();
}

const baseDrawBoardV65=drawBoard;
drawBoard=function(){
  baseDrawBoardV65();
  drawPerimeterGuideV65();
};
