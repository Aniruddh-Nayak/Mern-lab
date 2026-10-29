const form = document.getElementById("item-form");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const body = document.getElementById("items-body");
const toast = document.getElementById("toast");
const submitBtnText = document.getElementById("submit-btn-text");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const searchInput = document.getElementById("search-input");

const statTotalItems = document.getElementById("stat-total-items");
const statTotalVal = document.getElementById("stat-total-val");
const statAvgPrice = document.getElementById("stat-avg-price");

const themeToggle = document.getElementById("theme-toggle");
const iconMoon = themeToggle.querySelector(".icon-moon");
const iconSun = themeToggle.querySelector(".icon-sun");

let allItems = [];
let editingId = null;
let toastTimeout = null;

// Theme Toggle
function initTheme() {
  const saved = localStorage.getItem("inventory_theme") || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    iconMoon.classList.add("hidden");
    iconSun.classList.remove("hidden");
  } else {
    document.documentElement.removeAttribute("data-theme");
    iconMoon.classList.remove("hidden");
    iconSun.classList.add("hidden");
  }
  localStorage.setItem("inventory_theme", theme);
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(isDark ? "light" : "dark");
});

function showToast(message, type = "success") {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function updateStats(items) {
  const count = items.length;
  statTotalItems.textContent = count;

  const total = items.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  statTotalVal.textContent = `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const avg = count > 0 ? total / count : 0;
  statAvgPrice.textContent = `₹${avg.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderTable(itemsToRender) {
  body.replaceChildren();

  if (itemsToRender.length === 0) {
    const row = body.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = searchInput.value.trim() ? "No matching items found." : "No items in inventory. Add one above!";
    return;
  }

  itemsToRender.forEach(item => {
    const row = body.insertRow();

    // ID
    const idCell = row.insertCell();
    const badge = document.createElement("span");
    badge.className = "item-id-badge";
    badge.textContent = `#${item.id}`;
    idCell.appendChild(badge);

    // Name
    const nameCell = row.insertCell();
    nameCell.textContent = item.name;

    // Price
    const priceCell = row.insertCell();
    const priceSpan = document.createElement("span");
    priceSpan.className = "item-price";
    priceSpan.textContent = `₹${Number(item.price).toFixed(2)}`;
    priceCell.appendChild(priceSpan);

    // Actions
    const actionCell = row.insertCell();
    const actionWrap = document.createElement("div");
    actionWrap.className = "table-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "action-btn action-btn--edit";
    editBtn.type = "button";
    editBtn.addEventListener("click", () => startEdit(item));

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "action-btn action-btn--delete";
    delBtn.type = "button";
    delBtn.addEventListener("click", () => deleteItem(item.id));

    actionWrap.append(editBtn, delBtn);
    actionCell.appendChild(actionWrap);
  });
}

async function loadItems() {
  try {
    allItems = await request("/api/items");
    updateStats(allItems);
    applyFilter();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function applyFilter() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = query
    ? allItems.filter(item => item.name.toLowerCase().includes(query) || String(item.id).includes(query))
    : allItems;
  renderTable(filtered);
}

searchInput.addEventListener("input", applyFilter);

function startEdit(item) {
  editingId = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  formTitle.textContent = `Edit Item #${item.id}`;
  submitBtnText.textContent = "Update Item";
  cancelBtn.classList.remove("hidden");
  nameInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add Item";
  submitBtnText.textContent = "Add Item";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async event => {
  event.preventDefault();
  const item = { name: nameInput.value.trim(), price: priceInput.value };
  try {
    if (editingId === null) {
      await request("/api/items", { method: "POST", body: JSON.stringify(item) });
      showToast("Item added successfully.", "success");
    } else {
      await request(`/api/items/${editingId}`, { method: "PUT", body: JSON.stringify(item) });
      showToast("Item updated successfully.", "success");
    }
    resetForm();
    await loadItems();
  } catch (error) {
    showToast(error.message, "error");
  }
});

async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  try {
    await request(`/api/items/${id}`, { method: "DELETE" });
    showToast("Item deleted successfully.", "success");
    if (editingId === id) resetForm();
    await loadItems();
  } catch (error) {
    showToast(error.message, "error");
  }
}

initTheme();
loadItems();
