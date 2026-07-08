(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  let pendingSubmission = false;

  function loadState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return state && typeof state === "object" ? state : {};
    } catch {
      return {};
    }
  }

  function localDateString(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function nowKey() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${localDateString(now)}T${hours}:${minutes}`;
  }

  function courseKey(course) {
    return `${course.date || ""}T${course.time || "00:00"}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "日期未定";
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("zh-TW", {
      month: "numeric",
      day: "numeric",
      weekday: "short"
    }).format(date);
  }

  function getBookedUpcomingCourses(state) {
    const history = Array.isArray(state.history) ? state.history : [];
    const seen = new Set();

    return history
      .flatMap(item => Array.isArray(item.courses) ? item.courses : [])
      .filter(course => course && course.date && courseKey(course) >= nowKey())
      .filter(course => {
        const identity = `${course.id || course.title}|${course.date}|${course.time}`;
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      })
      .sort((a, b) => courseKey(a).localeCompare(courseKey(b)));
  }

  function updateUpcomingCourse() {
    const target = $("#nextClassText");
    if (!target) return;

    const courses = getBookedUpcomingCourses(loadState());
    const nextCourse = courses[0];

    if (!nextCourse) {
      target.textContent = "尚未完成排課";
      return;
    }

    const moreText = courses.length > 1 ? `（另有 ${courses.length - 1} 堂）` : "";
    target.textContent = `${formatDate(nextCourse.date)} ${nextCourse.time}・${nextCourse.title}${moreText}`;
  }

  function injectStyles() {
    if ($("#redemptionNoticeStyles")) return;
    const style = document.createElement("style");
    style.id = "redemptionNoticeStyles";
    style.textContent = `
      .receipt-redemption-note[hidden] { display: none !important; }
      .receipt-redemption-note {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
        margin-top: 14px;
        padding: 12px 13px;
        background: #d8ffe8;
        border: 3px solid var(--ink, #29243e);
        box-shadow: 3px 3px 0 #24765c;
      }
      .receipt-redemption-note .notice-icon {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        font-size: 22px;
        background: #fff;
        border: 3px solid var(--ink, #29243e);
      }
      .receipt-redemption-note strong,
      .receipt-redemption-note span { display: block; }
      .receipt-redemption-note strong { margin-bottom: 4px; font-size: 12px; }
      .receipt-redemption-note span { color: #315c4c; font-size: 10px; line-height: 1.7; }
      #finishReceipt.receipt-leave-btn { background: #4f4671; box-shadow: 4px 4px 0 #29243e; }
      @media (max-width: 560px) {
        .receipt-redemption-note { grid-template-columns: 1fr; text-align: center; }
        .receipt-redemption-note .notice-icon { margin: 0 auto; }
      }
      @media print {
        .receipt-redemption-note { box-shadow: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function injectRedemptionNotice() {
    if ($("#receiptRedemptionNotice")) return;
    const card = $("#scheduleDialog .dialog-card");
    const actions = card?.querySelector(".dialog-actions");
    if (!card || !actions) return;

    const notice = document.createElement("section");
    notice.id = "receiptRedemptionNotice";
    notice.className = "receipt-redemption-note";
    notice.setAttribute("role", "note");
    notice.hidden = true;
    notice.innerHTML = `
      <div class="notice-icon" aria-hidden="true">📲</div>
      <div>
        <strong>完成後請進行核銷</strong>
        <span>請截圖此排課單並傳至官方 LINE，或親臨櫃檯出示畫面核銷。</span>
      </div>
    `;
    actions.before(notice);
  }

  function configureReceiptStay() {
    const dialog = $("#scheduleDialog");
    const submitButton = $("#submitSchedule");
    const closeButton = $("#closeDialog");
    const finishButton = $("#finishReceipt");
    const notice = $("#receiptRedemptionNotice");

    if (!dialog || !submitButton || !finishButton || !notice) return;

    if (closeButton) closeButton.hidden = true;
    finishButton.textContent = "離開結算畫面";
    finishButton.classList.add("receipt-leave-btn");

    submitButton.addEventListener("click", () => {
      if (!submitButton.disabled) pendingSubmission = true;
    }, true);

    dialog.addEventListener("cancel", event => {
      if (dialog.open) event.preventDefault();
    });

    dialog.addEventListener("click", event => {
      if (dialog.open && event.target === dialog) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    new MutationObserver(() => {
      if (dialog.open && pendingSubmission) {
        notice.hidden = false;
        dialog.scrollTop = 0;
        pendingSubmission = false;
      }
    }).observe(dialog, { attributes: true, attributeFilter: ["open"] });

    dialog.addEventListener("close", () => {
      notice.hidden = true;
      pendingSubmission = false;
    });
  }

  function observeChanges() {
    const historyList = $("#historyList");
    if (historyList) {
      new MutationObserver(() => queueMicrotask(updateUpcomingCourse))
        .observe(historyList, { childList: true, subtree: true });
    }

    window.addEventListener("storage", event => {
      if (!event.key || event.key === STORAGE_KEY) updateUpcomingCourse();
    });

    window.setInterval(updateUpcomingCourse, 30000);
  }

  function init() {
    injectStyles();
    injectRedemptionNotice();
    configureReceiptStay();
    updateUpcomingCourse();
    observeChanges();
    window.setTimeout(updateUpcomingCourse, 100);
    window.setTimeout(updateUpcomingCourse, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
