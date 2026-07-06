"use strict";

// ---------- Rendering ----------
  function roundedRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
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

    // Pockets.
    for(const p of pockets){
      const special=Boolean(p.slot);
      ctx.fillStyle=special?"#ff4f9e22":p.value>=100?"#ffd66b19":"#59e7ff12";
      ctx.fillRect(p.x0,940,p.x1-p.x0,130);
      ctx.strokeStyle=special?"#ff5ea8aa":p.value>=100?"#ffd66baa":"#59e7ff55";
      ctx.lineWidth=2;ctx.strokeRect(p.x0+2,940,p.x1-p.x0-4,126);
      ctx.fillStyle=special?"#ff9bc9":p.value>=100?"#ffe18b":"#a9f3ff";
      ctx.font=special?"900 17px system-ui":"900 23px system-ui";
      ctx.fillText(p.label,(p.x0+p.x1)/2,1033);
    }

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
