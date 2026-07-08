(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const CATEGORIES = ["全部", "數學", "英文", "圍棋", "其他"];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const pad = value => String(value).padStart(2, "0");
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  function localDateString(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function addDays(dateString, days) {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);
    return localDateString(date);
  }

  function formatDate(dateString, withWeekday = true) {
    if (!dateString) return "未設定日期";
    const date = new Date(`${dateString}T12:00:00`);
    const options = { month: "numeric", day: "numeric" };
    if (withWeekday) options.weekday = "short";
    return new Intl.DateTimeFormat("zh-TW", options).format(date);
  }

  function formatFullDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    }).format(date);
  }

  function formatTimestamp(timestamp) {
    return new Intl.DateTimeFormat("zh-TW", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function defaultState() {
    return {
      points: 1280,
      selectedCourseIds: [],
      selectedCouponId: null,
      courses: [
        {
          id: "course-math-prep",
          title: "數學先修班",
          date: "2026-07-14",
          time: "19:00",
          teacher: "曜中老師",
          category: "數學",
          cost: 320,
          seats: 12,
          note: "國一先修・正負數與數線"
        },
        {
          id: "course-plus-english",
          title: "普拉斯英文",
          date: "2026-07-16",
          time: "18:30",
          teacher: "Plus Teacher",
          category: "英文",
          cost: 280,
          seats: 10,
          note: "口說任務與生活會話"
        },
        {
          id: "course-mpm-math",
          title: "MPM 數學",
          date: "2026-07-22",
          time: "19:30",
          teacher: "星火數學組",
          category: "數學",
          cost: 360,
          seats: 8,
          note: "圖像推理與數感訓練"
        },
        {
          id: "course-go-strategy",
          title: "圍棋戰術小隊",
          date: "2026-07-25",
          time: "14:00",
          teacher: "火苗老師",
          category: "圍棋",
          cost: 250,
          seats: 16,
          note: "吃子、連接與基礎死活"
        }
      ],
      coupons: [
        {
          id: "coupon-change-ticket",
          name: "調課卷",
          type: "flat",
          value: 120,
          uses: 1,
          createdAt: Date.now()
        }
      ],
      history: [],
      activities: [
        { id: uid("log"), time: Date.now(), text: "像素排課系統已啟動，載入示範課程與調課卷。" }
      ]
    };
  }

  function normalizeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    return {
      ...base,
      ...raw,
      points: Number.isFinite(Number(raw.points)) ? Math.max(0, Number(raw.points)) : base.points,
      selectedCourseIds: Array.isArray(raw.selectedCourseIds) ? raw.selectedCourseIds : [],
      courses: Array.isArray(raw.courses) ? raw.courses : base.courses,
      coupons: Array.isArray(raw.coupons) ? raw.coupons : base.coupons,
      history: Array.isArray(raw.history) ? raw.history : [],
      activities: Array.isArray(raw.activities) ? raw.activities : base.activities
    };
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (error) {
      console.warn("Failed to load state", error);
      return defaultState();
    }
  }

  let state = loadState();
  let activeCategory = "全部";
  let searchKeyword = "";
  let toastTimer = 0;
  let lastReceiptText = "";

  const elements = {
    headerPoints: $("#headerPoints"),
    walletPoints: $("#walletPoints"),
    walletMeter: $("#walletMeter"),
    todayDate: $("#todayDate"),
    nextClassText: $("#nextClassText"),
    courseCount: $("#courseCount"),
    courseSearch: $("#courseSearch"),
    categoryFilters: $("#categoryFilters"),
    courseList: $("#courseList"),
    dropZone: $("#dropZone"),
    emptyPlan: $("#emptyPlan"),
    selectedList: $("#selectedList"),
    selectedCount: $("#selectedCount"),
    grossPoints: $("#grossPoints"),
    discountPoints: $("#discountPoints"),
    couponCount: $("#couponCount"),
    couponList: $("#couponList"),
    finalPoints: $("#finalPoints"),
    checkoutHint: $("#checkoutHint"),
    submitSchedule: $("#submitSchedule"),
    clearSelection: $("#clearSelection"),
    historyList: $("#historyList"),
    clearHistory: $("#clearHistory"),
    adminCourseStat: $("#adminCourseStat"),
    adminSeatStat: $("#adminSeatStat"),
    adminPointStat: $("#adminPointStat"),
    courseForm: $("#courseForm"),
    pointForm: $("#pointForm"),
    couponForm: $("#couponForm"),
    adminCourseList: $("#adminCourseList"),
    sortCourses: $("#sortCourses"),
    resetDemo: $("#resetDemo"),
    activityList: $("#activityList"),
    toast: $("#toast"),
    dialog: $("#scheduleDialog"),
    closeDialog: $("#closeDialog"),
    finishReceipt: $("#finishReceipt"),
    copyReceipt: $("#copyReceipt"),
    receiptNumber: $("#receiptNumber"),
    receiptCourses: $("#receiptCourses"),
    receiptGross: $("#receiptGross"),
    receiptDiscount: $("#receiptDiscount"),
    receiptTotal: $("#receiptTotal"),
    receiptBalance: $("#receiptBalance")
  };

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function logActivity(text) {
    state.activities.unshift({ id: uid("log"), time: Date.now(), text });
    state.activities = state.activities.slice(0, 40);
  }

  function showToast(message, tone = "success") {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.className = `toast is-show is-${tone}`;
    toastTimer = window.setTimeout(() => {
      elements.toast.className = "toast";
    }, 2600);
  }

  function selectedCourses() {
    return state.selectedCourseIds
      .map(id => state.courses.find(course => course.id === id))
      .filter(Boolean)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  function selectedCoupon() {
    return state.coupons.find(coupon => coupon.id === state.selectedCouponId && coupon.uses > 0) || null;
  }

  function totals() {
    const gross = selectedCourses().reduce((sum, course) => sum + Number(course.cost || 0), 0);
    const coupon = selectedCoupon();
    let discount = 0;
    if (coupon && gross > 0) {
      discount = coupon.type === "percent"
        ? Math.round(gross * Math.min(100, Number(coupon.value)) / 100)
        : Math.min(gross, Number(coupon.value));
    }
    return { gross, discount, final: Math.max(0, gross - discount) };
  }

  function renderAll() {
    const validCourseIds = new Set(state.courses.map(course => course.id));
    state.selectedCourseIds = state.selectedCourseIds.filter(id => validCourseIds.has(id));
    if (!state.coupons.some(coupon => coupon.id === state.selectedCouponId && coupon.uses > 0)) {
      state.selectedCouponId = null;
    }
    saveState();
    renderHeader();
    renderFilters();
    renderCourseList();
    renderSelectedPlan();
    renderCoupons();
    renderHistory();
    renderAdmin();
  }

  function renderHeader() {
    const formattedPoints = Number(state.points).toLocaleString("zh-TW");
    elements.headerPoints.textContent = formattedPoints;
    elements.walletPoints.textContent = formattedPoints;
    elements.adminPointStat.textContent = formattedPoints;
    elements.walletMeter.style.width = `${Math.min(100, Math.max(4, state.points / 20))}%`;

    const today = new Date();
    elements.todayDate.textContent = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric", month: "long", day: "numeric", weekday: "short"
    }).format(today);

    const nowKey = `${localDateString(today)}T${pad(today.getHours())}:${pad(today.getMinutes())}`;
    const upcoming = state.courses
      .filter(course => course.seats > 0 && `${course.date}T${course.time}` >= nowKey)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
    elements.nextClassText.textContent = upcoming
      ? `${formatDate(upcoming.date)} ${upcoming.time}・${upcoming.title}`
      : "目前沒有即將到來的課程";
  }

  function renderFilters() {
    elements.categoryFilters.innerHTML = CATEGORIES.map(category => `
      <button class="filter-btn ${activeCategory === category ? "is-active" : ""}" type="button" data-category="${category}">
        ${category}
      </button>
    `).join("");
  }

  function renderCourseList() {
    const keyword = searchKeyword.trim().toLowerCase();
    const courses = [...state.courses]
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
      .filter(course => activeCategory === "全部" || course.category === activeCategory)
      .filter(course => !keyword || [course.title, course.teacher, course.date, course.note, course.category]
        .some(value => String(value || "").toLowerCase().includes(keyword)));

    elements.courseCount.textContent = courses.length;
    if (!courses.length) {
      elements.courseList.innerHTML = '<div class="empty-list">沒有符合條件的課程。</div>';
      return;
    }

    elements.courseList.innerHTML = courses.map(course => {
      const selected = state.selectedCourseIds.includes(course.id);
      const date = new Date(`${course.date}T12:00:00`);
      return `
        <article class="course-card ${selected ? "is-selected" : ""}" data-id="${escapeHtml(course.id)}" data-category="${escapeHtml(course.category)}" draggable="${course.seats > 0}">
          <div class="date-tile">
            <b>${date.getMonth() + 1}/${date.getDate()}</b>
            <small>${new Intl.DateTimeFormat("zh-TW", { weekday: "short" }).format(date)}</small>
          </div>
          <div class="course-info">
            <h4>${escapeHtml(course.title)}</h4>
            <div class="course-meta">
              <span>🕒 ${escapeHtml(course.time)}</span>
              <span>👤 ${escapeHtml(course.teacher)}</span>
              <span>◫ 剩 ${Number(course.seats)} 名</span>
            </div>
            <div class="course-bottom">
              <span class="cost-tag">✦ ${Number(course.cost).toLocaleString("zh-TW")} 點</span>
              <button class="add-course" type="button" data-action="add" data-id="${escapeHtml(course.id)}" ${course.seats <= 0 || selected ? "disabled" : ""}>
                ${selected ? "已加入" : "＋ 加入"}
              </button>
            </div>
          </div>
          ${course.seats <= 0 ? '<div class="sold-out">名額已滿</div>' : ""}
        </article>
      `;
    }).join("");
  }

  function renderSelectedPlan() {
    const courses = selectedCourses();
    const { gross, discount, final } = totals();
    elements.emptyPlan.hidden = courses.length > 0;
    elements.selectedCount.textContent = courses.length;
    elements.grossPoints.textContent = gross.toLocaleString("zh-TW");
    elements.discountPoints.textContent = discount.toLocaleString("zh-TW");
    elements.finalPoints.textContent = final.toLocaleString("zh-TW");

    elements.selectedList.innerHTML = courses.map((course, index) => `
      <article class="selected-course">
        <span class="selected-index">${pad(index + 1)}</span>
        <div>
          <h4>${escapeHtml(course.title)}</h4>
          <p>${formatFullDate(course.date)}・${escapeHtml(course.time)}・${escapeHtml(course.teacher)}・${Number(course.cost).toLocaleString("zh-TW")} 點</p>
        </div>
        <button class="remove-course" type="button" data-action="remove" data-id="${escapeHtml(course.id)}" aria-label="移除 ${escapeHtml(course.title)}">×</button>
      </article>
    `).join("");

    const canSubmit = courses.length > 0 && final <= state.points && courses.every(course => course.seats > 0);
    elements.submitSchedule.disabled = !canSubmit;
    if (!courses.length) elements.checkoutHint.textContent = "選擇課程後即可送出";
    else if (final > state.points) elements.checkoutHint.textContent = `點數不足，還差 ${(final - state.points).toLocaleString("zh-TW")} 點`;
    else elements.checkoutHint.textContent = `送出後剩餘 ${(state.points - final).toLocaleString("zh-TW")} 點`;
  }

  function renderCoupons() {
    const available = state.coupons.filter(coupon => coupon.uses > 0);
    elements.couponCount.textContent = `${available.length} 張`;
    if (!available.length) {
      elements.couponList.innerHTML = '<div class="empty-coupon">目前沒有可使用的優惠券。</div>';
      return;
    }

    elements.couponList.innerHTML = available.map(coupon => {
      const active = coupon.id === state.selectedCouponId;
      const valueText = coupon.type === "percent" ? `${coupon.value}% OFF` : `−${coupon.value} 點`;
      return `
        <label class="coupon-card ${active ? "is-active" : ""}">
          <input type="radio" name="activeCoupon" value="${escapeHtml(coupon.id)}" ${active ? "checked" : ""}>
          <span>
            <strong>${escapeHtml(coupon.name)}</strong>
            <small>可使用 ${Number(coupon.uses)} 次・點擊套用／取消</small>
          </span>
          <b class="coupon-value">${escapeHtml(valueText)}</b>
        </label>
      `;
    }).join("");
  }

  function renderHistory() {
    if (!state.history.length) {
      elements.historyList.innerHTML = '<div class="empty-list">尚未產生排課單，完成第一次排課後會顯示在這裡。</div>';
      return;
    }

    elements.historyList.innerHTML = state.history.slice(0, 8).map(item => `
      <article class="history-card">
        <div class="history-head">
          <strong>${escapeHtml(item.number)}</strong>
          <span>${formatTimestamp(item.createdAt)}</span>
        </div>
        <div class="history-courses">
          ${item.courses.map(course => `<div><span>${formatDate(course.date, false)} ${escapeHtml(course.title)}</span><b>${escapeHtml(course.time)}</b></div>`).join("")}
        </div>
        <div class="history-total"><span>${item.courses.length} 堂課</span><strong>−${Number(item.total).toLocaleString("zh-TW")} 點</strong></div>
      </article>
    `).join("");
  }

  function renderAdmin() {
    elements.adminCourseStat.textContent = state.courses.length;
    elements.adminSeatStat.textContent = state.courses.reduce((sum, course) => sum + Number(course.seats || 0), 0);

    if (!state.courses.length) {
      elements.adminCourseList.innerHTML = '<div class="empty-list">目前沒有已發佈課程。</div>';
    } else {
      elements.adminCourseList.innerHTML = [...state.courses]
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
        .map(course => `
          <article class="admin-course-row">
            <div><small>日期</small><strong>${formatDate(course.date, false)} ${escapeHtml(course.time)}</strong></div>
            <div class="admin-course-name"><small>${escapeHtml(course.category)}課程</small><strong>${escapeHtml(course.title)}</strong><small>${escapeHtml(course.note || "沒有備註")}</small></div>
            <div class="admin-teacher"><small>老師</small><strong>${escapeHtml(course.teacher)}</strong></div>
            <div class="admin-cost"><small>點數</small><strong>${Number(course.cost).toLocaleString("zh-TW")}</strong></div>
            <div class="admin-seats"><small>名額</small><strong>${Number(course.seats)}</strong></div>
            <button class="delete-course" type="button" data-action="delete-course" data-id="${escapeHtml(course.id)}">刪除</button>
          </article>
        `).join("");
    }

    elements.activityList.innerHTML = state.activities.length
      ? state.activities.map(item => `
          <div class="activity-item">
            <time datetime="${new Date(item.time).toISOString()}">${formatTimestamp(item.time)}</time>
            <p>${escapeHtml(item.text)}</p>
          </div>
        `).join("")
      : '<div class="empty-list">目前沒有操作紀錄。</div>';
  }

  function addCourseToPlan(courseId) {
    const course = state.courses.find(item => item.id === courseId);
    if (!course) return;
    if (course.seats <= 0) return showToast("這堂課目前沒有剩餘名額。", "error");
    if (state.selectedCourseIds.includes(courseId)) return showToast("這堂課已經在排課單裡。", "error");
    state.selectedCourseIds.push(courseId);
    saveState();
    renderCourseList();
    renderSelectedPlan();
    showToast(`已加入「${course.title}」`);
  }

  function removeCourseFromPlan(courseId) {
    state.selectedCourseIds = state.selectedCourseIds.filter(id => id !== courseId);
    saveState();
    renderCourseList();
    renderSelectedPlan();
  }

  function submitSchedule() {
    const courses = selectedCourses();
    const { gross, discount, final } = totals();
    if (!courses.length) return showToast("請先選擇至少一堂課。", "error");
    if (courses.some(course => course.seats <= 0)) return showToast("選擇的課程中有名額已滿，請重新選擇。", "error");
    if (final > state.points) return showToast("星火點數不足，無法完成排課。", "error");

    const coupon = selectedCoupon();
    state.points -= final;
    courses.forEach(course => { course.seats = Math.max(0, Number(course.seats) - 1); });
    if (coupon) coupon.uses = Math.max(0, Number(coupon.uses) - 1);

    const receipt = {
      id: uid("schedule"),
      number: `FS-${new Date().getFullYear()}-${Math.random().toString(10).slice(2, 8)}`,
      createdAt: Date.now(),
      courses: courses.map(course => ({ ...course })),
      coupon: coupon ? { ...coupon } : null,
      gross,
      discount,
      total: final,
      balance: state.points
    };
    state.history.unshift(receipt);
    state.history = state.history.slice(0, 20);
    state.selectedCourseIds = [];
    state.selectedCouponId = null;
    logActivity(`用戶完成排課：${courses.length} 堂，扣除 ${final} 點。`);
    saveState();
    renderAll();
    openReceipt(receipt);
  }

  function openReceipt(receipt) {
    elements.receiptNumber.textContent = `NO. ${receipt.number}`;
    elements.receiptCourses.innerHTML = receipt.courses.map(course => `
      <article class="receipt-course">
        <b>${formatDate(course.date, false)}</b>
        <div>
          <h4>${escapeHtml(course.title)}</h4>
          <p>${formatFullDate(course.date)}・${escapeHtml(course.time)}・${escapeHtml(course.teacher)}</p>
        </div>
        <span>${Number(course.cost).toLocaleString("zh-TW")} 點</span>
      </article>
    `).join("");
    elements.receiptGross.textContent = `${Number(receipt.gross).toLocaleString("zh-TW")} 點`;
    elements.receiptDiscount.textContent = `−${Number(receipt.discount).toLocaleString("zh-TW")} 點`;
    elements.receiptTotal.textContent = `${Number(receipt.total).toLocaleString("zh-TW")} 點`;
    elements.receiptBalance.textContent = `${Number(receipt.balance).toLocaleString("zh-TW")} 點`;

    lastReceiptText = [
      "【星火計畫排課單】",
      `單號：${receipt.number}`,
      ...receipt.courses.map((course, index) => `${index + 1}. ${course.date} ${course.time}｜${course.title}｜${course.teacher}`),
      `課程原價：${receipt.gross} 點`,
      `優惠折抵：${receipt.discount} 點`,
      `實際扣除：${receipt.total} 點`,
      `剩餘點數：${receipt.balance} 點`
    ].join("\n");

    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else elements.dialog.setAttribute("open", "");
  }

  function closeReceipt() {
    if (typeof elements.dialog.close === "function") elements.dialog.close();
    else elements.dialog.removeAttribute("open");
  }

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(lastReceiptText);
      showToast("排課內容已複製。", "success");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = lastReceiptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("排課內容已複製。", "success");
    }
  }

  function switchView(viewName) {
    $$(".tab-btn").forEach(button => button.classList.toggle("is-active", button.dataset.view === viewName));
    $$(".view").forEach(view => view.classList.toggle("is-active", view.id === `${viewName}View`));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindEvents() {
    $$(".tab-btn").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));

    elements.courseSearch.addEventListener("input", event => {
      searchKeyword = event.target.value;
      renderCourseList();
    });

    elements.categoryFilters.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      renderFilters();
      renderCourseList();
    });

    elements.courseList.addEventListener("click", event => {
      const button = event.target.closest('[data-action="add"]');
      if (button) addCourseToPlan(button.dataset.id);
    });

    elements.courseList.addEventListener("dragstart", event => {
      const card = event.target.closest(".course-card");
      if (!card || card.getAttribute("draggable") !== "true") return;
      card.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", card.dataset.id);
    });

    elements.courseList.addEventListener("dragend", event => {
      event.target.closest(".course-card")?.classList.remove("is-dragging");
      elements.dropZone.classList.remove("is-over");
    });

    ["dragenter", "dragover"].forEach(type => elements.dropZone.addEventListener(type, event => {
      event.preventDefault();
      elements.dropZone.classList.add("is-over");
      event.dataTransfer.dropEffect = "copy";
    }));

    ["dragleave", "drop"].forEach(type => elements.dropZone.addEventListener(type, event => {
      event.preventDefault();
      if (type === "drop") addCourseToPlan(event.dataTransfer.getData("text/plain"));
      elements.dropZone.classList.remove("is-over");
    }));

    elements.selectedList.addEventListener("click", event => {
      const button = event.target.closest('[data-action="remove"]');
      if (button) removeCourseFromPlan(button.dataset.id);
    });

    elements.couponList.addEventListener("click", event => {
      const card = event.target.closest(".coupon-card");
      if (!card) return;
      const input = $("input", card);
      state.selectedCouponId = state.selectedCouponId === input.value ? null : input.value;
      saveState();
      renderCoupons();
      renderSelectedPlan();
    });

    elements.submitSchedule.addEventListener("click", submitSchedule);
    elements.clearSelection.addEventListener("click", () => {
      state.selectedCourseIds = [];
      state.selectedCouponId = null;
      saveState();
      renderCourseList();
      renderCoupons();
      renderSelectedPlan();
      showToast("已清空目前排課。", "success");
    });

    elements.clearHistory.addEventListener("click", () => {
      if (!state.history.length) return showToast("目前沒有排課紀錄。", "error");
      if (!window.confirm("確定清除所有排課紀錄嗎？課程名額與點數不會回復。")) return;
      state.history = [];
      logActivity("清除用戶端排課紀錄。 ");
      saveState();
      renderHistory();
      renderAdmin();
      showToast("排課紀錄已清除。", "success");
    });

    elements.courseForm.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const baseDate = form.get("date");
      const repeat = Math.min(12, Math.max(1, Number(form.get("repeat"))));
      const interval = Math.max(1, Number(form.get("interval")));
      const newCourses = [];

      for (let index = 0; index < repeat; index += 1) {
        newCourses.push({
          id: uid("course"),
          title: String(form.get("title")).trim() + (repeat > 1 ? ` ${index + 1}` : ""),
          date: addDays(baseDate, index * interval),
          time: form.get("time"),
          teacher: String(form.get("teacher")).trim(),
          category: form.get("category"),
          cost: Math.max(0, Number(form.get("cost"))),
          seats: Math.max(1, Number(form.get("seats"))),
          note: String(form.get("note") || "").trim()
        });
      }

      state.courses.push(...newCourses);
      logActivity(`開課端發佈「${form.get("title")}」共 ${repeat} 堂。`);
      saveState();
      event.currentTarget.reset();
      $("[name='time']", event.currentTarget).value = "19:00";
      $("[name='cost']", event.currentTarget).value = "300";
      $("[name='seats']", event.currentTarget).value = "12";
      $("[name='repeat']", event.currentTarget).value = "1";
      $("[name='interval']", event.currentTarget).value = "7";
      renderAll();
      showToast(`已發佈 ${repeat} 堂課程。`, "success");
    });

    elements.pointForm.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const amount = Math.max(1, Number(form.get("amount")));
      const reason = String(form.get("reason") || "活動發放").trim();
      state.points += amount;
      logActivity(`發放 ${amount} 星火點數（${reason || "未填原因"}）。`);
      saveState();
      renderAll();
      showToast(`已發放 ${amount.toLocaleString("zh-TW")} 點。`, "success");
    });

    elements.couponForm.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const type = form.get("type");
      let value = Math.max(1, Number(form.get("value")));
      if (type === "percent") value = Math.min(100, value);
      const coupon = {
        id: uid("coupon"),
        name: String(form.get("name")).trim(),
        type,
        value,
        uses: Math.max(1, Number(form.get("uses"))),
        createdAt: Date.now()
      };
      state.coupons.push(coupon);
      logActivity(`發放優惠券「${coupon.name}」${coupon.uses} 次。`);
      saveState();
      renderAll();
      showToast(`優惠券「${coupon.name}」已發放。`, "success");
    });

    elements.adminCourseList.addEventListener("click", event => {
      const button = event.target.closest('[data-action="delete-course"]');
      if (!button) return;
      const course = state.courses.find(item => item.id === button.dataset.id);
      if (!course) return;
      if (!window.confirm(`確定刪除「${course.title}」嗎？`)) return;
      state.courses = state.courses.filter(item => item.id !== course.id);
      state.selectedCourseIds = state.selectedCourseIds.filter(id => id !== course.id);
      logActivity(`刪除課程「${course.title}」。`);
      saveState();
      renderAll();
      showToast("課程已刪除。", "success");
    });

    elements.sortCourses.addEventListener("click", () => {
      state.courses.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      saveState();
      renderAll();
      showToast("課程已依日期排序。", "success");
    });

    elements.resetDemo.addEventListener("click", () => {
      if (!window.confirm("確定要重置所有課程、點數、優惠券與排課紀錄嗎？")) return;
      state = defaultState();
      saveState();
      renderAll();
      showToast("已重置為示範資料。", "success");
    });

    elements.closeDialog.addEventListener("click", closeReceipt);
    elements.finishReceipt.addEventListener("click", closeReceipt);
    elements.copyReceipt.addEventListener("click", copyReceipt);
    elements.dialog.addEventListener("click", event => {
      if (event.target === elements.dialog) closeReceipt();
    });

    window.addEventListener("storage", event => {
      if (event.key !== STORAGE_KEY) return;
      state = loadState();
      renderAll();
      showToast("資料已從另一個分頁同步。", "success");
    });
  }

  function init() {
    const dateInput = $("[name='date']", elements.courseForm);
    if (dateInput) dateInput.value = addDays(localDateString(), 7);
    bindEvents();
    renderAll();
  }

  init();
})();