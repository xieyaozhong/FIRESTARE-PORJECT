"use strict";

// V6.2 entry-routing patch.
// The former spring-guard roof prevented many launched balls from reaching the
// pin field. This patch keeps the outer safety cage but opens the top throat and
// replaces the blocking roof with short inward-facing return rails.

const baseBuildBoardV62=buildBoard;
buildBoard=function(){
  baseBuildBoardV62();

  // Remove the long V6 spring-guard roof and the older over-reaching guards.
  // The invisible V6.1 safety boundary remains in place, so escape prevention
  // is preserved without sealing the entrance to the pin field.
  for(let i=segments.length-1;i>=0;i--){
    if(segments[i].kind==="spring-guard")segments.splice(i,1);
  }

  // Short side return rails: they only catch outward-moving balls near the
  // cabinet edges and leave the central descent route completely open.
  addSegment(82,348,122,322,.96,"spring-guard");
  addSegment(82,548,124,520,.96,"spring-guard");
  addSegment(82,748,132,716,1.00,"spring-guard");
  addSegment(768,348,728,322,.96,"spring-guard");
  addSegment(768,548,726,520,.96,"spring-guard");
  addSegment(768,748,718,716,1.00,"spring-guard");

  // Bottom corner kickbacks stay compact and point balls toward the centre.
  addSegment(88,878,150,846,1.04,"spring-guard");
  addSegment(762,878,700,846,1.04,"spring-guard");

  // A wide, low-energy funnel under the launch exit. Unlike the previous roof,
  // these guides slope downward into the first pin rows instead of back upward.
  addSegment(548,132,514,166,.78,"entry-guide");
  addSegment(514,166,486,205,.76,"entry-guide");
  addSegment(652,136,680,176,.76,"entry-guide");
};

const baseBallUpdateV62=Ball.prototype.update;
Ball.prototype.update=function(dt){
  baseBallUpdateV62.call(this,dt);
  if(!this.alive)return;

  // Gentle directional assistance only inside the launch-entry throat.
  // It prevents repeated ceiling loops while remaining far weaker than gravity,
  // bumpers or flippers once the ball has entered the pin field.
  const inEntry=this.x>475&&this.x<750&&this.y>72&&this.y<270;
  if(inEntry){
    this.entryGuideTime=(this.entryGuideTime||0)+dt;
    const settled=Math.min(1,this.entryGuideTime/.65);
    this.vx-=95*settled*dt;
    this.vy+=175*settled*dt;

    if(this.entryGuideTime>1.1){
      this.vx-=55*dt;
      this.vy+=240*dt;
    }
    capBallSpeedV61(this,1550);
  }else{
    this.entryGuideTime=Math.max(0,(this.entryGuideTime||0)-dt*2.5);
  }
};

function drawEntryRouteV62(){
  ctx.save();
  ctx.globalAlpha=.58;
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="900 10px system-ui";
  ctx.fillStyle="#9eefff";
  ctx.shadowColor="#59e7ff";
  ctx.shadowBlur=8;
  ctx.fillText("PIN FIELD ENTRY",570,145);

  for(let i=0;i<3;i++){
    const x=575-i*24;
    const y=166+i*28;
    ctx.beginPath();
    ctx.moveTo(x-9,y-5);
    ctx.lineTo(x,y+7);
    ctx.lineTo(x+9,y-5);
    ctx.strokeStyle="#7eefff";
    ctx.lineWidth=3;
    ctx.lineCap="round";
    ctx.stroke();
  }
  ctx.restore();
}

const baseDrawBoardV62=drawBoard;
drawBoard=function(){
  baseDrawBoardV62();
  drawEntryRouteV62();
};
