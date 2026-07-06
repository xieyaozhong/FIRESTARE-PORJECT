"use strict";

// V6.1 containment patch: keeps the energetic mechanical playfield while
// preventing high-speed balls from tunnelling through rails or leaving the cabinet.
const BALL_MAX_SPEED_V61=1820;
const BALL_ESCAPE_BOUNDS_V61={left:68,right:832,top:68,bottom:1110};

const baseBuildBoardV61=buildBoard;
buildBoard=function(){
  baseBuildBoardV61();

  // Invisible safety cage outside the visible cabinet.
  addSegment(58,58,842,58,.76,"safety-boundary");
  addSegment(58,58,58,1120,.74,"safety-boundary");
  addSegment(842,58,842,1120,.74,"safety-boundary");
  addSegment(58,1120,842,1120,.62,"safety-boundary");

  // Keep the special targets energetic without allowing exponential speed growth.
  for(const bumper of bumpers){
    if(bumper.label==="K")bumper.power=Math.min(bumper.power,1.22);
    if(bumper.triggerGold)bumper.power=Math.min(bumper.power,1.26);
  }
};

function capBallSpeedV61(ball,maxSpeed=BALL_MAX_SPEED_V61){
  const speed=Math.hypot(ball.vx,ball.vy);
  if(speed>maxSpeed){
    const scale=maxSpeed/speed;
    ball.vx*=scale;
    ball.vy*=scale;
  }
}

function containBallV61(ball){
  const b=BALL_ESCAPE_BOUNDS_V61;
  let recovered=false;

  if(ball.x-ball.r<b.left){
    ball.x=b.left+ball.r;
    ball.vx=Math.abs(ball.vx)*.72+18;
    recovered=true;
  }else if(ball.x+ball.r>b.right){
    ball.x=b.right-ball.r;
    ball.vx=-Math.abs(ball.vx)*.72-18;
    recovered=true;
  }

  if(ball.y-ball.r<b.top){
    ball.y=b.top+ball.r;
    ball.vy=Math.abs(ball.vy)*.68+24;
    recovered=true;
  }

  // Scoring pockets remain open. The bottom recovery only protects the launch lane.
  if(ball.y+ball.r>b.bottom && ball.x>760){
    ball.y=b.bottom-ball.r;
    ball.vy=-Math.abs(ball.vy)*.52;
    recovered=true;
  }

  if(recovered){
    ball.spin*=.72;
    capBallSpeedV61(ball,1450);
  }
}

function integrateBallSubstepV61(ball,step){
  ball.vy+=gravity*step;
  ball.vx*=Math.pow(.9993,step*120);
  ball.vy*=Math.pow(.9996,step*120);
  ball.spin*=Math.pow(.997,step*120);
  ball.x+=ball.vx*step;
  ball.y+=ball.vy*step;

  const speed=Math.hypot(ball.vx,ball.vy);
  if(speed>80){
    const magnus=Math.max(-18,Math.min(18,ball.spin*speed*.002));
    ball.vx+=(-ball.vy/speed)*magnus*step;
    ball.vy+=(ball.vx/speed)*magnus*step;
  }

  for(const segment of segments)collideBallSegment(ball,segment);
  for(const pin of pins)collideBallCircle(ball,pin,.83,1,false);
  for(const bumper of bumpers)collideBallCircle(ball,bumper,.90,bumper.power,true);
  collideBallMechanismsV6(ball);

  capBallSpeedV61(ball);
  containBallV61(ball);
}

// Split fast travel into up to six smaller collision steps. This is the key fix
// for a ball crossing a complete wall between two 120 Hz frames.
Ball.prototype.update=function(dt){
  this.multiplier=this.golden?10:(this.multiplier||1);
  this.age+=dt;
  this.lastHit-=dt;

  const travel=Math.hypot(this.vx,this.vy)*dt;
  const maxTravel=Math.max(4,this.r*.48);
  const substeps=Math.max(1,Math.min(6,Math.ceil(travel/maxTravel)));
  const step=dt/substeps;
  for(let i=0;i<substeps&&this.alive;i++)integrateBallSubstepV61(this,step);

  if(this.y>1099&&this.x>760){
    this.y=1099;
    if(this.vy>0)this.vy*=-.42;
  }

  if(this.y>1050&&this.x<765){
    const pocket=pockets.find(item=>this.x>=item.x0&&this.x<item.x1);
    if(pocket){
      award(pocket,this.x,this.y,this);
      this.alive=false;
    }
  }

  if(this.y>1220||this.x<-80||this.x>980||this.age>(this.golden?32:24)){
    this.alive=false;
    activeCombo=0;
  }

  if(this.age%0.035<dt){
    this.trail.push({x:this.x,y:this.y,a:.35});
    if(this.trail.length>10)this.trail.shift();
  }
  for(const point of this.trail)point.a*=.89;
};
