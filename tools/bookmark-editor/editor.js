let data;
let original;
let dirty = false;
const $ = (id) => document.getElementById(id);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function slug(value) {
  return String(value || "").normalize("NFKD").toLowerCase()
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function suggestedId(name, url) {
  let base = slug(name);
  if (!base) {
    try { base = slug(new URL(url).hostname.replace(/^www\./, "")); } catch (error) {}
  }
  base ||= "site";
  let id = base;
  let n = 2;
  while (data.sites.some((site, index) => site.id === id && index !== Number($("edit-index").value))) id = `${base}-${n++}`;
  return id;
}
function markDirty() { dirty = true; renderSummary(); }
function groupNames() { return data.groups.map((group) => group.name); }
function categoryNames(group) {
  return [...new Set(data.sites.filter((site) => site.group === group && site.category).map((site) => site.category))];
}
function refreshChoices() {
  const options = groupNames().map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  $("group").innerHTML = options;
  $("group-filter").innerHTML = `<option value="">全部分组</option>${options}`;
}
function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function renderSummary() {
  $("summary").textContent = `${data.groups.length} 个分组 · ${data.sites.length} 个网站${dirty ? " · 有未保存修改" : ""}`;
}
function render() {
  const query = $("search").value.trim().toLowerCase();
  const group = $("group-filter").value;
  const matches = data.sites.map((site, index) => ({ site, index })).filter(({ site }) => {
    return (!group || site.group === group) &&
      (!query || [site.name, site.url, site.description, site.category].filter(Boolean).join(" ").toLowerCase().includes(query));
  });
  $("list").innerHTML = matches.length ? matches.map(({ site, index }) => `
    <article class="card">
      <div><h3>${escapeHtml(site.name)}</h3>
        <div class="meta">${escapeHtml(site.group)}${site.category ? " · " + escapeHtml(site.category) : ""} · ${escapeHtml(site.id)}</div>
        <div class="meta">${escapeHtml(site.url)}</div>
      </div>
      <div class="card-actions">
        <button data-action="up" data-index="${index}" aria-label="上移">↑</button>
        <button data-action="down" data-index="${index}" aria-label="下移">↓</button>
        <button data-action="edit" data-index="${index}">编辑</button>
        <button data-action="delete" data-index="${index}" class="danger">删除</button>
      </div>
    </article>`).join("") : `<div class="empty">没有匹配的网站</div>`;
  renderSummary();
}
function fillCategories() {
  $("categories").innerHTML = categoryNames($("group").value).map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
}
function openEditor(index) {
  const site = Number.isInteger(index) ? data.sites[index] : null;
  $("form").reset();
  $("edit-index").value = site ? String(index) : "";
  $("form-title").textContent = site ? "编辑网站" : "新增网站";
  $("name").value = site?.name || "";
  $("url").value = site?.url || "";
  $("group").value = site?.group || data.groups[0]?.name || "";
  $("category").value = site?.category || "";
  $("description").value = site?.description || "";
  $("site-id").value = site?.id || "";
  $("featured").checked = site?.featured === true;
  $("status-check").checked = site?.statusCheck !== false;
  $("hidden").checked = site?.hidden === true;
  const customIcon = site?.icon && site.icon !== "auto";
  $("icon-mode").value = customIcon ? "custom" : "auto";
  $("icon").value = customIcon ? site.icon : "";
  $("icon-row").hidden = !customIcon;
  $("form-error").textContent = "";
  fillCategories();
  $("editor").showModal();
}
function readForm() {
  const url = $("url").value.trim();
  let parsed;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch (error) { throw new Error("网址必须是 http(s) 绝对地址"); }
  const group = $("group").value;
  const hiddenGroup = data.groups.find((entry) => entry.name === group)?.hidden === true;
  return {
    id: $("site-id").value.trim() || suggestedId($("name").value, url),
    name: $("name").value.trim(),
    url,
    group,
    ...($("category").value.trim() && { category: $("category").value.trim() }),
    ...($("description").value.trim() && { description: $("description").value.trim() }),
    icon: $("icon-mode").value === "custom" ? $("icon").value.trim() : "auto",
    ...($("featured").checked && { featured: true }),
    ...(!$("status-check").checked && { statusCheck: false }),
    ...(($("hidden").checked || hiddenGroup) && { hidden: true })
  };
}
function computeDiff() {
  const oldById = new Map(original.sites.map((site) => [site.id, site]));
  const newById = new Map(data.sites.map((site) => [site.id, site]));
  let added = 0, changed = 0, removed = 0;
  newById.forEach((site, id) => {
    if (!oldById.has(id)) added++;
    else if (JSON.stringify(oldById.get(id)) !== JSON.stringify(site)) changed++;
  });
  oldById.forEach((site, id) => { if (!newById.has(id)) removed++; });
  return { added, changed, removed };
}
async function request(path, payload) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) throw new Error((result.errors || [result.error || "请求失败"]).join("\n"));
  return result;
}

$("form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const site = readForm();
    if (!site.name) throw new Error("网站名称不能为空");
    const index = Number($("edit-index").value);
    const editing = $("edit-index").value !== "";
    if (data.sites.some((entry, i) => i !== index && entry.id === site.id)) throw new Error("稳定 ID 已存在");
    if (data.sites.some((entry, i) => i !== index && entry.group === site.group && entry.url === site.url)) throw new Error("同一分组中已存在该网址");
    if (editing) data.sites[index] = site; else data.sites.push(site);
    markDirty(); render(); $("editor").close();
  } catch (error) { $("form-error").textContent = error.message; }
});
$("list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.action === "edit") return openEditor(index);
  if (button.dataset.action === "delete") {
    if (confirm(`确定删除“${data.sites[index].name}”吗？此操作保存后生效。`)) { data.sites.splice(index, 1); markDirty(); render(); }
    return;
  }
  const target = button.dataset.action === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= data.sites.length) return;
  [data.sites[index], data.sites[target]] = [data.sites[target], data.sites[index]];
  markDirty(); render();
});
$("add").onclick = () => openEditor();
$("cancel").onclick = () => $("editor").close();
$("icon-mode").onchange = () => $("icon-row").hidden = $("icon-mode").value !== "custom";
$("group").onchange = fillCategories;
$("search").oninput = render;
$("group-filter").onchange = render;
$("save").onclick = async () => {
  $("save-error").textContent = "";
  try {
    await request("/api/validate", data);
    const diff = computeDiff();
    $("diff").textContent = `新增：${diff.added}\n修改：${diff.changed}\n删除：${diff.removed}\n总计：${data.sites.length} 个网站`;
    $("preview").showModal();
  } catch (error) { alert(error.message); }
};
$("preview-cancel").onclick = () => $("preview").close();
$("confirm-save").onclick = async () => {
  try {
    const result = await request("/api/save", data);
    original = clone(data); dirty = false; render(); $("preview").close();
    alert(`保存成功：${result.groups} 个分组，${result.sites} 个网站`);
  } catch (error) { $("save-error").textContent = error.message; }
};
window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });

fetch("/api/sites").then((response) => response.json()).then((value) => {
  data = value; original = clone(value); refreshChoices(); render();
}).catch((error) => { document.body.textContent = `加载失败：${error.message}`; });
