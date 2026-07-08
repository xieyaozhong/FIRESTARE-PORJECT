(() => {
  "use strict";

  function loadScript(src, onload) {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = onload;
    script.onerror = () => {
      const message = document.createElement("div");
      message.style.cssText = "margin:20px;padding:20px;color:#fff;background:#d85663;border:4px solid #29243e;font-family:monospace";
      message.textContent = "排課功能載入失敗，請重新整理頁面。";
      document.body.appendChild(message);
    };
    document.head.appendChild(script);
  }

  loadScript("./app-reschedule-v1.js?v=spark-reschedule-v2", () => {
    loadScript("./app-upcoming-redemption-v1.js?v=spark-redemption-v3", () => {
      loadScript("./app-duration-v1.js?v=spark-duration-v1");
    });
  });
})();
