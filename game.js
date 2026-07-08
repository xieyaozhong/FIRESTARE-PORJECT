(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const HOLD_DURATION = 3000;
  const REWARD_POOL = [
    { name: "微光火種券", value: 40, theme: "ember", rarity: "普通", symbol: "✦", weight: 30 },
    { name: "晨曦星芒券", value: 60, theme: "dawn", rarity: "進階", symbol: "☀", weight: 25 },
    { name: "森語螢火券", value: 80, theme: "forest", rarity: "稀有", symbol: "❖", weight: 20 },
    { name: "極光星焰券", value: 100, theme: "aurora", rarity: "珍稀", symbol: "✧", weight: 14 },
    { name: "紫晶聖火券", value: 120, theme: "royal", rarity: "史詩", symbol: "◆", weight: 8 },
    { name: "傳說金焰券", value: 150, theme: "legendary", rarity: "傳說", symbol: "★", weight: 3 }
  ];

  const $ = selector => document.querySelector(selector);
  const elements = {
    playfield: $("#playfield"),
    bonfireButton: $("#bonfireButton"),
    progressText: $("#progressText"),
    holdTime: $("#holdTime"),
    holdHint: $("#holdHint"),
    resultPanel: $("#resultPanel"),
    resultIcon: $("#resultIcon"),
    resultTitle: $("#resultTitle"),
    resultMessage: $("#resultMessage"),
    retryButton: $("#retryButton"),
    claimLink: $("#claimLink"),
    rewardVoucher: $("#rewardVoucher"),
    rewardSymbol: $("#rewardSymbol"),
    rewardRarity: $("#rewardRarity"),
    rewardCouponName: $("#rewardCouponName"),
    rewardScope: $("#rewardScope"),
    rewardCouponCode: $("#rewardCouponCode"),
    rewardCouponValue: $("#rewardCouponValue")
  };

  let state = loadState();
  let holding = false;
  let completed = false;
  let holdStartedAt = 0;
  let animationFrame = 0;
  let activePointerId = null;
  let lastMilestone = 0;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setProgress(progress) {
    const safeProgress = Math.max(0, Math.min(1, progress));
    elements.playfield.style.setProperty("--progress", safeProgress.toFixed(4));
    elements.progressText.textContent = String(Math.round(safeProgress * 100));
    elements.holdTime.textContent = (safeProgress * HOLD_DURATION / 1000).toFixed(1);
  }

  function pickReward() {
    const totalWeight = REWARD_POOL.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const reward of REWARD_POOL) {
      roll -= reward.weight;
      if (roll < 0) return reward;
    }
    return REWARD_POOL[0];
  }

  function issueReward(reward) {
    state = loadState();
    state.coupons = Array.isArray(state.coupons) ? state.coupons : [];
    state.activities = Array.isArray(state.activities) ? state.activities : [];

    const coupon = {
      id: `coupon-game-universal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: reward.name,
      type: "flat",
      value: reward.value,
      uses: 1,
      rewardScope: "universal",
      rewardTheme: reward.theme,
      rewardRarity: reward.rarity,
      rewardSymbol: reward.symbol,
      rewardSource: "spark-course-mini-game",
      createdAt: Date.now()
    };

    state.coupons.push(coupon);
    state.activities.unshift({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      text: `已點亮星火，獲得通用「${reward.name}」${reward.value} 點優惠券。`
    });
    state.activities = state.activities.slice(0, 40);
    saveState();
    return coupon;
  }

  function renderVoucher(coupon) {
    const themeClasses = [...elements.rewardVoucher.classList]
      .filter(className => className.startsWith("theme-"));
    themeClasses.forEach(className => elements.rewardVoucher.classList.remove(className));
    elements.rewardVoucher.classList.add(`theme-${coupon.rewardTheme || "ember"}`);

    elements.rewardSymbol.textContent = coupon.rewardSymbol || "✦";
    elements.rewardRarity.textContent = coupon.rewardRarity || "普通";
    elements.rewardCouponName.textContent = coupon.name;
    elements.rewardScope.textContent = "星火計畫全課程皆可使用";
    elements.rewardCouponCode.textContent = `NO. ${String(coupon.id).slice(-10).toUpperCase()}`;
    elements.rewardCouponValue.textContent = String(coupon.value);
    elements.rewardVoucher.hidden = false;
  }

  function updateHold() {
    if (!holding || completed) return;
    const elapsed = performance.now() - holdStartedAt;
    const progress = Math.min(1, elapsed / HOLD_DURATION);
    setProgress(progress);

    const milestone = Math.floor(progress * 4);
    if (milestone > lastMilestone) {
      lastMilestone = milestone;
      if (navigator.vibrate) navigator.vibrate(milestone >= 4 ? [35, 40, 80] : 22);
    }

    if (progress >= 1) {
      completeIgnition();
      return;
    }
    animationFrame = requestAnimationFrame(updateHold);
  }

  function beginHold(event) {
    if (completed || holding) return;
    if (event?.type === "pointerdown" && event.button !== 0) return;

    holding = true;
    holdStartedAt = performance.now();
    lastMilestone = 0;
    elements.playfield.classList.add("is-holding");
    elements.holdHint.textContent = "光環正在展開，繼續按住…";
    elements.bonfireButton.querySelector(".bonfire-label").textContent = "持續長按";

    if (event?.pointerId !== undefined) {
      activePointerId = event.pointerId;
      try {
        elements.bonfireButton.setPointerCapture(event.pointerId);
      } catch {}
    }

    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(updateHold);
  }

  function cancelHold() {
    if (!holding || completed) return;
    holding = false;
    activePointerId = null;
    cancelAnimationFrame(animationFrame);
    elements.playfield.classList.remove("is-holding");
    elements.holdHint.textContent = "中途放開了，再長按一次即可重新點亮";
    elements.bonfireButton.querySelector(".bonfire-label").textContent = "長按火堆";
    setProgress(0);
  }

  function completeIgnition() {
    if (completed) return;
    holding = false;
    completed = true;
    activePointerId = null;
    cancelAnimationFrame(animationFrame);
    setProgress(1);
    elements.playfield.classList.remove("is-holding");
    elements.playfield.classList.add("is-complete");
    elements.holdHint.textContent = "已點亮星火";
    elements.bonfireButton.querySelector(".bonfire-label").textContent = "星火已點亮";

    const reward = pickReward();
    const coupon = issueReward(reward);
    renderVoucher(coupon);

    elements.resultIcon.textContent = reward.symbol;
    elements.resultTitle.textContent = "已點亮星火";
    elements.resultMessage.textContent = `星火回應了你的光，隨機獲得「${reward.name}」${reward.value} 點通用優惠券，已同步到排課中心。`;
    elements.resultPanel.hidden = false;
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetGame() {
    holding = false;
    completed = false;
    activePointerId = null;
    lastMilestone = 0;
    cancelAnimationFrame(animationFrame);
    elements.playfield.classList.remove("is-holding", "is-complete");
    elements.holdHint.textContent = "持續按住 3 秒，不要放開";
    elements.bonfireButton.querySelector(".bonfire-label").textContent = "長按火堆";
    elements.resultPanel.hidden = true;
    elements.rewardVoucher.hidden = true;
    setProgress(0);
    elements.playfield.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function bindEvents() {
    elements.bonfireButton.addEventListener("contextmenu", event => event.preventDefault());
    elements.bonfireButton.addEventListener("pointerdown", event => {
      event.preventDefault();
      beginHold(event);
    });
    elements.bonfireButton.addEventListener("pointerup", event => {
      if (activePointerId === null || event.pointerId === activePointerId) cancelHold();
    });
    elements.bonfireButton.addEventListener("pointercancel", cancelHold);
    elements.bonfireButton.addEventListener("lostpointercapture", cancelHold);

    elements.bonfireButton.addEventListener("keydown", event => {
      if ((event.key === " " || event.key === "Enter") && !event.repeat) {
        event.preventDefault();
        beginHold(event);
      }
    });
    elements.bonfireButton.addEventListener("keyup", event => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        cancelHold();
      }
    });
    elements.bonfireButton.addEventListener("blur", cancelHold);
    elements.retryButton.addEventListener("click", resetGame);
  }

  function init() {
    setProgress(0);
    bindEvents();
  }

  init();
})();
