"use strict";

const ENTRY_LEFT_V63=620;
const ENTRY_RIGHT_V63=748;
const ENTRY_TOP_V63=92;
const ENTRY_BOTTOM_V63=338;

const baseBuildBoardV63=buildBoard;
buildBoard=function(){
  baseBuildBoardV63();

  for(let i=segments.length-1;i>=0;i--){
    const s=segments[i];
    const oldTopGuide=s.kind==="guide"&&(
      (Math.abs(s.x1-620)<2&&Math.abs(s.y1-96)<2)||
      (Math.abs(s.x1-565)<2&&Math.abs(s.y1-112)<2)
    );
    if(s.kind==="entry-guide"||s.kind==="spring-guard"||oldTopGuide)segments.splice(i,1);
  }

  addSegment(608,43,600,96,.82,"launch-chute");
  addSegment(600,96,610,146,.80,"launch-chute");
  addSegment(610,146,626,198,.78,"launch-chute");
  addSegment(626,198,626,292,.76,"launch-chute");

  addSegment(641,95,684,109,.82,"launch-chute");
  addSegment(684,109,720,145,.80,"launch-chute");
  addSegment(720,145,744,194,.78,"launch-chute");
  addSegment(744,194,744,292,.76,"launch-chute");

  addSegment(626,292,648,322,.72,"entry-throat");
  addSegment(744,292,722,322,.72,"entry-throat");

  addSegment(82,360,122,334,.94,"spring-guard");
  addSegment(82,560,124,532,.94,"spring-guard");
  addSegment(82,760,132,728,.98,"spring-guard");
  addSegment(768,360,728,334,.94,"spring-guard");
  addSegment(768,560,726,532,.94,"spring-guard");
  addSegment(768,760,718,728,.98,"spring-guard");
  addSegment(88,878,150,846,1.02,"spring-guard");
  addSegment(762,878,700,846,1.02,"spring-guard");

  const entryPins=[
    [646,338],[684,338],[722,338],
    [665,374],[703,374],
    [646,410],[684,410],[722,410]
  ];
  for(const [x,y] of entryPins){
    const occupied=pins.some(p=>Math.hypot(p.x-x,p.y-y)<15);
    if(!occupied)pins.push({x,y,r:6.2,flash:0,entryPin:true});
  }

  const rightSpinner=mechanismsV6.find(m=>m.type==="spinner"&&m.x>500);
  if(rightSpinner){rightSpinner.x=694;rightSpinner.y=470;rightSpinner.length=44;}
};

if(typeof drawEntryRouteV62==="function")drawEntryRouteV62=function(){};

const baseLaunchV63=launch;
launch=function(){
  const before=balls.length;
  const launchPower=Math.max(.05,charge);
  baseLaunchV63();
  const spawned=balls.slice(before);

  spawned.forEach((ball,index)=>{
    const offset=(index-(spawned.length-1)/2)*14;
    ball.vx=-22-launchPower*24+offset;
    ball.vy=-(1450+launchPower*430+Math.random()*30);
    ball.entryPhase="launch";
    ball.entryAge=0;
    ball.entryTargetX=670+index*18;
    ball.hasEnteredPins=false;
  });
};

const baseBallUpdateV63=Ball.prototype.update;
Ball.prototype.update=function(dt){
  baseBallUpdateV63.call(this,dt);
  if(!this.alive||this.entryPhase!=="launch")return;

  this.entryAge+=dt;

  if(this.y<ENTRY_BOTTOM_V63){
    if(this.x<ENTRY_LEFT_V63){
      this.x=ENTRY_LEFT_V63;
      this.vx=Math.abs(this.vx)*.42+28;
    }else if(this.x>ENTRY_RIGHT_V63){
      this.x=ENTRY_RIGHT_V63;
      this.vx=-Math.abs(this.vx)*.42-28;
    }

    const target=this.entryTargetX||684;
    this.vx+=(target-this.x)*2.8*dt;
    this.vy+=235*dt;
    capBallSpeedV61(this,1500);
  }

  if(this.y>=320&&this.x>=615&&this.x<=755){
    this.entryPhase="pins";
    this.hasEnteredPins=true;
    this.vy=Math.max(this.vy,185);
    return;
  }

  if(this.entryAge>1.05){
    this.x=Math.max(642,Math.min(724,this.entryTargetX||684));
    this.y=306;
    this.vx=(Math.random()-.5)*70;
    this.vy=245+Math.random()*35;
    this.spin*=.6;
    this.entryPhase="pins";
    this.hasEnteredPins=true;
  }
};

function drawLaunchChuteV63(){
  ctx.save();

  const channel=ctx.createLinearGradient(600,70,744,330);
  channel.addColorStop(0,"#07101a");
  channel.addColorStop(.48,"#12263b");
  channel.addColorStop(1,"#071018");
  ctx.fillStyle=channel;
  ctx.globalAlpha=.78;
  ctx.beginPath();
  ctx.moveTo(608,54);ctx.lineTo(641,94);ctx.lineTo(684,110);ctx.lineTo(720,145);
  ctx.lineTo(744,194);ctx.lineTo(744,292);ctx.lineTo(722,322);ctx.lineTo(648,322);
  ctx.lineTo(626,292);ctx.lineTo(626,198);ctx.lineTo(610,146);ctx.lineTo(600,96);
  ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;

  for(const s of segments){
    if(s.kind!=="launch-chute"&&s.kind!=="entry-throat")continue;
    const metal=ctx.createLinearGradient(s.x1,s.y1,s.x2,s.y2);
    metal.addColorStop(0,"#243247");
    metal.addColorStop(.34,"#edf6ff");
    metal.addColorStop(.58,"#67dfff");
    metal.addColorStop(1,"#263143");
    ctx.strokeStyle=metal;
    ctx.lineWidth=s.kind==="entry-throat"?9:11;
    ctx.lineCap="round";
    ctx.shadowColor="#59e7ff";
    ctx.shadowBlur=12;
    ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();
  }
  ctx.shadowBlur=0;

  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="1000 11px system-ui";
  ctx.fillStyle="#baf7ff";
  ctx.shadowColor="#59e7ff";
  ctx.shadowBlur=10;
  ctx.fillText("100% PIN ENTRY",685,270);
  ctx.shadowBlur=0;

  for(let i=0;i<3;i++){
    const y=286+i*12;
    ctx.strokeStyle="#7eefff";
    ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(677,y-4);ctx.lineTo(685,y+4);ctx.lineTo(693,y-4);ctx.stroke();
  }

  ctx.restore();
}

const baseDrawBoardV63=drawBoard;
drawBoard=function(){
  baseDrawBoardV63();
  drawLaunchChuteV63();
};
