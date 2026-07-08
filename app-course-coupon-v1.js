(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let queued = false;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    const value = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, value);
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: value }));
    } catch {
      window.dispatchEvent(new Event("storage"));
    }
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

  function showMessage(message, tone = "error") {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast is-show is-${tone}`;
    window.setTimeout(() => {
      if (toast.textContent === message) toast.className = "toast";
    }, 2600);
  }

  function selectedCourseId(state) {
    const selected = Array.isArray(state.selectedCourseIds) ? state.selectedCourseIds : [];
    if (selected.length) return selected[0];
    const today = localDateString();
    return (state.courses || [])
      .filter(course => course?.id && course?.date >= today)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0]?.id || "";
  }

  function injectStyles() {
    if ($("#courseGameStyles")) return;
    const style = document.createElement("style");
    style.id = "courseGameStyles";
    style.textContent = `
      .course-game-link { display: none !important; }
      .course-game-banner {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 11px;
        align-items: center;
        margin: 0 0 12px;
        padding: 12px;
        background: linear-gradient(135deg, #fff4ba 0 63%, #ffd071 63% 100%);
        border: 3px solid var(--ink, #29243e);
        box-shadow: 3px 3px 0 #ad6526;
      }
      .course-game-banner::after {
        content: "✦";
        position: absolute;
        right: 8px;
        top: -18px;
        color: rgba(255,255,255,.42);
        font-size: 72px;
        pointer-events: none;
      }
      .course-game-banner .game-icon {
        position: relative;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        font-size: 24px;
        background: #fff;
        border: 3px solid var(--ink, #29243e);
        box-shadow: 3px 3px 0 #b55925;
      }
      .course-game-banner strong, .course-game-banner small { position: relative; z-index: 1; display: block; }
      .course-game-banner strong { margin-bottom: 3px; font-size: 11px; }
      .course-game-banner small { color: #6b572f; font-size: 8px; line-height: 1.55; }
      .ignite-spark-button {
        position: relative;
        z-index: 2;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-height: 39px;
        padding: 8px 12px;
        color: #fff;
        text-decoration: none;
        font-size: 10px;
        font-weight: 900;
        background: #ef7d32;
        border: 3px solid var(--ink, #29243e);
        box-shadow: 3px 3px 0 #9b4f1e, inset 2px 2px 0 rgba(255,255,255,.35);
        white-space: nowrap;
      }
      .ignite-spark-button:active { transform: translate(3px, 3px); box-shadow: none; }

      .coupon-card.game-voucher-card {
        position: relative;
        overflow: hidden;
        min-height: 92px;
        padding: 13px 18px;
        background:
          linear-gradient(90deg, transparent 0 67%, rgba(255,255,255,.24) 67% 68%, transparent 68%),
          linear-gradient(135deg, #fff1a8 0 56%, #ffcb66 56% 100%);
        border: 4px solid var(--ink, #29243e);
        box-shadow: 4px 4px 0 #9a4f20;
      }
      .coupon-card.game-voucher-card::before,
      .coupon-card.game-voucher-card::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 18px;
        height: 18px;
        background: var(--paper, #fff9e9);
        border: 3px solid var(--ink, #29243e);
        border-radius: 50%;
        transform: translateY(-50%);
        z-index: 3;
      }
      .coupon-card.game-voucher-card::before { left: -12px; }
      .coupon-card.game-voucher-card::after { right: -12px; }
      .coupon-card.game-voucher-card > span { position: relative; z-index: 2; }
      .coupon-card.game-voucher-card .coupon-value {
        position: relative;
        z-index: 2;
        min-width: 72px;
        color: #8c3f17;
        font-size: 15px;
        text-align: right;
      }
      .game-voucher-card .voucher-kicker {
        color: #7a3d1c !important;
        font-size: 7px !important;
        font-weight: 900 !important;
        letter-spacing: .12em;
      }
      .game-voucher-card .voucher-serial {
        color: #81633c !important;
        font-size: 7px !important;
        letter-spacing: .08em;
      }
      .coupon-course-limit { color: #a34d19 !important; font-weight: 900 !important; }
      .coupon-card.is-course-locked { opacity: .58; filter: grayscale(.25); }
      .coupon-card.is-course-locked input { pointer-events: none; }
      .coupon-card.game-voucher-card.is-active {
        outline: 4px solid #fff;
        box-shadow: 0 0 0 7px #ef7d32, 5px 5px 0 #7e3e19;
      }
      @media (max-width: 560px) {
        .course-game-banner { grid-template-columns: auto 1fr; }
        .ignite-spark-button { grid-column: 1 / -1; width: 100%; }
        .coupon-card.game-voucher-card { padding: 12px 15px; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeLegacyCourseLinks() {
    $$(".course-game-link").forEach(link => link.remove());
  }

  function decorateGameBanner(state) {
    const couponList = $("#couponList");
    if (!couponList) return;

    let banner = $("#courseGameBanner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "courseGameBanner";
      banner.className = "course-game-banner";
      couponList.before(banner);
    }

    const courseId = selectedCourseId(state);
    const course = (state.courses || []).find(item => item.id === courseId);
    const href = courseId ? `./game.html?course=${encodeURIComponent(courseId)}` : "./game.html";
    const signature = `${courseId}|${course?.title || ""}|${href}`;
    if (banner.dataset.signature === signature) return;

    banner.dataset.signature = signature;
    banner.innerHTML = `
      <span class="game-icon" aria-hidden="true">🔥</span>
      <span>
        <strong>點亮星火，取得課程優惠券</strong>
        <small>${course ? `目前挑戰獎勵：${escapeHtml(course.title)}專用 100 點券` : "進入遊戲後選擇想領券的課程"}</small>
      </span>
      <a class="ignite-spark-button" href="${href}">✦ 點亮星火</a>
    `;
  }

  function decorateCoupons(state) {
    const selectedIds = new Set(Array.isArray(state.selectedCourseIds) ? state.selectedCourseIds : []);
    const courses = new Map((state.courses || []).map(course => [course.id, course]));
    const coupons = new Map((state.coupons || []).map(coupon => [coupon.id, coupon]));

    $$("#couponList .coupon-card").forEach(card => {
      const couponId = $("input", card)?.value;
      const coupon = coupons.get(couponId);
      if (!coupon?.courseId) return;

      const course = courses.get(coupon.courseId);
      const textContainer = card.querySelector("span");
      const isGameReward = coupon.rewardSource === "spark-course-mini-game";
      card.classList.toggle("game-voucher-card", isGameReward);

      if (isGameReward && textContainer) {
        let kicker = $(".voucher-kicker", card);
        if (!kicker) {
          kicker = document.createElement("small");
          kicker.className = "voucher-kicker";
          kicker.textContent = "✦ FIRESTAR QUEST REWARD";
          textContainer.prepend(kicker);
        }

        let serial = $(".voucher-serial", card);
        if (!serial) {
          serial = document.createElement("small");
          serial.className = "voucher-serial";
          textContainer.appendChild(serial);
        }
        serial.textContent = `NO. ${String(coupon.id || "").slice(-8).toUpperCase()}`;
      }

      let limit = $(".coupon-course-limit", card);
      if (!limit && textContainer) {
        limit = document.createElement("small");
        limit.className = "coupon-course-limit";
        textContainer.appendChild(limit);
      }
      const limitText = `限定課程：${course?.title || "指定課程"}`;
      if (limit && limit.textContent !== limitText) limit.textContent = limitText;

      const locked = !selectedIds.has(coupon.courseId);
      if (card.classList.contains("is-course-locked") !== locked) {
        card.classList.toggle("is-course-locked", locked);
      }
    });
  }

  function enforceCouponScope(state) {
    const coupon = (state.coupons || []).find(item => item.id === state.selectedCouponId);
    if (!coupon?.courseId) return false;
    const selected = Array.isArray(state.selectedCourseIds) ? state.selectedCourseIds : [];
    if (selected.includes(coupon.courseId)) return false;
    state.selectedCouponId = null;
    saveState(state);
    return true;
  }

  function decorate() {
    const state = loadState();
    if (enforceCouponScope(state)) return;
    removeLegacyCourseLinks();
    decorateGameBanner(state);
    decorateCoupons(state);
  }

  function scheduleDecorate() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorate();
    });
  }

  function bindCouponGuard() {
    const couponList = $("#couponList");
    if (!couponList) return;
    couponList.addEventListener("click", event => {
      const card = event.target.closest(".coupon-card");
      const couponId = card?.querySelector("input")?.value;
      if (!couponId) return;

      const state = loadState();
      const coupon = (state.coupons || []).find(item => item.id === couponId);
      if (!coupon?.courseId) return;
      const selected = Array.isArray(state.selectedCourseIds) ? state.selectedCourseIds : [];
      if (selected.includes(coupon.courseId)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      const course = (state.courses || []).find(item => item.id === coupon.courseId);
      showMessage(`此優惠券僅適用「${course?.title || "指定課程"}」，請先加入該課程。`);
    }, true);
  }

  function init() {
    injectStyles();
    bindCouponGuard();
    scheduleDecorate();
    new MutationObserver(scheduleDecorate).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", event => {
      if (!event.key || event.key === STORAGE_KEY) scheduleDecorate();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
