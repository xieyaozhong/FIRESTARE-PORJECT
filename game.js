(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const GOAL = 12;
  const TIME_LIMIT = 20;
  const REWARD_VALUE = 100;
  const REWARD_VERSION = "v1";

  const $ = selector => document.querySelector(selector);
  const elements = {
    courseSelect: $("#courseSelect"),
    courseDetail: $("#courseDetail"),
    score: $("#score"),
    goal: $("#goal"),
    time: $("#time"),
    playfield: $("#playfield"),
    startOverlay: $("#startOverlay"),
    startButton: $("#startButton"),
    resultPanel: $("#resultPanel"),
    resultIcon: $("#resultIcon"),
    resultTitle: $("#resultTitle"),
    resultMessage: $("#resultMessage"),
    retryButton: $("#retryButton"),
    claimLink: $("#claimLink")
  };

  let state = loadState();
  let score = 0;
  let playing = false;
  let startedAt = 0;
  let timerId = 0;
  let spawnId = 0;

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

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function localDateString(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function durationOf(course) {
    const duration = Number(course?.durationHours);
    return Number.isFinite(duration) && duration > 0 ? duration : 1.5;
  }

  function timeRange(course) {
    const match = String(course?.time || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return course?.time || "時間未定";
    const start = Number(match[1]) * 60 + Number(match[2]);
    const total = start + Math.round(durationOf(course) * 60);
    const end = total % 1440;
    const endText = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
    return `${course.time}－${total >= 1440 ? "翌日 " : ""}${endText}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "日期未定";
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }).format(new Date(`${dateString}T12:00:00`));
  }

  function availableCourses() {
    const today = localDateString();
    return (Array.isArray(state.courses) ? state.courses : [])
      .filter(course => course?.id && course?.date && course.date >= today)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  function selectedCourse() {
    return availableCourses().find(course => course.id === elements.courseSelect.value) || null;
  }

  function rewardKey(course) {
    return `spark-course-game:${course.id}:${REWARD_VERSION}`;
  }

  function existingReward(course) {
    return (Array.isArray(state.coupons) ? state.coupons : [])
      .find(coupon => coupon.rewardKey === rewardKey(course));
  }

  function populateCourses() {
    state = loadState();
    const courses = availableCourses();
    const requestedId = new URLSearchParams(location.search).get("course");

    if (!courses.length) {
      elements.courseSelect.innerHTML = '<option value="">目前沒有可領券的課程</option>';
      elements.courseSelect.disabled = true;
      elements.startButton.disabled = true;
      elements.courseDetail.textContent = "請先回到排課中心，由開課端建立未來課程。";
      return;
    }

    elements.courseSelect.innerHTML = courses.map(course => `
      <option value="${escapeHtml(course.id)}">${escapeHtml(course.title)}｜${escapeHtml(formatDate(course.date))}</option>
    `).join("");

    if (courses.some(course => course.id === requestedId)) elements.courseSelect.value = requestedId;
    updateCourseDetail();
  }

  function updateCourseDetail() {
    const course = selectedCourse();
    if (!course) return;
    const reward = existingReward(course);
    const rewardText = reward
      ? reward.uses > 0
        ? `這堂課的優惠券已領取，尚有 ${reward.uses} 次可使用。`
        : "這堂課的遊戲優惠券已經領取並使用完畢。"
      : `過關可領取「${course.title}」專用 ${REWARD_VALUE} 點優惠券。`;

    elements.courseDetail.innerHTML = `
      <strong>${escapeHtml(course.title)}</strong><br>
      ${escapeHtml(formatDate(course.date))}・${escapeHtml(timeRange(course))}・${escapeHtml(course.teacher || "老師未定")}<br>
      ${escapeHtml(rewardText)}
    `;
  }

  function clearSparks() {
    elements.playfield.querySelectorAll(".spark").forEach(spark => spark.remove());
  }

  function spawnSpark() {
    if (!playing) return;
    const existing = elements.playfield.querySelectorAll(".spark").length;
    if (existing >= 5) return;

    const spark = document.createElement("button");
    spark.type = "button";
    spark.className = "spark";
    spark.setAttribute("aria-label", "收集星火");

    const fieldWidth = elements.playfield.clientWidth;
    const fieldHeight = elements.playfield.clientHeight;
    const size = fieldWidth <= 680 ? 62 : 56;
    const safeBottom = 88;
    const maxX = Math.max(8, fieldWidth - size - 12);
    const maxY = Math.max(8, fieldHeight - size - safeBottom);
    spark.style.left = `${8 + Math.random() * Math.max(1, maxX - 8)}px`;
    spark.style.top = `${8 + Math.random() * Math.max(1, maxY - 8)}px`;

    spark.addEventListener("click", () => collectSpark(spark), { once: true });
    elements.playfield.appendChild(spark);

    window.setTimeout(() => {
      if (spark.isConnected && playing) spark.remove();
    }, 1800);
  }

  function collectSpark(spark) {
    if (!playing) return;
    spark.classList.add("is-hit");
    score += 1;
    elements.score.textContent = String(score);
    if (navigator.vibrate) navigator.vibrate(18);
    window.setTimeout(() => spark.remove(), 180);

    if (score >= GOAL) finishGame(true);
    else spawnSpark();
  }

  function updateTimer() {
    if (!playing) return;
    const elapsed = (performance.now() - startedAt) / 1000;
    const remaining = Math.max(0, TIME_LIMIT - elapsed);
    elements.time.textContent = remaining.toFixed(1);
    if (remaining <= 0) finishGame(false);
  }

  function startGame() {
    const course = selectedCourse();
    if (!course || playing) return;

    score = 0;
    playing = true;
    startedAt = performance.now();
    elements.score.textContent = "0";
    elements.time.textContent = TIME_LIMIT.toFixed(1);
    elements.courseSelect.disabled = true;
    elements.startOverlay.hidden = true;
    elements.resultPanel.hidden = true;
    clearSparks();

    for (let index = 0; index < 3; index += 1) {
      window.setTimeout(spawnSpark, index * 180);
    }
    spawnId = window.setInterval(spawnSpark, 520);
    timerId = window.setInterval(updateTimer, 80);
  }

  function issueReward(course) {
    state = loadState();
    state.coupons = Array.isArray(state.coupons) ? state.coupons : [];
    const existing = existingRewardFromState(course, state);
    if (existing) return { coupon: existing, created: false };

    const coupon = {
      id: `coupon-game-${course.id}-${Date.now().toString(36)}`,
      name: `${course.title}・星火闖關券`,
      type: "flat",
      value: REWARD_VALUE,
      uses: 1,
      courseId: course.id,
      rewardKey: rewardKey(course),
      rewardSource: "spark-course-mini-game",
      createdAt: Date.now()
    };

    state.coupons.push(coupon);
    state.activities = Array.isArray(state.activities) ? state.activities : [];
    state.activities.unshift({
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      time: Date.now(),
      text: `完成星火小遊戲，領取「${course.title}」專用 ${REWARD_VALUE} 點優惠券。`
    });
    state.activities = state.activities.slice(0, 40);
    saveState();
    return { coupon, created: true };
  }

  function existingRewardFromState(course, sourceState) {
    return (Array.isArray(sourceState.coupons) ? sourceState.coupons : [])
      .find(coupon => coupon.rewardKey === rewardKey(course));
  }

  function finishGame(success) {
    if (!playing) return;
    playing = false;
    window.clearInterval(timerId);
    window.clearInterval(spawnId);
    clearSparks();
    elements.courseSelect.disabled = false;

    const course = selectedCourse();
    elements.resultPanel.hidden = false;
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "center" });

    if (!success || !course) {
      elements.resultIcon.textContent = "🌙";
      elements.resultTitle.textContent = "差一點就成功了";
      elements.resultMessage.textContent = `這次收集了 ${score} 個星火，再挑戰一次，收集 ${GOAL} 個即可過關。`;
      elements.claimLink.hidden = true;
      return;
    }

    const reward = issueReward(course);
    elements.resultIcon.textContent = reward.created ? "🎉" : "🎟️";
    elements.resultTitle.textContent = reward.created ? "挑戰完成，優惠券已發放" : "挑戰完成";
    elements.resultMessage.textContent = reward.created
      ? `已將「${course.title}」專用 ${REWARD_VALUE} 點優惠券加入排課中心。選擇這堂課後即可使用。`
      : `你已經領取過「${course.title}」的遊戲優惠券，本次不會重複發放。`;
    elements.claimLink.hidden = false;
    elements.claimLink.href = `./index.html?course=${encodeURIComponent(course.id)}&reward=claimed`;
    updateCourseDetail();
  }

  function init() {
    elements.goal.textContent = String(GOAL);
    elements.time.textContent = TIME_LIMIT.toFixed(1);
    populateCourses();
    elements.courseSelect.addEventListener("change", updateCourseDetail);
    elements.startButton.addEventListener("click", startGame);
    elements.retryButton.addEventListener("click", startGame);
    window.addEventListener("resize", () => {
      if (playing) clearSparks();
    });
  }

  init();
})();
