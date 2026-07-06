"use strict";

function drawHybridFeature(){
  const cx=425;
  ctx.save();
  const sx=248,sy=170,sw=354,sh=220;
  const outer=ctx.createLinearGradient(sx,sy,sx+sw,sy+sh);
  outer.addColorStop(0,"#4a2708");
  outer.addColorStop(.22,"#f6d66e");
  outer.addColorStop(.48,"#fff4b4");
  outer.addColorStop(.70,"#a66d1c");
  outer.addColorStop(1,"#281404");
  ctx.fillStyle=outer;
  ctx.shadowColor=feature.mode==="slot"?"#ff3c85":"#ffd66b";
  ctx.shadowBlur=feature.mode==="slot"?30:14;
  ctx.beginPath();ctx.roundRect(sx,sy,sw,sh,22);ctx.fill();
  ctx.shadowBlur=0;

  ctx.fillStyle="#080a0f";
  ctx.beginPath();ctx.roundRect(sx+9,sy+9,sw-18,sh-18,16);ctx.fill();
  ctx.strokeStyle="#ffffff35";ctx.lineWidth=2;ctx.stroke();

  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.font="1000 18px system-ui";
  ctx.fillStyle=feature.mode==="slot"?"#ff6ca1":"#ffe08a";
  ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;
  ctx.fillText("CHANCE REELS",cx,sy+27);
  ctx.shadowBlur=0;

  const reelY=sy+52,reelH=106,reelW=86,gap=10,firstX=sx+38;
  slot.reels.forEach((reel,i)=>{
    const rx=firstX+i*(reelW+gap);
    const centerY=reelY+reelH/2;
    const windowGrad=ctx.createLinearGradient(0,reelY,0,reelY+reelH);
    windowGrad.addColorStop(0,"#08090d");
    windowGrad.addColorStop(.22,"#e8e2c7");
    windowGrad.addColorStop(.50,"#ffffff");
    windowGrad.addColorStop(.78,"#e8e2c7");
    windowGrad.addColorStop(1,"#08090d");
    ctx.fillStyle=windowGrad;
    ctx.beginPath();ctx.roundRect(rx,reelY,reelW,reelH,9);ctx.fill();
    ctx.strokeStyle="#d7ad43";ctx.lineWidth=3;ctx.stroke();

    ctx.save();
    ctx.beginPath();ctx.roundRect(rx+3,reelY+3,reelW-6,reelH-6,6);ctx.clip();
    const total=slotSymbols.length;
    const base=Math.floor(reel.pos);
    const frac=reel.pos-base;
    for(let k=-2;k<=2;k++){
      const index=((base+k)%total+total)%total;
      const yy=centerY+(k-frac)*reelH;
      const symbol=slotSymbols[index].text;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=index===3?"#df1637":index===4?"#d89400":"#11141c";
      ctx.font=symbol==="BAR"?"1000 27px system-ui":"900 42px Apple Color Emoji, Segoe UI Emoji, system-ui";
      ctx.fillText(symbol,rx+reelW/2,yy);
    }
    ctx.restore();
    ctx.strokeStyle="#ff2f5c";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(rx+4,centerY);ctx.lineTo(rx+reelW-4,centerY);ctx.stroke();
  });

  ctx.fillStyle=feature.mode==="slot"?"#ff78a7":"#65e9ff";
  ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;
  ctx.font="1000 14px system-ui";
  ctx.fillText(slot.message,cx,sy+184);
  ctx.shadowBlur=0;

  for(let i=0;i<10;i++){
    const bx=sx+24+i*34;
    const on=feature.mode==="slot" || ((i+Math.floor(lampPhase*6))%3===0);
    ctx.fillStyle=on?"#fff2a2":"#574421";
    ctx.shadowColor=on?"#ffd66b":"transparent";ctx.shadowBlur=on?12:0;
    ctx.beginPath();ctx.arc(bx,sy+205,4.5,0,Math.PI*2);ctx.fill();
  }
  ctx.shadowBlur=0;

  const gateOpen=feature.mode==="crank" || feature.mode==="result";
  ctx.fillStyle=gateOpen?"#69ffb5":"#343b47";
  ctx.shadowColor=gateOpen?"#69ffb5":"transparent";ctx.shadowBlur=gateOpen?18:0;
  ctx.beginPath();
  ctx.moveTo(cx-22,sy+220);ctx.lineTo(cx+22,sy+220);
  ctx.lineTo(cx+15,430);ctx.lineTo(cx-15,430);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle=gateOpen?"#09271a":"#131820";
  ctx.font="1000 10px system-ui";ctx.fillText(gateOpen?"GATE OPEN":"LOCKED",cx,410);

  const centers=[
    {y:470,rx:122,ry:40},
    {y:580,rx:134,ry:44},
    {y:690,rx:146,ry:49}
  ];

  for(let i=2;i>=0;i--){
    const c=centers[i];
    const active=feature.mode==="crank" && crank.stage===i;
    const cleared=(feature.mode==="crank" || feature.mode==="result") && crank.stage>i;
    const dim=feature.mode==="crank" && crank.stage<i;

    ctx.save();
    ctx.translate(cx,c.y);
    ctx.fillStyle="#07090d";
    ctx.beginPath();ctx.ellipse(0,13,c.rx+8,c.ry+11,0,0,Math.PI*2);ctx.fill();

    const rim=ctx.createLinearGradient(-c.rx,0,c.rx,0);
    rim.addColorStop(0,"#242932");rim.addColorStop(.18,"#dce1e8");
    rim.addColorStop(.38,"#606976");rim.addColorStop(.58,"#f7f8fa");
    rim.addColorStop(.82,"#59626f");rim.addColorStop(1,"#171b22");
    ctx.fillStyle=rim;
    ctx.shadowColor=active?"#ff437e":cleared?"#69ffb5":"#52657d";
    ctx.shadowBlur=active?24:cleared?14:5;
    ctx.beginPath();ctx.ellipse(0,0,c.rx+8,c.ry+8,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;

    const bowl=ctx.createRadialGradient(-20,-10,5,0,0,c.rx);
    bowl.addColorStop(0,dim?"#1c2026":"#6c747d");
    bowl.addColorStop(.42,dim?"#0e1217":"#333942");
    bowl.addColorStop(.78,"#090b10");bowl.addColorStop(1,"#020306");
    ctx.fillStyle=bowl;
    ctx.beginPath();ctx.ellipse(0,-2,c.rx-9,c.ry-8,0,0,Math.PI*2);ctx.fill();

    ctx.strokeStyle=active?"#ff6b9b55":"#ffffff20";ctx.lineWidth=2;
    for(let g=0;g<12;g++){
      const a=crank.stages[i].diskAngle+g*Math.PI/6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*24,Math.sin(a)*9-2);
      ctx.lineTo(Math.cos(a)*(c.rx-17),Math.sin(a)*(c.ry-13)-2);
      ctx.stroke();
    }

    for(let h=0;h<6;h++){
      const a=crank.stages[i].diskAngle+h*Math.PI*2/6;
      const hx=Math.cos(a)*(c.rx-41);
      const hy=Math.sin(a)*(c.ry-18)-2;
      const pass=h===0;
      const selected=active && crank.stages[i].targetHole===h && crank.timer>1.72;
      ctx.fillStyle="#000";
      ctx.shadowColor=pass?"#69ffb5":"#ff4a63";
      ctx.shadowBlur=selected?24:pass?9:3;
      ctx.beginPath();ctx.ellipse(hx,hy,13,6.5,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=pass?"#72ffc0":"#a72f3f";
      ctx.lineWidth=selected?4:2;ctx.stroke();
      if(pass){
        ctx.fillStyle="#c1ffe0";ctx.font="1000 8px system-ui";ctx.fillText("GO",hx,hy);
      }
    }
    ctx.shadowBlur=0;

    ctx.fillStyle=active?"#ff5c92":cleared?"#6effb8":"#9099a8";
    ctx.font="1000 11px system-ui";ctx.textAlign="left";
    ctx.fillText(i===2?"FINAL":`LEVEL ${i+1}`,-c.rx+11,-c.ry+7);

    if(active){
      const st=crank.stages[i];
      const bx=Math.cos(st.ballAngle)*st.orbit;
      const by=Math.sin(st.ballAngle)*(st.orbit*.34)-7;
      const ballG=ctx.createRadialGradient(bx-4,by-5,1,bx,by,10);
      ballG.addColorStop(0,"#fff");ballG.addColorStop(.28,"#d9f7ff");
      ballG.addColorStop(.64,"#718794");ballG.addColorStop(1,"#12181e");
      ctx.fillStyle=ballG;ctx.shadowColor="#dfffff";ctx.shadowBlur=13;
      ctx.beginPath();ctx.arc(bx,by,10,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#ffffffbb";ctx.lineWidth=1;ctx.stroke();ctx.shadowBlur=0;
    }
    ctx.restore();

    if(i<2){
      ctx.fillStyle=cleared?"#69ffb5":"#303844";
      ctx.shadowColor=cleared?"#69ffb5":"transparent";ctx.shadowBlur=cleared?12:0;
      ctx.beginPath();
      ctx.moveTo(cx-17,c.y+38);ctx.lineTo(cx+17,c.y+38);
      ctx.lineTo(cx+11,c.y+65);ctx.lineTo(cx-11,c.y+65);
      ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    }
  }

  ctx.fillStyle="#07090d";
  ctx.beginPath();ctx.roundRect(282,756,286,42,11);ctx.fill();
  ctx.strokeStyle=feature.mode==="crank"?"#ff4c87":feature.mode==="slot"?"#ffd66b":"#59e7ff";
  ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=feature.mode==="crank"?"#ff79a8":feature.mode==="slot"?"#ffe18a":"#8ceeff";
  ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;
  ctx.font="1000 14px system-ui";ctx.textAlign="center";
  const status=feature.mode==="crank" || feature.mode==="result" ? crank.message :
    feature.mode==="slot" ? "REELS SELECT THE GATE" : "HIT START TO BEGIN";
  ctx.fillText(status,cx,777);ctx.shadowBlur=0;

  for(let i=0;i<8;i++){
    const bx=281+i*41;
    const on=feature.mode!=="idle" || ((i+Math.floor(lampPhase*6))%3===0);
    ctx.fillStyle=on?"#ff4f83":"#4d222d";
    ctx.shadowColor=on?"#ff2c70":"transparent";ctx.shadowBlur=on?12:0;
    ctx.beginPath();ctx.arc(bx,813,5.5,0,Math.PI*2);ctx.fill();
  }
  ctx.shadowBlur=0;
  ctx.restore();
}

function drawBalls(){
  for(const ball of balls){
    for(const t of ball.trail){
      ctx.globalAlpha=t.a;
      ctx.fillStyle="#9ceeff";
      ctx.beginPath();ctx.arc(t.x,t.y,ball.r*.55,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    const bg=ctx.createRadialGradient(ball.x-4,ball.y-5,1,ball.x,ball.y,ball.r);
    bg.addColorStop(0,"#ffffff");bg.addColorStop(.25,"#dff9ff");bg.addColorStop(.58,"#6d8ca7");bg.addColorStop(1,"#172331");
    ctx.fillStyle=bg;ctx.shadowColor="#b8f7ff";ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#ffffffaa";ctx.lineWidth=1.1;ctx.stroke();
  }
  ctx.shadowBlur=0;ctx.globalAlpha=1;
}

function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.shadowBlur=0;
}

function drawOverlay(){
  const gloss=ctx.createLinearGradient(0,0,W,H);
  gloss.addColorStop(0,"#ffffff13");gloss.addColorStop(.24,"#ffffff00");
  gloss.addColorStop(.54,"#8fdfff08");gloss.addColorStop(1,"#ffffff00");
  ctx.fillStyle=gloss;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(360,0);ctx.lineTo(760,H);ctx.lineTo(520,H);ctx.closePath();ctx.fill();

  if(jackpotFlash>0){
    ctx.globalAlpha=Math.min(.7,jackpotFlash*.35);
    ctx.fillStyle="#ff5ea8";ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=1;
    ctx.textAlign="center";ctx.font="1000 76px system-ui";ctx.fillStyle="#fff";
    ctx.shadowColor="#ff2d8c";ctx.shadowBlur=40;
    ctx.fillText("JACKPOT!",430,590);ctx.shadowBlur=0;
  }

  if(ballsLeft<=0 && balls.length===0){
    ctx.fillStyle="#05070bcc";roundedRect(170,500,560,150,28);ctx.fill();
    ctx.strokeStyle="#ffd66b88";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#fff";ctx.font="900 32px system-ui";ctx.textAlign="center";
    ctx.fillText("彈珠用完了",450,560);
    ctx.font="600 18px system-ui";ctx.fillStyle="#b8c2d8";
    ctx.fillText("按「補充 10 顆」繼續遊玩",450,607);
  }
}
