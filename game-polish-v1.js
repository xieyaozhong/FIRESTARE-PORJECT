(() => {
  "use strict";

  const playfield = document.querySelector("#playfield");
  const bonfireButton = document.querySelector("#bonfireButton");
  const ritualStatus = document.querySelector(".ritual-status");
  const ritualStage = document.querySelector("#ritualStage");
  const progressText = document.querySelector("#progressText");
  const holdHint = document.querySelector("#holdHint");
  const holdMeter = document.querySelector(".hold-meter");

  if (!playfield || !bonfireButton || !ritualStatus || !progressText) return;

  const STAGES = [
    { className: "ritual-stage-1", number: 1, label: "凝聚" },
    { className: "ritual-stage-2", number: 2, label: "喚醒" },
    { className: "ritual-stage-3", number: 3, label: "共鳴" },
    { className: "ritual-stage-4", number: 4, label: "降臨" }
  ];

  const stageBadge = document.createElement("span");
  stageBadge.className = "ritual-count";
  stageBadge.setAttribute("aria-hidden", "true");
  stageBadge.textContent = "待機";
  ritualStatus.appendChild(stageBadge);

  if (holdMeter) {
    holdMeter.removeAttribute("aria-hidden");
    holdMeter.setAttribute("role", "progressbar");
    holdMeter.setAttribute("aria-label", "星火點亮進度");
    holdMeter.setAttribute("aria-valuemin", "0");
    holdMeter.setAttribute("aria-valuemax", "100");
    holdMeter.setAttribute("aria-valuenow", "0");
  }

  bonfireButton.setAttribute("aria-describedby", "holdHint ritualStage");
  bonfireButton.setAttribute("aria-keyshortcuts", "Space Enter");

  let previousStage = "";
  let previousProgress = -1;

  function currentStage() {
    if (playfield.classList.contains("is-complete")) {
      return { number: 4, label: "完成", completed: true };
    }

    return STAGES.find(stage => playfield.classList.contains(stage.className)) || null;
  }

  function syncStage() {
    const stage = currentStage();
    const signature = stage ? `${stage.number}-${stage.label}-${Boolean(stage.completed)}` : "idle";
    if (signature === previousStage) return;
    previousStage = signature;

    if (!stage) {
      stageBadge.textContent = "待機";
      stageBadge.classList.remove("is-active");
      return;
    }

    stageBadge.textContent = stage.completed ? "儀式完成" : `${stage.number}/4 ${stage.label}`;
    stageBadge.classList.add("is-active");
  }

  function syncProgress() {
    const value = Math.max(0, Math.min(100, Number.parseInt(progressText.textContent || "0", 10) || 0));
    if (value === previousProgress) return;
    previousProgress = value;

    holdMeter?.setAttribute("aria-valuenow", String(value));
    holdMeter?.setAttribute("aria-valuetext", `${value}%`);
    bonfireButton.setAttribute("aria-label", value > 0 && value < 100
      ? `正在點亮星火，進度 ${value}%`
      : value >= 100
        ? "星火已點亮"
        : "長按火堆五秒點亮星火");
  }

  const observer = new MutationObserver(() => {
    syncStage();
    syncProgress();
  });

  observer.observe(playfield, {
    attributes: true,
    attributeFilter: ["class", "style"]
  });
  observer.observe(progressText, {
    childList: true,
    characterData: true,
    subtree: true
  });

  document.addEventListener("visibilitychange", () => {
    const hidden = document.hidden;
    document.body.classList.toggle("is-page-hidden", hidden);

    if (hidden && playfield.classList.contains("is-holding")) {
      bonfireButton.dispatchEvent(new Event("pointercancel", { bubbles: true }));
      bonfireButton.blur();
    }
  });

  window.addEventListener("pagehide", () => {
    document.body.classList.add("is-page-hidden");
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-page-hidden");
    syncStage();
    syncProgress();
  });

  playfield.addEventListener("pointerdown", event => {
    if (!event.target.closest("#bonfireButton")) return;
    playfield.dataset.pointer = event.pointerType || "unknown";
  }, { passive: true });

  syncStage();
  syncProgress();
})();
