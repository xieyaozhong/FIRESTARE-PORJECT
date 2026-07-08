(() => {
"use strict";
const CORE_SRC = "./app-core-v1.js?v=spark-schedule-core-v1";
const STORAGE_KEY = "firestar-pixel-scheduler-v1";
const RESCHEDULE_SERVICE_FEE = 100;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[char]);
const fmt = value => Number(value || 0).toLocaleString("zh-TW");
function localDateString(date = new Date()) {
const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
return local.toISOString().slice(0, 10);
}
function isFuture(course) {
const now = new Date();
const hh = String(now.getHours()).padStart(2, "0");
const mm = String(now.getMinutes()).padStart(2, "0");
return `${course.date}T${course.time || "00:00"}` >= `${localDateString(now)}T${hh}:${mm}`;
}
function formatDate(dateString, withWeekday = true) {
const date = new Date(`${dateString}T12:00:00`);
const options = { month: "numeric", day: "numeric" };
if (withWeekday) options.weekday = "short";
return new Intl.DateTimeFormat("zh-TW", options).format(date);
}
function loadState() {
try {
const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
return raw && typeof raw === "object" ? raw : null;
} catch {
return null;
}
}
function saveAndRefresh(state, message) {
const value = JSON.stringify(state);
localStorage.setItem(STORAGE_KEY, value);
try {
window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: value }));
} catch {
window.dispatchEvent(new Event("storage"));
}
const toast = $("#toast");
if (toast) {
toast.textContent = message;
toast.className = "toast is-show is-success";
window.setTimeout(() => { toast.className = "toast"; }, 2600);
}
}
function injectStyles() {
const style = document.createElement("style");
style.textContent = `
.history-course-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px}
.reschedule-btn{padding:5px 8px;color:#fff;font-size:9px;font-weight:900;background:#7057d9;border:2px solid #29243e;box-shadow:2px 2px 0 #29243e}
.reschedule-btn:disabled{color:#777184;background:#d0cad9;box-shadow:none;cursor:not-allowed}
.reschedule-note{margin:7px 0;padding:5px 7px;color:#24765c;font-size:9px;font-weight:900;background:#d8ffe8;border:2px solid #29243e}
.reschedule-dialog{width:min(720px,calc(100% - 20px));max-height:calc(100vh - 24px);padding:0;border:0;background:transparent}
.reschedule-dialog::backdrop{background:rgba(12,10,25,.8);backdrop-filter:blur(3px)}
.reschedule-shell{position:relative;max-height:calc(100vh - 28px);overflow:auto;padding:20px;background:#fff9e9;border:5px solid #29243e;box-shadow:10px 10px 0 #070611}
.reschedule-close{position:absolute;right:10px;top:10px;width:38px;height:38px;color:#fff;font-size:22px;font-weight:900;background:#d85663;border:3px solid #29243e}
.reschedule-head{padding-right:46px;margin-bottom:14px}.reschedule-head p{margin:5px 0 0;color:#625a7c;font-size:11px}
.reschedule-current{display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px;margin-bottom:12px;background:#ded5ff;border:3px solid #29243e}
.reschedule-current small,.reschedule-current strong{display:block}.reschedule-current small{color:#625a7c;font-size:9px}.reschedule-current b{align-self:center;color:#392b75}
.replacement-list{display:grid;gap:9px;max-height:330px;overflow:auto;padding:2px 5px 6px 1px}
.replacement-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:10px;background:#fff;border:3px solid #29243e;box-shadow:3px 3px 0 #aea6bd;cursor:pointer}
.replacement-card.is-active{background:#d8ffe8;box-shadow:3px 3px 0 #24765c}.replacement-card input{accent-color:#7057d9}
.replacement-card strong,.replacement-card small{display:block}.replacement-card small{margin-top:3px;color:#625a7c;font-size:9px}.replacement-cost{text-align:right;font-size:10px}.replacement-cost b{display:block;color:#392b75}
.reschedule-coupon{display:flex;align-items:center;gap:9px;margin-top:12px;padding:10px;background:#fff2bd;border:3px solid #29243e;cursor:pointer}.reschedule-coupon input{accent-color:#7057d9}
.reschedule-summary{display:grid;gap:6px;margin-top:12px;padding:12px;background:#fff;border:3px solid #29243e}.reschedule-summary div{display:flex;justify-content:space-between;gap:12px;font-size:11px}.reschedule-summary .subtotal-row{padding-top:6px;border-top:2px dashed #29243e}.reschedule-summary .pay-row{padding-top:7px;border-top:3px solid #29243e;font-size:14px;font-weight:900}
.reschedule-warning{margin:8px 0 0;color:#d85663;font-size:10px;font-weight:900}.reschedule-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.reschedule-empty{padding:28px 14px;text-align:center;color:#625a7c;border:3px dashed #aaa1bc}
@media(max-width:560px){.history-course-row{grid-template-columns:1fr auto!important}.history-course-row b{display:none}.reschedule-btn{grid-column:1/-1}.replacement-card{grid-template-columns:auto 1fr}.replacement-cost{grid-column:2;text-align:left}.reschedule-actions{grid-template-columns:1fr}}
`;
document.head.appendChild(style);
}
function injectDialog() {
const dialog = document.createElement("dialog");
dialog.id = "rescheduleDialog";
dialog.className = "reschedule-dialog";
dialog.innerHTML = `
<div class="reschedule-shell">
<button class="reschedule-close" type="button" aria-label="關閉">×</button>
<div class="reschedule-head">
<p class="eyebrow">CHANGE COURSE</p>
<h2>我要調課</h2>
<p>每次調課收取 ${fmt(RESCHEDULE_SERVICE_FEE)} 點手續費，另加新舊課程正差額。只能置換同類型、仍有名額且尚未開始的課程。</p>
</div>
<div id="rescheduleCurrent" class="reschedule-current"></div>
<div id="replacementList" class="replacement-list"></div>
<div id="rescheduleCouponArea"></div>
<div id="rescheduleSummary" class="reschedule-summary"></div>
<p id="rescheduleWarning" class="reschedule-warning"></p>
<div class="reschedule-actions">
<button class="ghost-btn" id="cancelReschedule" type="button">取消</button>
<button class="primary-btn" id="confirmReschedule" type="button" disabled>確認調課</button>
</div>
</div>`;
document.body.appendChild(dialog);
return dialog;
}
function startAddon() {
injectStyles();
const dialog = injectDialog();
let context = null;
function closeDialog() {
context = null;
if (typeof dialog.close === "function" && dialog.open) dialog.close();
else dialog.removeAttribute("open");
}
function findChangeCoupon(state) {
return state.coupons?.find(coupon => coupon.uses > 0 && String(coupon.name).includes("調課")) || null;
}
function calculateFee(state, newCourse) {
const difference = Math.max(0, Number(newCourse.cost) - Number(context.oldCourse.cost));
const serviceFee = RESCHEDULE_SERVICE_FEE;
const subtotal = serviceFee + difference;
const coupon = findChangeCoupon(state);
const useCoupon = Boolean(coupon && subtotal > 0 && $("#useRescheduleCoupon")?.checked);
let discount = 0;
if (useCoupon) {
discount = coupon.type === "percent"
? Math.round(subtotal * Math.min(100, Number(coupon.value)) / 100)
: Math.min(subtotal, Number(coupon.value));
}
return { serviceFee, difference, subtotal, discount, final: Math.max(0, subtotal - discount), coupon: useCoupon ? coupon : null };
}
function renderSummary() {
const state = loadState();
const selectedId = $("input[name='replacementCourse']:checked", dialog)?.value;
const newCourse = context?.replacements.find(course => course.id === selectedId);
$$(".replacement-card", dialog).forEach(card => card.classList.toggle("is-active", Boolean($("input", card)?.checked)));
if (!state || !newCourse) return;
const fee = calculateFee(state, newCourse);
$("#rescheduleSummary", dialog).innerHTML = `
<div><span>調課手續費</span><strong>${fmt(fee.serviceFee)} 點</strong></div>
<div><span>新舊課程差額</span><strong>${fmt(fee.difference)} 點</strong></div>
<div class="subtotal-row"><span>調課小計</span><strong>${fmt(fee.subtotal)} 點</strong></div>
<div><span>調課卷折抵</span><strong>−${fmt(fee.discount)} 點</strong></div>
<div class="pay-row"><span>本次扣除</span><strong>${fmt(fee.final)} 點</strong></div>
<div><span>調課後餘額</span><strong>${fmt(Math.max(0, state.points - fee.final))} 點</strong></div>`;
const insufficient = fee.final > state.points;
$("#rescheduleWarning", dialog).textContent = insufficient
? `點數不足，還差 ${fmt(fee.final - state.points)} 點。`
: `本次包含 ${fmt(fee.serviceFee)} 點調課手續費；原課程名額會自動歸還，較便宜的課程不退回差額。`;
$("#confirmReschedule", dialog).disabled = insufficient;
}
function openDialog(historyId, courseIndex) {
const state = loadState();
const history = state?.history?.find(item => item.id === historyId);
const oldCourse = history?.courses?.[courseIndex];
if (!state || !history || !oldCourse || !isFuture(oldCourse)) return;
const bookedIds = new Set(history.courses.map(course => course.id).filter(Boolean));
const replacements = state.courses
.filter(course => course.category === oldCourse.category)
.filter(course => course.id !== oldCourse.id && !bookedIds.has(course.id))
.filter(course => course.seats > 0 && isFuture(course))
.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
context = { historyId, courseIndex, oldCourse, replacements };
$("#rescheduleCurrent", dialog).innerHTML = `
<div><small>目前課程・${esc(oldCourse.category)}</small><strong>${formatDate(oldCourse.date)} ${esc(oldCourse.time)}｜${esc(oldCourse.title)}</strong></div>
<b>${fmt(oldCourse.cost)} 點</b>`;
$("#replacementList", dialog).innerHTML = replacements.length ? replacements.map(course => {
const difference = Math.max(0, Number(course.cost) - Number(oldCourse.cost));
const payableBeforeCoupon = RESCHEDULE_SERVICE_FEE + difference;
return `<label class="replacement-card">
<input type="radio" name="replacementCourse" value="${esc(course.id)}">
<span><strong>${formatDate(course.date)} ${esc(course.time)}｜${esc(course.title)}</strong><small>${esc(course.teacher)}・剩 ${Number(course.seats)} 名・${esc(course.category)}</small></span>
<span class="replacement-cost"><b>${fmt(course.cost)} 點</b><small>調課共 ${fmt(payableBeforeCoupon)} 點${difference ? `（含補差額 ${fmt(difference)}）` : ""}</small></span>
</label>`;
}).join("") : '<div class="reschedule-empty">目前沒有可置換的同類型課程。請等待開課端新增課程。</div>';
const coupon = findChangeCoupon(state);
$("#rescheduleCouponArea", dialog).innerHTML = coupon ? `
<label class="reschedule-coupon">
<input id="useRescheduleCoupon" type="checkbox" checked>
<span><strong>使用「${esc(coupon.name)}」</strong><small>剩 ${Number(coupon.uses)} 次・折抵調課手續費與課程差額・${coupon.type === "percent" ? `${Number(coupon.value)}% 折抵` : `折抵 ${fmt(coupon.value)} 點`}</small></span>
</label>` : "";
$("#rescheduleSummary", dialog).innerHTML = `<div><span>固定調課手續費</span><strong>${fmt(RESCHEDULE_SERVICE_FEE)} 點</strong></div><div><span>請先選擇新課程</span><strong>—</strong></div>`;
$("#rescheduleWarning", dialog).textContent = "";
$("#confirmReschedule", dialog).disabled = true;
if (typeof dialog.showModal === "function") dialog.showModal();
else dialog.setAttribute("open", "");
}
function confirmChange() {
const state = loadState();
const newCourseId = $("input[name='replacementCourse']:checked", dialog)?.value;
const newCourse = state?.courses?.find(course => course.id === newCourseId);
const history = state?.history?.find(item => item.id === context?.historyId);
const oldCourse = history?.courses?.[context?.courseIndex];
if (!state || !newCourse || !history || !oldCourse) return;
if (newCourse.category !== oldCourse.category || newCourse.seats <= 0 || !isFuture(newCourse)) return;
const fee = calculateFee(state, newCourse);
if (fee.final > state.points) return;
const originalLiveCourse = state.courses.find(course => course.id === oldCourse.id);
if (originalLiveCourse) originalLiveCourse.seats = Number(originalLiveCourse.seats || 0) + 1;
newCourse.seats = Math.max(0, Number(newCourse.seats) - 1);
state.points -= fee.final;
if (fee.coupon) fee.coupon.uses = Math.max(0, Number(fee.coupon.uses) - 1);
history.courses[context.courseIndex] = { ...newCourse };
history.reschedules = Array.isArray(history.reschedules) ? history.reschedules : [];
history.reschedules.push({
id: `change-${Date.now()}`, changedAt: Date.now(), from: { ...oldCourse }, to: { ...newCourse },
serviceFee: fee.serviceFee, difference: fee.difference, subtotal: fee.subtotal,
discount: fee.discount, paid: fee.final, couponName: fee.coupon?.name || null
});
history.total = Number(history.total || 0) + fee.final;
history.gross = history.courses.reduce((sum, course) => sum + Number(course.cost || 0), 0);
history.balance = state.points;
history.updatedAt = Date.now();
state.activities = Array.isArray(state.activities) ? state.activities : [];
state.activities.unshift({ id: `log-${Date.now()}`, time: Date.now(), text: `調課完成：${oldCourse.title} → ${newCourse.title}，手續費 ${fee.serviceFee} 點、課程差額 ${fee.difference} 點，實扣 ${fee.final} 點。` });
state.activities = state.activities.slice(0, 40);
closeDialog();
saveAndRefresh(state, `已改為「${newCourse.title}」，本次調課扣除 ${fmt(fee.final)} 點。`);
}
function decorateHistory() {
const state = loadState();
const historyList = $("#historyList");
if (!state || !historyList) return;
$$(".history-card", historyList).forEach(card => {
const number = $(".history-head strong", card)?.textContent?.trim();
const history = state.history.find(item => item.number === number);
if (!history) return;
const rows = $$(".history-courses > div", card);
rows.forEach((row, index) => {
row.classList.add("history-course-row");
if ($(".reschedule-btn", row)) return;
const course = history.courses[index];
if (!course) return;
const button = document.createElement("button");
button.type = "button";
button.className = "reschedule-btn";
button.textContent = isFuture(course) ? `我要調課（${fmt(RESCHEDULE_SERVICE_FEE)}點起）` : "已結束";
button.disabled = !isFuture(course);
button.addEventListener("click", () => openDialog(history.id, index));
row.appendChild(button);
});
if (history.reschedules?.length && !$(".reschedule-note", card)) {
const note = document.createElement("div");
note.className = "reschedule-note";
note.textContent = `已調課 ${history.reschedules.length} 次`;
$(".history-total", card)?.before(note);
}
});
}
$(".reschedule-close", dialog).addEventListener("click", closeDialog);
$("#cancelReschedule", dialog).addEventListener("click", closeDialog);
$("#replacementList", dialog).addEventListener("change", renderSummary);
$("#rescheduleCouponArea", dialog).addEventListener("change", renderSummary);
$("#confirmReschedule", dialog).addEventListener("click", confirmChange);
dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
const historyList = $("#historyList");
if (historyList) {
new MutationObserver(decorateHistory).observe(historyList, { childList: true, subtree: true });
decorateHistory();
}
}
const core = document.createElement("script");
core.src = CORE_SRC;
core.defer = true;
core.onload = () => window.setTimeout(startAddon, 0);
core.onerror = () => {
const message = document.createElement("div");
message.style.cssText = "margin:20px;padding:20px;color:#fff;background:#d85663;border:4px solid #29243e;font-family:monospace";
message.textContent = "排課核心載入失敗，請重新整理頁面。";
document.body.appendChild(message);
};
document.head.appendChild(core);
})();
