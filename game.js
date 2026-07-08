(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const HOLD_DURATION = 3000;
  const REWARD_SOURCE = "spark-course-mini-game";
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
  let celebrationTimer = 0;

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

  function gameCoupons(sourceState = state) {
    return (Array.isArray(sourceState.coupons) ? sourceState.coupons : [])
      .filter(coupon => coupon?.rewardSource === REWARD_SOURCE)
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }

  function ignitionStatus(sourceState = state) {
    const coupon = gameCoupons(sourceState)[0] || null;
    const record = sourceState.sparkIgnition;
    const completedAt = Number(record?.completedAt || coupon?.createdAt || 0);
    return {
      completed: Boolean(completedAt || coupon),
      completedAt,
      coupon
    };
  }

  function persistLegacyCompletion() {
    state = loadState();
    const status = ignitionStatus(state);
    if (!status.completed || state.sparkIgnition?.completedAt) return status;

    state.sparkIgnition = {
      completedAt: status.completedAt || Date.now(),
      couponId: status.coupon?.id || null
    };
    saveState();
    return ignitionStatus(state);
  }

  function setEnergyStage(progress) {
    elements.playfield.classList.remove("energy-warm", "energy-bright", "energy-max");
    if (progress >= 0.82) elements.playfield.classList.add("energy-max");
    else if (progress >= 0.5) elements.playfield.classList.add("energy-bright");
    else if (progress >= 0.18) elements.playfield.classList.add("energy-warm");
  }

  function setProgress(progress) {
    const safeProgress = Math.max(0, Math.min(1, progress));
    elements.playfield.style.setProperty("--progress", safeProgress.toFixed(4));
    elements.progressText.textContent = String(Math.round(safeProgress * 100));
    elements.holdTime.textContent = (safeProgress * HOLD_DURATION / 1000).toFixed(1);
    setEnergyStage(safeProgress);
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
    const currentStatus = ignitionStatus(state);
    if (currentStatus.completed) {
      return { coupon: currentStatus.coupon, created: false };
    }

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
      rewardSource: REWARD_SOURCE,
      createdAt: Date.now()
    };

    state.coupons.push(coupon);
    state.sparkIgnition = {
      completedAt: coupon.createdAt,
      couponId: coupon.id
    };
    state.activities.unshift({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      text: `已點亮星火，獲得通用「${reward.name}」${reward.value} 點優惠券。每位用戶限領一次。`
    });
    state.activities = state.activities.slice(0, 40);
    saveState();
    return { coupon, created: true };
  }

  function renderVoucher(coupon) {
    if (!coupon) {
      elements.rewardVoucher.hidden = true;
      return;
    }

    const themeClasses = [...elements.rewardVoucher.classList]
      .filter(className => className.startsWith("theme-"));
    themeClasses.forEach(className => elements.rewardVoucher.classList.remove(className));
    elements.rewardVoucher.classList.add(`theme-${coupon.rewardTheme || "ember"}`);

    elements.rewardSymbol.textContent = coupon.rewardSymbol || "✦";
    elements.rewardRarity.textContent = coupon.rewardRarity || "普通";
    elements.rewardCouponName.textContent = coupon.name || "星火優惠券";
    elements.rewardScope.textContent = "星火計畫全課程皆可使用";
    elements.rewardCouponCode.textContent = `NO. ${String(coupon.id || "").slice(-10).toUpperCase()}`;
    elements.rewardCouponValue.textContent = String(Number(coupon.value || 0));
    elements.rewardVoucher.hidden = false;
  }

  function restartAnimation(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function triggerCelebration() {
    window.clearTimeout(celebrationTimer);
    elements.playfield.classList.remove("is-celebrating");
    document.body.classList.remove("is-ignition-shake");
    void elements.playfield.offsetWidth;

    elements.playfield.classList.add("is-celebrating");
    document.body.classList.add("is-ignition-shake");
    restartAnimation(elements.resultPanel, "is-revealing");
    restartAnimation(elements.rewardVoucher, "is-revealing");

    celebrationTimer = window.setTimeout(() => {
      elements.playfield.classList.remove("is-celebrating");
      document.body.classList.remove("is-ignition-shake");
    }, 950);
  }

  function showCompletedState(coupon, wasJustCompleted = false) {
    completed = true;
    holding = false;
    activePointerId = null;
    cancelAnimationFrame(animationFrame);
    setProgress(1);

    elements.playfield.classList.remove("is-holding");
    elements.playfield.classList.add("is-complete", "is-locked");
    elements.bonfireButton.disabled = true;
    elements.bonfireButton.setAttribute("aria-disabled", "true");
    elements.bonfireButton.querySelector(".bonfire-label").textContent = "已點亮星火";
    elements.holdHint.textContent = "每位用戶只能點亮一次";

    renderVoucher(coupon);
    elements.resultIcon.textContent = coupon?.rewardSymbol || "🔥";
    elements.resultTitle.textContent = "已點亮星火";
    elements.resultMessage.textContent = wasJustCompleted
      ? "星火回應了你的光，優惠券已同步到排課中心。每位用戶只能點亮一次。"
      : "你已經完成過點亮星火，優惠券已發放；每位用戶僅能領取一次。";
    elements.resultPanel.hidden = false;

    if (wasJustCompleted) triggerCelebration();
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
    state = loadState();
    const status = ignitionStatus(state);
    if (status.completed) {
      showCompletedState(status.coupon, false);
      return;
    }
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
    activePointerId = null;
    cancelAnimationFrame(animationFrame);

    const reward = pickReward();
    const result = issueReward(reward);
    showCompletedState(result.coupon, result.created);

    if (result.created) {
      elements.resultMessage.textContent = `星火回應了你的光，獲得「${result.coupon.name}」${result.coupon.value} 點通用優惠券，已同步到排課中心。每位用戶限一次。`;
      if (navigator.vibrate) navigator.vibrate([40, 45, 100]);
    }
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "center" });
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
  }

  function init() {
    setProgress(0);
    bindEvents();

    const status = persistLegacyCompletion();
    if (status.completed) showCompletedState(status.coupon, false);
  }

  init();
})();
