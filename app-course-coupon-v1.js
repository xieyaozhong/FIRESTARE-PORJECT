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
    const today = new Date().toISOString().slice(0, 10);
    return (state.courses || [])
      .filter(course => course?.id && course?.date >= today)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0]?.id || "";
  }

  function injectStyles() {
    if ($("#courseGameStyles")) return;
    const style = document.createElement("style");
    style.id = "courseGameStyles";
    style.textContent = `
      .course-game-link {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 31px;
        margin-top: 8px;
        padding: 5px 8px;
        color: #fff;
        text-decoration: none;
        font-size: 9px;
        font-weight: 900;
        background: #ef7d32;
        border: 2px solid var(--ink, #29243e);
        box-shadow: 2px 2px 0 #9b4f1e;
      }
      .course-game-link:active { transform: translate(2px, 2px); box-shadow: none; }
      .course-game-banner {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 9px;
        align-items: center;
        margin: 0 0 12px;
        padding: 10px;
        background: #fff2c4;
        border: 3px solid var(--ink, #29243e);
      }
      .course-game-banner .game-icon { font-size: 24px; }
      .course-game-banner strong, .course-game-banner small { display: block; }
      .course-game-banner strong { margin-bottom: 3px; font-size: 11px; }
      .course-game-banner small { color: #6b6275; font-size: 8px; line-height: 1.5; }
      .course-game-banner a {
        padding: 6px 8px;
        color: #fff;
        text-decoration: none;
        font-size: 9px;
        font-weight: 900;
        background: #6858ba;
        border: 2px solid var(--ink, #29243e);
        white-space: nowrap;
      }
      .coupon-course-limit { color: #a34d19 !important; font-weight: 900 !important; }
      .coupon-card.is-course-locked { opacity: .55; filter: grayscale(.25); }
      .coupon-card.is-course-locked input { pointer-events: none; }
      @media (max-width: 560px) {
        .course-game-banner { grid-template-columns: auto 1fr; }
        .course-game-banner a { grid-column: 1 / -1; text-align: center; }
      }
    `;
    document.head.appendChild(style);
  }

  function decorateCourseCards(state) {
    const coupons = Array.isArray(state.coupons) ? state.coupons : [];
    $$(".course-card[data-id]").forEach(card => {
      if ($(".course-game-link", card)) return;
      const course = (state.courses || []).find(item => item.id === card.dataset.id);
      const info = $(".course-info", card);
      if (!course || !info) return;

      const claimed = coupons.some(coupon => coupon.rewardSource === "spark-course-mini-game" && coupon.courseId === course.id);
      const link = document.createElement("a");
      link.className = "course-game-link";
      link.href = `./game.html?course=${encodeURIComponent(course.id)}`;
      link.textContent = claimed ? "🎟️ 查看遊戲優惠券" : "🎮 玩遊戲拿 100 點券";
      info.appendChild(link);
    });
  }

  function decorateGameBanner(state) {
    const couponArea = $(".coupon-area");
    const couponList = $("#couponList");
    if (!couponArea || !couponList) return;

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
    banner.innerHTML = `
      <span class="game-icon" aria-hidden="true">🎮</span>
      <span>
        <strong>完成星火小遊戲拿課程優惠券</strong>
        <small>${course ? `目前將挑戰「${course.title}」的專用優惠券` : "進入遊戲後選擇課程"}</small>
      </span>
      <a href="${href}">開始遊戲</a>
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
      let limit = $(".coupon-course-limit", card);
      if (!limit && textContainer) {
        limit = document.createElement("small");
        limit.className = "coupon-course-limit";
        textContainer.appendChild(limit);
      }
      if (limit) limit.textContent = `限定課程：${course?.title || "指定課程"}`;
      card.classList.toggle("is-course-locked", !selectedIds.has(coupon.courseId));
    });
  }

  function enforceCouponScope(state) {
    const coupon = (state.coupons || []).find(item => item.id === state.selectedCouponId);
    if (!coupon?.courseId) return;
    const selected = Array.isArray(state.selectedCourseIds) ? state.selectedCourseIds : [];
    if (selected.includes(coupon.courseId)) return;
    state.selectedCouponId = null;
    saveState(state);
  }

  function decorate() {
    const state = loadState();
    enforceCouponScope(state);
    decorateCourseCards(state);
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
