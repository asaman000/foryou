const store = window.LoveContentStore;
const form = document.querySelector("#editorForm");
const status = document.querySelector("#saveStatus");
const mode = document.body.dataset.editorMode;
let saveTimer = null;

function fieldMarkup(key, label, value) {
  const longText = key === "noMessages" || key.toLowerCase().includes("message") || key.toLowerCase().includes("lead");
  const wide = longText ? " wide" : "";
  const control = longText
    ? `<textarea name="${key}">${escapeHtml(value)}</textarea>`
    : `<input name="${key}" value="${escapeHtml(value)}">`;
  return `<div class="field${wide}"><label>${label}</label>${control}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

function render() {
  const content = store.get();
  if (mode === "all") {
    form.innerHTML = store.fields.map(([key, label]) => fieldMarkup(key, label, content[key])).join("");
  } else {
    form.innerHTML = `
      <div class="field"><label>From name</label><input name="from" value="${escapeHtml(content.from)}"></div>
      <div class="field"><label>To name</label><input name="to" value="${escapeHtml(content.to)}"></div>
      <div class="field"><label>Website title</label><input name="title" value="${escapeHtml(content.title)}"></div>
      <div class="field"><label>Together since</label><input type="datetime-local" name="since" value="${escapeHtml(content.since)}"></div>
      <div class="field wide"><label>Love, in little things</label><input name="letterTape" value="${escapeHtml(content.letterTape)}"></div>
      <div class="field wide"><label>Love letter</label><textarea name="letterMessage">${escapeHtml(content.letterMessage)}</textarea></div>
      <h2 class="section-title">Counter settings</h2>
      <div class="field"><label>Counter mode</label><select name="counterMode"><option value="date" ${content.counterMode === "date" ? "selected" : ""}>Live from date</option><option value="manual" ${content.counterMode === "manual" ? "selected" : ""}>Manual values</option></select></div>
      <div class="field"><label>Manual days</label><input type="number" min="0" name="manualDays" value="${escapeHtml(content.manualDays)}"></div>
      <div class="field"><label>Manual hours</label><input type="number" min="0" name="manualHours" value="${escapeHtml(content.manualHours)}"></div>
      <div class="field"><label>Manual minutes</label><input type="number" min="0" name="manualMins" value="${escapeHtml(content.manualMins)}"></div>
      <div class="field"><label>Manual seconds</label><input type="number" min="0" name="manualSecs" value="${escapeHtml(content.manualSecs)}"></div>`;
  }
  form.querySelectorAll("[name]").forEach((control) => {
    control.id = `field-${control.name}`;
    const label = control.previousElementSibling;
    if (label?.tagName === "LABEL") label.htmlFor = control.id;
  });
}

function collect() {
  return Object.fromEntries(new FormData(form).entries());
}

function saveLive() {
  window.clearTimeout(saveTimer);
  status.textContent = "Updating…";
  saveTimer = window.setTimeout(() => {
    store.save(collect());
    status.textContent = "Saved live ✓";
  }, 180);
}

form.addEventListener("input", saveLive);
document.querySelector("#resetButton").addEventListener("click", () => {
  if (!confirm("Reset every editable value to its default?")) return;
  store.reset();
  render();
  status.textContent = "Defaults restored";
});
render();
