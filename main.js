"use strict";

function physicsStep(dt){
  if(toastTimer>0){
    toastTimer-=dt;
    if(toastTimer<=0)toastEl.classList.remove("show");
  }
  if(fever.active){
    fever.timer-=dt;
    if(fever.timer<=0){
      fever.active=false;fever.timer=0;fever.value=0;
      showToast("FEVER 結束");
    }
  }
  if(autoFire && !charging && ballsLeft>0 && balls.filter(b=>b.alive).length<MAX_BALLS_ON_BOARD){
    autoTimer-=dt;
    if(autoTimer<=0){
      charge=.52+Math.random()*.42;
      launch();
      autoTimer=.55+Math.random()*.50;
    }
  }
  if(charging){
    charge += chargeDirection*dt*.72;
    if(charge>=1){charge=1;chargeDirection=-1;}
    if(charge<=0){charge=0;chargeDirection=1;}
  }
  powerFill.style.width=(charge*100).toFixed(0)+"%";
  powerText.textContent=(charge*100).toFixed(0)+"%";
  lampPhase+=dt;
  jackpotFlash=Math.max(0,jackpotFlash-dt);
  updateFeature(dt);
  shake*=Math.pow(.03,dt);
  if(Math.floor(lampPhase*10)!==Math.floor((lampPhase-dt)*10))updateHUD();
  for(const b of balls)if(b.alive)b.update(dt);
  for(let i=balls.length-1;i>=0;i--)if(!balls[i].alive)balls.splice(i,1);
  updateParticles(dt);
}

function frame(now){
  const delta=Math.min(.035,(now-lastTime)/1000);
  lastTime=now;accumulator+=delta;
  while(accumulator>=FIXED_DT){
    physicsStep(FIXED_DT);
    accumulator-=FIXED_DT;
  }
  ctx.save();
  const sx=(Math.random()-.5)*shake, sy=(Math.random()-.5)*shake;
  ctx.translate(sx,sy);
  drawBoard();drawBalls();drawParticles();drawOverlay();
  ctx.restore();
  requestAnimationFrame(frame);
}

safeLoad();
buildBoard();
updateHUD();
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
requestAnimationFrame(frame);
