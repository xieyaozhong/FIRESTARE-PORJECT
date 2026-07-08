(() => {
  "use strict";

  const STORAGE_KEY = "firestar-pixel-scheduler-v1";
  const DEFAULT_DURATION_HOURS = 1.5;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let queued = false;

  function loadState() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && typeof value === "object" ? value : {};
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

  function durationOf(course) {
    const duration = Number(course?.durationHours);
    return Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION_HOURS;
  }

  function courseKey(course) {
    return `${course?.date || ""}T${course?.time || "00:00"}`;
  }

  function timeRange(course) {
    const start = String(course?.time || "");
    const match = start.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return start || "時間未定";

    const startMinutes = Number(match[1]) * 60 + Number(match[2]);
    const totalMinutes = startMinutes + Math.round(durationOf(course) * 60);
    const endMinutes = totalMinutes % 1440;
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    return `${start}－${totalMinutes >= 1440 ? "翌日 " : ""}${end}`;
  }

  function replaceTime(element, course) {
    if (!element || !course?.time) return;
    const current = element.textContent || "";
    const range = timeRange(course);
    if (current.includes(range) || !current.includes(course.time)) return;
    element.textContent = current.replace(course.time, range);
  }

  function migrateDurations() {
    const state = loadState();
    let changed = false;
    const normalize = course => {
      if (!course || typeof course !== "object") return;
      if (!Number.isFinite(Number(course.durationHours)) || Number(course.durationHours) <= 0) {
        course.durationHours = DEFAULT_DURATION_HOURS;
        changed = true;
      }
    };

    (state.courses || []).forEach(normalize);
    (state.history || []).forEach(item => {
      (item.courses || []).forEach(normalize);
      (item.reschedules || []).forEach(change => {
        normalize(change?.from);
        normalize(change?.to);
      });
    });

    if (changed) {
      saveState(state);
      window.setTimeout(() => {
        const toast = $("#toast");
        if (toast) toast.className = "toast";
      }, 0);
    }
  }

  function injectDurationField() {
    const form = $("#courseForm");
    const timeLabel = form?.querySelector('[name="time"]')?.closest("label");
    if (!form || !timeLabel || form.querySelector('[name="durationHours"]')) return;

    const label = document.createElement("label");
    label.innerHTML = `課堂時數
      <input name="durationHours" type="number" min="0.5" max="12" step="0.5" value="${DEFAULT_DURATION_HOURS}" required>`;
    timeLabel.after(label);

    form.addEventListener("submit", () => {
      const beforeIds = new Set((loadState().courses || []).map(course => course.id));
      const rawDuration = Number(form.querySelector('[name="durationHours"]')?.value);
      const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : DEFAULT_DURATION_HOURS;

      window.setTimeout(() => {
        const state = loadState();
        let changed = false;
        (state.courses || []).forEach(course => {
          if (!beforeIds.has(course.id)) {
            course.durationHours = duration;
            changed = true;
          }
        });
        const input = form.querySelector('[name="durationHours"]');
        if (input) input.value = String(DEFAULT_DURATION_HOURS);
        if (changed) saveState(state);
        scheduleDecorate();
      }, 0);
    }, true);
  }

  function decorate() {
    const state = loadState();
    const courses = Array.isArray(state.courses) ? state.courses : [];
    const byId = new Map(courses.map(course => [course.id, course]));

    $$(".course-card[data-id]").forEach(card => {
      const time = $$(".course-meta span", card).find(span => span.textContent.includes("🕒"));
      replaceTime(time, byId.get(card.dataset.id));
    });

    const selected = (state.selectedCourseIds || [])
      .map(id => byId.get(id))
      .filter(Boolean)
      .sort((a, b) => courseKey(a).localeCompare(courseKey(b)));
    $$(".selected-course p").forEach((element, index) => replaceTime(element, selected[index]));

    $$(".history-card").forEach(card => {
      const number = $(".history-head strong", card)?.textContent?.trim();
      const item = (state.history || []).find(history => history.number === number);
      $$(".history-courses > div b", card).forEach((element, index) => {
        const course = item?.courses?.[index];
        if (course) {
          const range = timeRange(course);
          if (element.textContent !== range) element.textContent = range;
        }
      });
    });

    const sorted = [...courses].sort((a, b) => courseKey(a).localeCompare(courseKey(b)));
    $$(".admin-course-row").forEach((row, index) => replaceTime($("div:first-child strong", row), sorted[index]));

    const receiptNumber = $("#receiptNumber")?.textContent?.replace(/^NO\.\s*/, "").trim();
    const receipt = (state.history || []).find(item => item.number === receiptNumber);
    $$("#receiptCourses .receipt-course p").forEach((element, index) => replaceTime(element, receipt?.courses?.[index]));

    const booked = (state.history || []).flatMap(item => item.courses || []);
    const knownCourses = [...courses, ...booked];
    $$("#rescheduleCurrent strong, #replacementList .replacement-card strong").forEach(element => {
      const course = knownCourses.find(item => item?.title && element.textContent.includes(item.title) && element.textContent.includes(item.time));
      replaceTime(element, course);
    });

    const upcoming = booked
      .filter(course => `${course.date}T${course.time}` >= `${new Date().toISOString().slice(0, 10)}T00:00`)
      .sort((a, b) => courseKey(a).localeCompare(courseKey(b)))[0];
    const nextText = $("#nextClassText");
    if (upcoming && nextText?.textContent.includes(upcoming.time)) replaceTime(nextText, upcoming);
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
    migrateDurations();
    injectDurationField();
    scheduleDecorate();

    new MutationObserver(scheduleDecorate).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", event => {
      if (!event.key || event.key === STORAGE_KEY) scheduleDecorate();
    });

    $("#resetDemo")?.addEventListener("click", () => window.setTimeout(() => {
      migrateDurations();
      scheduleDecorate();
    }, 0));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
