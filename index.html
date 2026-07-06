"use strict";

function shortestAngle(from,to){
    let d=(to-from+Math.PI)%(Math.PI*2)-Math.PI;
    if(d<-Math.PI)d+=Math.PI*2;
    return d;
  }

  function chooseSlotResult(){
    const boost=difficulties[difficulty].slotBoost*(fever.active?1.35:1);
    const r=Math.random();
    if(r<0.020*boost) return [3,3,3];
    if(r<0.050*boost) return [5,5,5];
    if(r<0.095*boost) return [4,4,4];
    if(r<0.150*boost) return [2,2,2];
    if(r<0.225*boost) return [1,1,1];
    if(r<0.315*boost) return [0,0,0];
    if(r<Math.min(.72,.610+(boost-1)*.18)){
      const pair=Math.floor(Math.random()*slotSymbols.length);
      const odd=(pair+1+Math.floor(Math.random()*(slotSymbols.length-1)))%slotSymbols.length;
      const result=[pair,pair,odd];
      result.sort(()=>Math.random()-.5);
      return result;
    }
    return [0,0,0].map(()=>Math.floor(Math.random()*slotSymbols.length));
  }

  function startFeature(){
    if(feature.mode!=="idle" || feature.cooldown>0)return;
    feature.mode="slot";
    feature.transition=0;
    lifetime.starts++;
    addFever(8);
    if(lifetime.starts===1)unlock("first-start","第一次啟動 START");
    checkMission();
    saveProgress();
    slot.spinning=true;
    slot.evaluated=false;
    slot.elapsed=0;
    slot.qualified=false;
    slot.tier="NONE";
    slot.message="SPINNING";
    slot.result=chooseSlotResult();
    slot.reels.forEach((reel,i)=>{
      reel.stopped=false;
      reel.speed=16+i*3+Math.random()*2;
      reel.pos=(reel.pos%slotSymbols.length+slotSymbols.length)%slotSymbols.length;
    });
    sound(170,.18,.055,"sawtooth");
    setTimeout(()=>sound(245,.12,.035,"square"),90);
    burst(425,280,"#ff5ea8",20);
  }

  function evaluateSlot(){
    if(slot.evaluated)return;
    slot.evaluated=true;
    const [a,b,c]=slot.result;
    let immediate=20;
    let extra=0;

    if(a===b && b===c){
      slot.qualified=true;

      if(a===3){
        slot.tier="LEGEND";
        slot.message="777 • LEGEND GATE";
        crank.passChance=enhancedCrank([0.90,0.76,0.56]);
        crank.finalPrize=6000;
        crank.extraBalls=30;
        immediate=1000;
        extra=5;
      }else if(a===5 || a===4){
        slot.tier="GOLD";
        slot.message=(a===5?"DIAMOND":"STAR")+" • GOLD GATE";
        crank.passChance=enhancedCrank([0.83,0.66,0.43]);
        crank.finalPrize=4500;
        crank.extraBalls=22;
        immediate=a===5?700:500;
        extra=a===5?4:3;
      }else{
        slot.tier="SILVER";
        slot.message=slotSymbols[a].name+" • SILVER GATE";
        crank.passChance=enhancedCrank([0.75,0.56,0.34]);
        crank.finalPrize=3200;
        crank.extraBalls=16;
        immediate=250;
        extra=2;
      }
    }else if(a===b || b===c || a===c){
      slot.qualified=true;
      slot.tier="CHANCE";
      slot.message="PAIR • CHANCE GATE";
      crank.passChance=enhancedCrank([0.66,0.46,0.25]);
      crank.finalPrize=2200;
      crank.extraBalls=10;
      immediate=80;
      extra=1;
    }else{
      slot.qualified=false;
      slot.tier="MISS";
      slot.message="NO GATE  +20";
      immediate=20;
    }

    immediate=Math.round(immediate*difficulties[difficulty].prize);
    score+=immediate;
    ballsLeft+=extra;
    addFever(Math.min(18,immediate/55));
    feature.tier=slot.tier;
    feature.transition=1.25;
    checkMission();
    updateHUD();

    if(slot.qualified){
      sound(slot.tier==="LEGEND"?1050:720,.22,.06,"square");
      burst(425,305,slot.tier==="LEGEND"?"#ff3d7f":"#ffd66b",slot.tier==="LEGEND"?55:30);
      shake=slot.tier==="LEGEND"?12:7;
    }else{
      sound(220,.22,.035,"sawtooth");
      shake=4;
    }
  }

  function updateSlot(dt){
    if(!slot.spinning)return;
    slot.elapsed+=dt;
    const stopStarts=[1.00,1.48,1.96];
    const stopDuration=.46;

    slot.reels.forEach((reel,i)=>{
      if(reel.stopped)return;
      const local=slot.elapsed-stopStarts[i];
      if(local<0){
        reel.pos+=reel.speed*dt;
      }else if(local<stopDuration){
        const t=local/stopDuration;
        reel.pos+=reel.speed*(1-t)*(1-t)*dt;
      }else{
        reel.pos=slot.result[i];
        reel.stopped=true;
        sound(340+i*105,.08,.04,"square");
        shake=Math.max(shake,3);
      }
    });

    if(slot.reels.every(r=>r.stopped)){
      slot.spinning=false;
      evaluateSlot();
    }
  }

  function chooseCrankOutcome(){
    const result=[false,false,false];
    result[0]=Math.random()<crank.passChance[0];
    result[1]=result[0] && Math.random()<crank.passChance[1];
    result[2]=result[1] && Math.random()<crank.passChance[2];
    return result;
  }

  function startCrank(tier){
    feature.mode="crank";
    feature.transition=0;
    crank.running=true;
    crank.stage=0;
    crank.timer=0;
    crank.tier=tier;
    crank.message=tier+" • LEVEL 1";
    crank.outcome=chooseCrankOutcome();

    crank.stages.forEach((stage,i)=>{
      stage.diskAngle=Math.random()*Math.PI*2;
      stage.ballAngle=Math.random()*Math.PI*2;
      stage.orbit=70+i*7;
      stage.speed=(i%2===0?1:-1)*(1.78-i*.23);
      stage.resolved=false;
      const pass=crank.outcome[i];
      stage.targetHole=pass ? 0 : 1+Math.floor(Math.random()*5);
      crank.targetHole[i]=stage.targetHole;
    });

    sound(145,.22,.06,"sawtooth");
    setTimeout(()=>sound(205,.14,.04,"square"),100);
    burst(425,470,"#69ffb5",26);
  }

  function finishCrank(success,failedStage=2){
    crank.running=false;
    feature.mode="result";
    feature.transition=1.65;
    feature.cooldown=1.0;

    if(success){
      const finalReward=Math.round(crank.finalPrize*difficulties[difficulty].prize);
      score+=finalReward;
      ballsLeft+=crank.extraBalls;
      crank.finalPrize=finalReward;
      lifetime.jackpots++;
      addFever(30);
      unlock("first-jackpot","第一次完成三層 JACKPOT");
      checkMission();
      saveProgress();
      crank.message=`${crank.tier} JACKPOT +${crank.finalPrize}`;
      jackpotFlash=3.2;
      shake=17;
      burst(425,620,crank.tier==="LEGEND"?"#ff2d75":"#ffd66b",110);
      sound(784,.25,.075,"square");
      setTimeout(()=>sound(1046,.28,.07,"square"),100);
      setTimeout(()=>sound(1318,.35,.065,"square"),220);
      setTimeout(()=>sound(1568,.42,.06,"square"),350);
    }else{
      const base=[40,180,650];
      const multiplier=crank.tier==="LEGEND"?2:crank.tier==="GOLD"?1.5:1;
      const prize=Math.round(base[failedStage]*multiplier);
      const extras=[0,1,4];
      score+=prize;
      ballsLeft+=extras[failedStage];
      crank.message=`LEVEL ${failedStage+1} MISS +${prize}`;
      shake=7+failedStage*2;
      burst(425,485+failedStage*104,"#ffd66b",24+failedStage*12);
      sound(260-failedStage*25,.24,.045,"sawtooth");
    }
    updateHUD();
  }

  function updateCrank(dt){
    crank.stages.forEach((stage,i)=>{
      const idleFactor=crank.running ? 1 : .24;
      stage.diskAngle+=stage.speed*idleFactor*dt;
    });
    if(!crank.running)return;

    crank.timer+=dt;
    const stage=crank.stages[crank.stage];
    const settleStart=1.72;
    const resolveAt=2.72;

    if(crank.timer<settleStart){
      const orbitSpeed=5.8-crank.stage*.55;
      stage.ballAngle+=orbitSpeed*dt;
      stage.orbit=Math.max(42,stage.orbit-10.8*dt);
    }else{
      const targetWorld=stage.diskAngle+stage.targetHole*(Math.PI*2/6);
      const pull=Math.min(1,(crank.timer-settleStart)/(resolveAt-settleStart));
      stage.ballAngle+=shortestAngle(stage.ballAngle,targetWorld)*dt*(2.9+pull*8.6);
      stage.orbit=Math.max(33,stage.orbit-22*dt);
      stage.speed*=Math.pow(.23,dt);
    }

    if(crank.timer>=resolveAt && !stage.resolved){
      stage.resolved=true;
      const passed=crank.outcome[crank.stage];

      if(passed){
        stage.ballAngle=stage.diskAngle;
        sound(690+crank.stage*130,.16,.055,"triangle");
        burst(425,485+crank.stage*104,"#69ffb5",34);
        shake=9;

        if(crank.stage===2){
          finishCrank(true);
        }else{
          crank.stage++;
          crank.timer=0;
          crank.message=crank.stage===2 ? crank.tier+" • FINAL" : crank.tier+` • LEVEL ${crank.stage+1}`;
          const next=crank.stages[crank.stage];
          next.ballAngle=Math.random()*Math.PI*2;
          next.orbit=70+crank.stage*7;
          setTimeout(()=>sound(410+crank.stage*100,.12,.04,"square"),80);
        }
      }else{
        finishCrank(false,crank.stage);
      }
    }
  }

  function updateFeature(dt){
    feature.cooldown=Math.max(0,feature.cooldown-dt);

    if(feature.mode==="slot"){
      updateSlot(dt);
      if(!slot.spinning && slot.evaluated && feature.transition>0){
        feature.transition-=dt;
        if(feature.transition<=0){
          if(slot.qualified){
            startCrank(slot.tier);
          }else{
            feature.mode="idle";
            feature.cooldown=.75;
            slot.message="HIT START";
          }
        }
      }
    }else if(feature.mode==="crank"){
      updateCrank(dt);
    }else{
      updateCrank(dt);
      if(feature.mode==="result" && feature.transition>0){
        feature.transition-=dt;
        if(feature.transition<=0){
          feature.mode="idle";
          slot.message="HIT START";
          crank.message="WAITING";
        }
      }
    }
  }

  function award(pocket,x,y){
    if(pocket.slot){
      score+=25;
      activeCombo=0;
      shake=6;
      burst(x,y,"#ff5ea8",24);
      startFeature();
      updateHUD();
      return;
    }
    score += Math.round(pocket.value*difficulties[difficulty].prize);
    addFever(Math.max(1,pocket.value/18));
    activeCombo=0;
    shake = pocket.value>=100 ? 9 : 4;
    if(pocket.value===500){
      jackpotFlash=2.2;
      sound(880,.22,.07,"square");
      setTimeout(()=>sound(1175,.25,.06,"square"),90);
      setTimeout(()=>sound(1568,.32,.05,"square"),180);
      burst(x,y,"#ff5ea8",50);
    }else{
      sound(520+pocket.value*2,.12,.04,"sine");
      burst(x,y,pocket.value>=100?"#ffd66b":"#59e7ff",18);
    }
    checkMission();
    updateHUD();
  }
