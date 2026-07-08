(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let queued = false;

  const REWARD_META = {
    ember: { name: "微光火種券", rarity: "普通", symbol: "✦" },
    dawn: { name: "晨曦星芒券", rarity: "進階", symbol: "☀" },
    forest: { name: "森語螢火券", rarity: "稀有", symbol: "❖" },
    aurora: { name: "極光星焰券", rarity: "珍稀", symbol: "✧" },
    royal: { name: "紫晶聖火券", rarity: "史詩", symbol: "◆" },
    legendary: { name: "傳說金焰券", rarity: "傳說", symbol: "★" }
  };

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

  function themeForValue(value) {
    const points = Number(value) || 0;
    if (points >= 150) return "legendary";
    if (points >= 120) return "royal";
    if (points >= 100) return "aurora";
    if (points >= 80) return "forest";
    if (points >= 60) return "dawn";
    return "ember";
  }

  function migrateGameCoupons() {
    const state = loadState();
    let changed = false;

    (state.coupons || []).forEach(coupon => {
      if (coupon?.rewardSource !== "spark-course-mini-game") return;

      const theme = coupon.rewardTheme || themeForValue(coupon.value);
      const meta = REWARD_META[theme] || REWARD_META.ember;

      if (coupon.courseId) {
        delete coupon.courseId;
        changed = true;
      }
      if (coupon.rewardKey) {
        delete coupon.rewardKey;
        changed = true;
      }
      if (coupon.rewardScope !== "universal") {
        coupon.rewardScope = "universal";
        changed = true;
      }
      if (coupon.rewardTheme !== theme) {
        coupon.rewardTheme = theme;
        changed = true;
      }
      if (!coupon.rewardRarity) {
        coupon.rewardRarity = meta.rarity;
        changed = true;
      }
      if (!coupon.rewardSymbol) {
        coupon.rewardSymbol = meta.symbol;
        changed = true;
      }
      if (!coupon.name || coupon.name.includes("・星火闖關券")) {
        coupon.name = meta.name;
        changed = true;
      }
    });

    if (changed) saveState(state);
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
      .course-game-banner strong,
      .course-game-banner small { position: relative; z-index: 1; display: block; }
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
        --coupon-a: #ffe0a1;
        --coupon-b: #ff9c57;
        --coupon-accent: #df5a2f;
        --coupon-dark: #793721;
        position: relative;
        overflow: hidden;
        min-height: 104px;
        padding: 14px 18px;
        background:
          linear-gradient(90deg, transparent 0 68%, rgba(255,255,255,.23) 68% 69%, transparent 69%),
          linear-gradient(135deg, var(--coupon-a) 0 56%, var(--coupon-b) 56% 100%);
        border: 4px solid var(--ink, #29243e);
        box-shadow: 4px 4px 0 var(--coupon-dark);
      }
      .coupon-card.game-voucher-card.theme-ember { --coupon-a:#ffe0a1; --coupon-b:#ff9c57; --coupon-accent:#df5a2f; --coupon-dark:#793721; }
      .coupon-card.game-voucher-card.theme-dawn { --coupon-a:#fff5ae; --coupon-b:#ffd65d; --coupon-accent:#f09a2d; --coupon-dark:#8c521d; }
      .coupon-card.game-voucher-card.theme-forest { --coupon-a:#d8f3bd; --coupon-b:#78c98d; --coupon-accent:#318260; --coupon-dark:#24553f; }
      .coupon-card.game-voucher-card.theme-aurora { --coupon-a:#d9f0ff; --coupon-b:#88b8ff; --coupon-accent:#5f6fd7; --coupon-dark:#36447f; }
      .coupon-card.game-voucher-card.theme-royal { --coupon-a:#ead8ff; --coupon-b:#a883e7; --coupon-accent:#7551b8; --coupon-dark:#463074; }
      .coupon-card.game-voucher-card.theme-legendary {
        --coupon-a:#fff7a6;
        --coupon-b:#ffb833;
        --coupon-accent:#e26c21;
        --coupon-dark:#8a4218;
        box-shadow: 0 0 0 3px #fff1a5, 5px 5px 0 #6c3213, 0 0 24px rgba(255,190,49,.55);
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
        color: var(--coupon-dark);
        font-size: 15px;
        text-align: right;
      }
      .game-voucher-card .voucher-kicker {
        color: var(--coupon-dark) !important;
        font-size: 7px !important;
        font-weight: 900 !important;
        letter-spacing: .12em;
      }
      .game-voucher-card .voucher-meta {
        display: flex !important;
        flex-wrap: wrap;
        gap: 4px;
        margin: 4px 0;
      }
      .game-voucher-card .voucher-meta b {
        padding: 2px 5px;
        color: #fff;
        font-size: 7px;
        background: var(--coupon-accent);
        border: 2px solid var(--ink, #29243e);
      }
      .game-voucher-card .voucher-serial {
        color: var(--coupon-dark) !important;
        font-size: 7px !important;
        letter-spacing: .08em;
      }
      .coupon-card.game-voucher-card.is-active {
        outline: 4px solid #fff;
        box-shadow: 0 0 0 7px var(--coupon-accent), 5px 5px 0 var(--coupon-dark);
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

  function decorateGameBanner() {
    const couponList = $("#couponList");
    if (!couponList) return;

    let banner = $("#courseGameBanner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "courseGameBanner";
      banner.className = "course-game-banner";
      couponList.before(banner);
    }

    if (banner.dataset.version === "universal-v1") return;
    banner.dataset.version = "universal-v1";
    banner.innerHTML = `
      <span class="game-icon" aria-hidden="true">🔥</span>
      <span>
        <strong>長按火堆，點亮星火</strong>
        <small>完成後隨機獲得不同稀有度與面額的全課程通用像素優惠券</small>
      </span>
      <a class="ignite-spark-button" href="./game.html">✦ 點亮星火</a>
    `;
  }

  function decorateCoupons(state) {
    const coupons = new Map((state.coupons || []).map(coupon => [coupon.id, coupon]));

    $$("#couponList .coupon-card").forEach(card => {
      const couponId = $("input", card)?.value;
      const coupon = coupons.get(couponId);
      if (coupon?.rewardSource !== "spark-course-mini-game") return;

      const theme = coupon.rewardTheme || themeForValue(coupon.value);
      const meta = REWARD_META[theme] || REWARD_META.ember;
      const textContainer = card.querySelector("span");

      card.classList.add("game-voucher-card");
      [...card.classList]
        .filter(className => className.startsWith("theme-"))
        .forEach(className => card.classList.remove(className));
      card.classList.add(`theme-${theme}`);
      card.classList.remove("is-course-locked");

      if (!textContainer) return;

      let kicker = $(".voucher-kicker", card);
      if (!kicker) {
        kicker = document.createElement("small");
        kicker.className = "voucher-kicker";
        textContainer.prepend(kicker);
      }
      const kickerText = `${coupon.rewardSymbol || meta.symbol} FIRESTAR RANDOM REWARD`;
      if (kicker.textContent !== kickerText) kicker.textContent = kickerText;

      let voucherMeta = $(".voucher-meta", card);
      if (!voucherMeta) {
        voucherMeta = document.createElement("small");
        voucherMeta.className = "voucher-meta";
        textContainer.appendChild(voucherMeta);
      }
      const metaSignature = `${coupon.rewardRarity || meta.rarity}|universal`;
      if (voucherMeta.dataset.signature !== metaSignature) {
        voucherMeta.dataset.signature = metaSignature;
        voucherMeta.innerHTML = `<b>${coupon.rewardRarity || meta.rarity}</b><b>全課程通用</b>`;
      }

      let serial = $(".voucher-serial", card);
      if (!serial) {
        serial = document.createElement("small");
        serial.className = "voucher-serial";
        textContainer.appendChild(serial);
      }
      const serialText = `NO. ${String(coupon.id || "").slice(-10).toUpperCase()}`;
      if (serial.textContent !== serialText) serial.textContent = serialText;

      $(".coupon-course-limit", card)?.remove();
    });
  }

  function decorate() {
    const state = loadState();
    removeLegacyCourseLinks();
    decorateGameBanner();
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

  function init() {
    migrateGameCoupons();
    injectStyles();
    scheduleDecorate();
    new MutationObserver(scheduleDecorate).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", event => {
      if (!event.key || event.key === STORAGE_KEY) scheduleDecorate();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
