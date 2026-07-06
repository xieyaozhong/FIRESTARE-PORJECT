"use strict";

// ---------- Rendering ----------
  function roundedRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
  }


  function drawPrizePockets(){
    const trayX=79, trayY=898, trayW=693, trayH=184;

    // Cabinet base and chrome lip.
    const tray=ctx.createLinearGradient(0,trayY,0,trayY+trayH);
    tray.addColorStop(0,"#8d9aae");
    tray.addColorStop(.08,"#e9f0f8");
    tray.addColorStop(.15,"#3a4352");
    tray.addColorStop(.34,"#111722");
    tray.addColorStop(1,"#05070c");
    ctx.fillStyle=tray;
    ctx.shadowColor="#000";ctx.shadowBlur=18;
    ctx.beginPath();ctx.roundRect(trayX,trayY,trayW,trayH,18);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.stroke();

    ctx.fillStyle="#080c14dd";
    ctx.beginPath();ctx.roundRect(92,906,666,26,10);ctx.fill();
    ctx.strokeStyle="#ffd66b66";ctx.lineWidth=1.5;ctx.stroke();
    ctx.font="900 13px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillStyle="#dce8fa";
    ctx.fillText("PRIZE  POCKETS",425,919);

    pockets.forEach((p,i)=>{
      const special=Boolean(p.slot);
      const gold=p.value>=100;
      const accent=special?"#ff5ea8":gold?"#ffd66b":"#59e7ff";
      const width=p.x1-p.x0;
      const cx=(p.x0+p.x1)/2;
      const left=p.x0+5;
      const right=p.x1-5;
      const pulse=.45+.35*Math.sin(lampPhase*4+i*.9);

      // Funnel mouth behind the physical divider rails.
      const funnel=ctx.createLinearGradient(0,928,0,970);
      funnel.addColorStop(0,accent+"18");
      funnel.addColorStop(1,"#020409");
      ctx.fillStyle=funnel;
      ctx.beginPath();
      ctx.moveTo(left,932);ctx.lineTo(right,932);
      ctx.lineTo(right-10,970);ctx.lineTo(left+10,970);
      ctx.closePath();ctx.fill();

      // Black receiving opening.
      ctx.fillStyle="#010205";
      ctx.shadowColor=accent;ctx.shadowBlur=8+pulse*8;
      ctx.beginPath();ctx.ellipse(cx,951,Math.max(21,width*.29),8,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=accent+"aa";ctx.lineWidth=2;ctx.stroke();
      ctx.shadowBlur=0;

      // Deep illuminated award window.
      const panel=ctx.createLinearGradient(0,963,0,1067);
      panel.addColorStop(0,"#05070b");
      panel.addColorStop(.2,accent+"32");
      panel.addColorStop(.56,"#111827");
      panel.addColorStop(1,"#030509");
      ctx.fillStyle=panel;
      ctx.beginPath();ctx.roundRect(left+4,964,width-18,100,11);ctx.fill();
      ctx.strokeStyle=accent+"bb";ctx.lineWidth=special?3:2;ctx.stroke();

      // Inner highlight and status lamp.
      ctx.strokeStyle="#ffffff22";ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(left+8,968,width-26,92,8);ctx.stroke();
      ctx.fillStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(cx,978,3.8+pulse*1.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;

      ctx.textAlign="center";ctx.textBaseline="middle";
      if(special){
        ctx.font=width<100?"1000 14px system-ui":"1000 18px system-ui";
        ctx.fillStyle="#ffc0dc";ctx.shadowColor="#ff4c9c";ctx.shadowBlur=12;
        ctx.fillText("START",cx,1014);
        ctx.shadowBlur=0;
        ctx.font="800 9px system-ui";ctx.fillStyle="#ff86bb";ctx.fillText("CHANCE REELS",cx,1042);
      }else{
        ctx.font=width<100?"1000 20px system-ui":"1000 27px system-ui";
        ctx.fillStyle=gold?"#fff0a9":"#d6f8ff";
        ctx.shadowColor=accent;ctx.shadowBlur=10;
        ctx.fillText(String(p.value),cx,1015);
        ctx.shadowBlur=0;
        ctx.font="900 9px system-ui";ctx.fillStyle=accent;ctx.fillText("POINTS",cx,1042);
      }
    });

    // Bottom cabinet trim.
    const trim=ctx.createLinearGradient(trayX,0,trayX+trayW,0);
    trim.addColorStop(0,"#1b2230");trim.addColorStop(.18,"#b8c5d5");trim.addColorStop(.5,"#394457");trim.addColorStop(.82,"#d2dbe7");trim.addColorStop(1,"#151b26");
    ctx.fillStyle=trim;ctx.beginPath();ctx.roundRect(88,1070,674,11,5);ctx.fill();
  }

  function drawBoard(){
    // Base
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#1c2a49");g.addColorStop(.4,"#10182b");g.addColorStop(1,"#070a11");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    // Subtle glass reflections.
    const rg=ctx.createRadialGradient(390,350,20,390,350,620);
    rg.addColorStop(0,"#4972a522");rg.addColorStop(1,"#00000000");
    ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);

    // Jackpot title.
    ctx.textAlign="center";
    ctx.font="900 46px system-ui";
    ctx.fillStyle=jackpotFlash>0?"#fff":"#ffd66b";
    ctx.shadowColor="#ffb52e";ctx.shadowBlur=18;
    ctx.fillText("HYBRID PACHINKO",420,82);
    ctx.shadowBlur=0;
    ctx.font="700 15px system-ui";ctx.fillStyle="#8ea2c9";ctx.fillText("BALL → REELS → TRIPLE CRANK",420,111);

    drawPrizePockets();

    // Segments / rails.
    ctx.lineCap="round";
    for(const s of segments){
      ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);
      if(s.kind.includes("rail")){
        ctx.strokeStyle="#d9e7ff";ctx.lineWidth=8;ctx.shadowColor="#59e7ff";ctx.shadowBlur=8;
      }else if(s.kind==="divider"){
        ctx.strokeStyle="#d8b85f";ctx.lineWidth=6;ctx.shadowColor="#ffd66b";ctx.shadowBlur=4;
      }else{
        ctx.strokeStyle="#8095ba";ctx.lineWidth=5;ctx.shadowColor="#000";ctx.shadowBlur=3;
      }
      ctx.stroke();ctx.shadowBlur=0;
    }

    // Pins.
    for(const p of pins){
      p.flash=Math.max(0,p.flash-1/60);
      const glow=p.flash>0?18:5;
      const pg=ctx.createRadialGradient(p.x-2,p.y-2,1,p.x,p.y,p.r+5);
      pg.addColorStop(0,"#fff");pg.addColorStop(.38,"#dcecff");pg.addColorStop(.7,"#5f789c");pg.addColorStop(1,"#18213300");
      ctx.fillStyle=pg;ctx.shadowColor=p.flash>0?"#ffffff":"#7fdfff";ctx.shadowBlur=glow;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r+3,0,Math.PI*2);ctx.fill();
    }
    ctx.shadowBlur=0;

    drawHybridFeature();

    // Bumpers.
    for(const b of bumpers){
      b.flash=Math.max(0,b.flash-1/60);
      ctx.save();
      ctx.translate(b.x,b.y);
      const pulse=1+Math.sin(lampPhase*4+b.x)*.03+(b.flash>0?.08:0);
      ctx.scale(pulse,pulse);
      const bg=ctx.createRadialGradient(-10,-12,4,0,0,b.r);
      bg.addColorStop(0,"#fff");bg.addColorStop(.22,b.color);bg.addColorStop(.75,"#15213d");bg.addColorStop(1,b.color);
      ctx.fillStyle=bg;ctx.shadowColor=b.color;ctx.shadowBlur=b.flash>0?38:20;
      ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff9";ctx.lineWidth=3;ctx.stroke();
      if(b.label){
        ctx.fillStyle="#fff";ctx.font="900 13px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(b.label,0,1);
      }
      ctx.restore();
    }
    ctx.shadowBlur=0;

    // Launch lane labels and plunger.
    ctx.save();
    ctx.translate(795,1084);
    const compression=charging?charge*36:0;
    ctx.fillStyle="#d5dae5";ctx.fillRect(-15,20+compression,30,53-compression);
    ctx.fillStyle="#ffd66b";ctx.beginPath();ctx.roundRect(-24,66,48,18,8);ctx.fill();
    ctx.strokeStyle="#8b96ab";ctx.lineWidth=4;
    for(let y=24+compression;y<64;y+=9){ctx.beginPath();ctx.moveTo(-13,y);ctx.lineTo(13,y+5);ctx.stroke();}
    ctx.restore();
    ctx.fillStyle="#8da2c5";ctx.font="800 13px system-ui";ctx.fillText("LAUNCH",795,1015);

    // Lamps.
    for(let i=0;i<15;i++){
      const x=105+i*48;
      const on=((i+Math.floor(lampPhase*6))%4===0);
      ctx.fillStyle=on?"#fff3a8":"#29405d";
      ctx.shadowColor=on?"#ffd66b":"transparent";ctx.shadowBlur=on?16:0;
      ctx.beginPath();ctx.arc(x,150,7,0,Math.PI*2);ctx.fill();
    }
    ctx.shadowBlur=0;
  }
