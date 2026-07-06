:root{
  --bg:#090b12;
  --panel:#111625;
  --gold:#ffd66b;
  --cyan:#59e7ff;
  --pink:#ff5ea8;
  --text:#f7f8ff;
  --muted:#9ba7c2;
}
*{box-sizing:border-box}
html,body{
  margin:0;
  min-height:100%;
  background:radial-gradient(circle at 50% 0%,#253459 0,#111625 35%,#070910 80%);
  color:var(--text);
  font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC",sans-serif;
  overflow-x:hidden;
}
body{
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding:12px;
}
.app{
  width:min(100%,1180px);
  min-height:calc(100svh - 24px);
  display:grid;
  grid-template-columns:minmax(0,calc(75svh - 13px)) minmax(270px,320px);
  justify-content:center;
  align-items:start;
  gap:14px;
}
.machine{
  position:sticky;
  top:12px;
  width:100%;
  height:calc(100svh - 24px);
  max-height:calc(100svh - 24px);
  display:grid;
  place-items:center;
  overflow:hidden;
  border-radius:28px;
  padding:10px;
  background:linear-gradient(145deg,#3f4968,#131827 38%,#05070c 70%);
  box-shadow:0 30px 80px #000a,inset 0 0 0 2px #ffffff20,inset 0 0 50px #75a7ff18;
}
.machine:before{
  content:"";
  position:absolute;
  inset:5px;
  border-radius:24px;
  pointer-events:none;
  border:1px solid #ffd66b55;
  box-shadow:inset 0 0 28px #ffd66b22;
}
canvas{
  display:block;
  width:min(100%,calc(75svh - 33px));
  height:auto;
  max-width:100%;
  max-height:100%;
  aspect-ratio:3/4;
  border-radius:20px;
  background:#080b12;
  touch-action:none;
  box-shadow:inset 0 0 40px #000,0 0 0 1px #ffffff12;
}
.hud{
  max-height:calc(100svh - 24px);
  overflow-y:auto;
  scrollbar-width:thin;
  scrollbar-color:#52617d #0b101c;
  background:linear-gradient(180deg,#161d31,#0c101c);
  border-radius:24px;
  padding:15px;
  border:1px solid #ffffff18;
  box-shadow:0 20px 60px #0007;
  display:flex;
  flex-direction:column;
  gap:11px;
}
.hud::-webkit-scrollbar{width:7px}
.hud::-webkit-scrollbar-track{background:#0b101c;border-radius:99px}
.hud::-webkit-scrollbar-thumb{background:#52617d;border-radius:99px}
.logo{font-weight:900;letter-spacing:.1em;font-size:20px;color:var(--gold);text-shadow:0 0 18px #ffbd3077}
.sub{font-size:11px;color:var(--muted);line-height:1.55}
.card{padding:12px;border-radius:16px;background:#ffffff08;border:1px solid #ffffff12}
.label{font-size:11px;color:var(--muted);letter-spacing:.08em}
.value{font-weight:900;font-variant-numeric:tabular-nums;font-size:27px;margin-top:3px}
.value.small{font-size:19px}
.meter{height:15px;border-radius:999px;background:#0008;overflow:hidden;border:1px solid #ffffff1c;margin-top:8px}
.fill{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#57eaff,#ffd862 58%,#ff5e8d);box-shadow:0 0 18px #fff7}
.launch{
  appearance:none;
  border:0;
  border-radius:17px;
  padding:15px 10px;
  font-size:15px;
  font-weight:900;
  color:#10131c;
  cursor:pointer;
  user-select:none;
  background:linear-gradient(180deg,#fff5b5,#ffc94c);
  box-shadow:0 7px 0 #9f681a,0 13px 28px #0008,inset 0 2px 0 #fff;
  transition:transform .08s,box-shadow .08s;
}
.launch.active,.launch:active{transform:translateY(5px);box-shadow:0 2px 0 #9f681a,0 8px 18px #0008,inset 0 2px 0 #fff}
.row{display:grid;grid-template-columns:1fr 1fr;gap:7px}
button.secondary{
  border:1px solid #ffffff1f;
  background:#ffffff0a;
  color:#eef3ff;
  border-radius:13px;
  padding:10px 7px;
  font-weight:700;
  cursor:pointer;
}
button.secondary:hover{background:#ffffff14}
.legend{display:grid;gap:6px;font-size:11px;color:#c9d1e4}
.legend span{display:flex;align-items:center;gap:8px}
.dot{width:9px;height:9px;border-radius:50%;box-shadow:0 0 10px currentColor;flex:0 0 auto}
.notice{font-size:10px;color:#77839d;line-height:1.45;margin-top:auto}
.control{width:100%;border:1px solid #ffffff1f;background:#090d18;color:#eef3ff;border-radius:11px;padding:9px;font-weight:800;margin-top:7px}
button.secondary.active{background:#59e7ff22;border-color:#59e7ff99;color:#aef4ff;box-shadow:0 0 16px #59e7ff22}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}
.stat{background:#0004;border-radius:9px;padding:7px 3px;text-align:center}
.stat b{display:block;font-size:16px;font-variant-numeric:tabular-nums}
.stat small{font-size:9px;color:var(--muted)}
.mission{font-size:11px;line-height:1.5;color:#dce4f6;margin-top:6px}
.toast{position:fixed;left:50%;top:18px;z-index:20;transform:translate(-50%,-130%);max-width:min(90vw,420px);padding:13px 18px;border-radius:15px;background:#101726ee;border:1px solid #ffd66b88;box-shadow:0 15px 50px #000a,0 0 25px #ffd66b22;color:#fff;font-weight:800;text-align:center;transition:transform .28s ease;pointer-events:none}
.toast.show{transform:translate(-50%,0)}
.fever-card.active{border-color:#ff5ea888;box-shadow:inset 0 0 25px #ff5ea81b,0 0 24px #ff5ea818}
.fever-fill{background:linear-gradient(90deg,#59e7ff,#ffd66b 55%,#ff3b8a)}

@media(max-width:980px){
  body{padding:0;display:block}
  .app{display:flex;flex-direction:column;width:100%;min-height:0;gap:0}
  .machine{
    position:relative;
    top:auto;
    width:100%;
    height:min(100svh,calc(133.333vw + 12px));
    max-height:100svh;
    min-height:0;
    border-radius:0;
    padding:6px;
  }
  .machine:before{inset:3px;border-radius:16px}
  canvas{width:min(100%,calc(75svh - 9px));height:auto;max-width:100%;max-height:100%;border-radius:13px}
  .hud{max-height:none;overflow:visible;margin:8px;border-radius:20px;padding:14px;gap:10px}
}

@media(max-width:480px){
  .hud{margin:6px;padding:12px}
  .logo{font-size:18px}
  .card{padding:11px}
}

@media(orientation:landscape) and (max-height:560px){
  body{padding:4px}
  .app{display:grid;grid-template-columns:minmax(0,calc(75svh - 3px)) minmax(250px,300px);gap:8px}
  .machine{position:sticky;top:4px;height:calc(100svh - 8px);max-height:calc(100svh - 8px);border-radius:18px;padding:6px}
  .hud{margin:0;max-height:calc(100svh - 8px);overflow-y:auto;border-radius:18px;padding:10px;gap:8px}
  canvas{width:min(100%,calc(75svh - 15px))}
}

.combo-guide{display:grid;gap:7px}
.combo-row{display:grid;grid-template-columns:66px 1fr;gap:8px;align-items:start;padding-top:6px;border-top:1px solid #ffffff0d;font-size:10px;line-height:1.4;color:#aebbd2}
.combo-row:first-of-type{border-top:0}
.combo-row b{color:#ffe08a;font-size:11px}
