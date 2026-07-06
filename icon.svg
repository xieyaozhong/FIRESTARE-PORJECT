"use strict";

// ---------- Particles ----------
  function burst(x,y,color,count){
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, sp=60+Math.random()*260;
      particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,life:.4+Math.random()*.6,max:1,color,size:2+Math.random()*4});
    }
  }
  function updateParticles(dt){
    for(const p of particles){
      p.life-=dt;p.vy+=420*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    }
    for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);
  }

  // ---------- Input ----------
  function beginCharge(e){
    if(e){e.preventDefault();}
    if(ballsLeft<=0)return;
    charging=true;
    launchBtn.classList.add("active");
    audioCtx?.resume?.();
  }
  function releaseCharge(e){
    if(e){e.preventDefault();}
    if(!charging)return;
    charging=false;
    launchBtn.classList.remove("active");
    launch();
  }
  launchBtn.addEventListener("pointerdown",beginCharge);
  window.addEventListener("pointerup",releaseCharge);
  window.addEventListener("pointercancel",releaseCharge);
  canvas.addEventListener("pointerdown",e=>{
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*W/rect.width;
    if(x>745)beginCharge(e);
  });
  window.addEventListener("keydown",e=>{
    if(e.code==="Space" && !e.repeat){e.preventDefault();beginCharge();}
    if(e.key.toLowerCase()==="m")toggleSound();
    if(e.key.toLowerCase()==="a")toggleAuto();
    if(e.key.toLowerCase()==="f")toggleFullscreen();
  });
  window.addEventListener("keyup",e=>{
    if(e.code==="Space"){e.preventDefault();releaseCharge();}
  });

  function toggleAuto(){
    autoFire=!autoFire;
    autoTimer=.15;
    autoBtn.classList.toggle("active",autoFire);
    autoBtn.textContent=`自動發射：${autoFire?"開":"關"}`;
    showToast(autoFire?"自動發射已開啟":"自動發射已關閉");
  }
  function toggleSound(){
    muted=!muted;
    soundBtn.classList.toggle("active",!muted);
    soundBtn.textContent=`音效：${muted?"關":"開"}`;
    saveProgress();
    if(!muted)sound(660,.09,.03,"sine");
  }
  async function toggleFullscreen(){
    try{
      if(!document.fullscreenElement)await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch(_){ showToast("此瀏覽器目前不允許全螢幕"); }
  }
  autoBtn.addEventListener("click",toggleAuto);
  soundBtn.addEventListener("click",toggleSound);
  fullscreenBtn.addEventListener("click",toggleFullscreen);
  difficultySelect.addEventListener("change",()=>{
    difficulty=difficultySelect.value;
    applyDifficulty();
    saveProgress();
    showToast(`難度已切換：${difficultySelect.options[difficultySelect.selectedIndex].text}`);
    updateHUD();
  });

  addBtn.addEventListener("click",()=>{ballsLeft+=10;updateHUD();sound(660,.1,.03,"sine")});
  resetBtn.addEventListener("click",reset);

  function reset(){
    balls.length=0;particles.length=0;
    score=0;ballsLeft=30;bestCombo=0;activeCombo=0;charge=0;
    fever.value=0;fever.active=false;fever.timer=0;
    autoFire=false;autoBtn.classList.remove("active");autoBtn.textContent="自動發射：關";
    missionBase.score=0;
    jackpotFlash=0;
    feature.mode="idle";feature.cooldown=0;feature.transition=0;feature.tier="NONE";
    slot.spinning=false;slot.evaluated=false;slot.elapsed=0;slot.qualified=false;slot.tier="NONE";slot.message="HIT START";
    slot.result=[0,1,4];
    slot.reels.forEach((reel,i)=>{reel.pos=slot.result[i];reel.stopped=true;});
    crank.running=false;crank.stage=0;crank.timer=0;crank.message="WAITING";crank.tier="STANDARD";
    crank.passChance=enhancedCrank([0.67,0.48,0.28]);crank.finalPrize=3000;crank.extraBalls=15;
    crank.outcome=[false,false,false];
    crank.stages.forEach((stage,i)=>{
      stage.diskAngle=.2+i*.9;stage.ballAngle=1.2+i;stage.orbit=70+i*7;
      stage.speed=(i%2===0?1:-1)*(1.78-i*.23);stage.resolved=false;
    });
    updateHUD();
  }
  function updateHUD(){
    if(score>highScore){
      highScore=score;
      if(highScore>=1000)unlock("score-1000","單局突破 1000 分");
      saveProgress();
    }
    scoreEl.textContent=String(score).padStart(6,"0");
    highScoreEl.textContent=String(highScore).padStart(6,"0");
    ballsEl.textContent=ballsLeft;
    comboEl.textContent=bestCombo;
    feverFill.style.width=`${fever.active?100:fever.value}%`;
    feverText.textContent=fever.active?`FEVER 剩餘 ${fever.timer.toFixed(1)} 秒`:`${Math.floor(fever.value)} / 100`;
    feverCard.classList.toggle("active",fever.active);
    launchStat.textContent=lifetime.launches;
    startStat.textContent=lifetime.starts;
    jackpotStat.textContent=lifetime.jackpots;
    const mission=missions[missionIndex];
    const progress=Math.min(mission.target,missionProgress());
    missionText.textContent=`${mission.name}（${Math.floor(progress)} / ${mission.target}）｜獎勵 ${Math.round(mission.reward*difficulties[difficulty].prize)} 分＋${mission.balls} 顆`;
    missionFill.style.width=`${Math.min(100,progress/mission.target*100)}%`;
    soundBtn.textContent=`音效：${muted?"關":"開"}`;
    soundBtn.classList.toggle("active",!muted);
  }
