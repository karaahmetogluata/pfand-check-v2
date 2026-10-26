// ---------- Demo data ----------
// One source of truth: every screen reads the status from here,
// so the same store can never show two different statuses.
const MINUTE = 60 * 1000;

const defaultStores = [
  { id: "rewe", name: "REWE", distance: "270 m", status: "working", queue: null, updatedAt: Date.now() - 5 * MINUTE },
  { id: "kaufland", name: "Kaufland", distance: "1 km", status: "queue", queue: "4–8", updatedAt: Date.now() - 12 * MINUTE },
  { id: "edeka", name: "EDEKA", distance: "1.8 km", status: "broken", queue: null, updatedAt: Date.now() - 40 * MINUTE },
];

// Load saved reports (if any) so they survive a page reload.
function loadStores() {
  try {
    const saved = localStorage.getItem("pfand-stores");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Storage not available: just use the demo data.
  }
  return defaultStores;
}

function saveStores() {
  try {
    localStorage.setItem("pfand-stores", JSON.stringify(stores));
  } catch (e) {
    // Ignore: the app still works, it just won't remember after reload.
  }
}

let stores = loadStores();
let currentStoreId = null;

// ---------- Helpers ----------
function statusText(store) {
  if (store.status === "working") return "Working, no queue";
  if (store.status === "queue") return "Queue: " + store.queue + " people";
  return "Not working";
}

function statusColor(store) {
  if (store.status === "working") return "green";
  if (store.status === "queue") return "yellow";
  return "red";
}

function timeAgo(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / MINUTE);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  return minutes + " min ago";
}

function mapLink(store) {
  return "https://www.google.com/maps/search/" + encodeURIComponent(store.name + " Berlin");
}

// ---------- Screen 1: home ----------
function renderStoreList() {
  const list = document.getElementById("storeList");
  list.innerHTML = "";

  stores.forEach((store) => {
    const card = document.createElement("article");
    card.className = "store-card " + statusColor(store);
    card.innerHTML = `
      <div class="card-top">
        <h3>${store.name}</h3>
        <span class="distance">${store.distance}</span>
      </div>
      <p class="status"><span class="dot ${statusColor(store)}"></span> ${statusText(store)}</p>
      <p class="updated">Updated ${timeAgo(store.updatedAt)}</p>
      <div class="card-buttons">
        <a class="btn secondary" href="${mapLink(store)}" target="_blank" rel="noopener">Map</a>
        <button class="btn primary">Report status</button>
      </div>
    `;
    card.querySelector(".btn.primary").addEventListener("click", () => openDetail(store.id));
    list.appendChild(card);
  });
}

// ---------- Screen 2: detail / report ----------
function openDetail(storeId) {
  currentStoreId = storeId;
  const store = stores.find((s) => s.id === storeId);

  document.getElementById("detailName").textContent = store.name + " – " + store.distance;
  document.getElementById("detailStatus").innerHTML =
    `<span class="dot ${statusColor(store)}"></span> ${statusText(store)} · updated ${timeAgo(store.updatedAt)}`;
  document.getElementById("detailMap").src =
    "https://maps.google.com/maps?q=" + encodeURIComponent(store.name + " Berlin") + "&output=embed";

  showScreen("detail");
}

function report(status, queue) {
  const store = stores.find((s) => s.id === currentStoreId);
  store.status = status;
  store.queue = queue || null;
  store.updatedAt = Date.now();
  saveStores();

  renderStoreList();
  showScreen("home");
  showToast();
}

function showScreen(name) {
  document.getElementById("home").classList.toggle("hidden", name !== "home");
  document.getElementById("detail").classList.toggle("hidden", name !== "detail");
  window.scrollTo(0, 0);
}

function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

// ---------- Event listeners ----------
document.getElementById("backBtn").addEventListener("click", () => showScreen("home"));

document.querySelectorAll(".report-btn").forEach((button) => {
  button.addEventListener("click", () => report(button.dataset.status, button.dataset.queue));
});

document.getElementById("showSentence").addEventListener("click", () => {
  document.getElementById("germanSentence").classList.toggle("hidden");
});

// Refresh the "x min ago" labels every minute.
setInterval(renderStoreList, MINUTE);

renderStoreList();
