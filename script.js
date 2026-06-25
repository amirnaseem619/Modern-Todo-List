// State
let tasks = JSON.parse(localStorage.getItem("tasks_v2") || "[]");
let filter = "all";

// Date
const dateBlock = document.getElementById("dateBlock");
const now = new Date();
dateBlock.innerHTML = `
    ${now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}<br>
    ${now.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}<br>
    ${now.getFullYear()}
  `;

function save() {
  localStorage.setItem("tasks_v2", JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    input.style.animation = "none";
    setTimeout(() => {
      input.style.animation = "";
    }, 10);
    return;
  }
  const priority = document.getElementById("prioritySelect").value;
  tasks.unshift({
    id: Date.now(),
    text,
    priority,
    done: false,
    created: new Date().toISOString(),
  });
  input.value = "";
  save();
  render();
  input.focus();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add("removing");
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      save();
      render();
    }, 250);
  }
}

function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const active = total - done;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("activeCount").textContent = active;
  document.getElementById("doneCount").textContent = done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressLabel").textContent = pct + "%";
}

function getFiltered() {
  return tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return t.priority === filter;
  });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function render() {
  updateStats();
  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyState");
  const filtered = getFiltered();

  // Clear except empty state
  Array.from(list.children).forEach((c) => {
    if (c !== empty) c.remove();
  });

  if (filtered.length === 0) {
    empty.classList.add("visible");
    return;
  }

  empty.classList.remove("visible");

  // Separate active and done if showing all
  const toRender = filtered;

  toRender.forEach((task) => {
    const item = document.createElement("div");
    item.className = `task-item priority-${task.priority}${task.done ? " done" : ""}`;
    item.dataset.id = task.id;
    item.dataset.priority = task.priority;

    item.innerHTML = `
        <div class="check" onclick="toggleTask(${task.id})">
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="#0e0e0e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="task-text-wrap">
          <div class="task-text">${escapeHTML(task.text)}</div>
          <div class="task-meta">
            <span class="priority-tag">${task.priority}</span>
            ${timeAgo(task.created)}
          </div>
        </div>
        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      `;

    list.appendChild(item);
  });
}

function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}

// Events
document.getElementById("addBtn").addEventListener("click", addTask);
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

document.getElementById("clearDone").addEventListener("click", clearDone);

// Init with sample tasks if empty
if (tasks.length === 0) {
  const now = new Date().toISOString();
  tasks = [
    {
      id: 1,
      text: "Review design mockups",
      priority: "high",
      done: false,
      created: now,
    },
    {
      id: 2,
      text: "Reply to client emails",
      priority: "medium",
      done: false,
      created: now,
    },
    {
      id: 3,
      text: "Update documentation",
      priority: "low",
      done: true,
      created: now,
    },
  ];
  save();
}

render();