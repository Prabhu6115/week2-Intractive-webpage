class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.filter = "all";

    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  /* ---------- Cache DOM ---------- */
  cacheDOM() {
    this.form = document.getElementById("taskForm");
    this.input = document.getElementById("taskInput");
    this.list = document.getElementById("taskList");

    this.totalEl = document.getElementById("totalTasks");
    this.activeEl = document.getElementById("activeTasks");
    this.completedEl = document.getElementById("completedTasks");

    this.themeToggle = document.getElementById("themeToggle");
    this.filterButtons = document.querySelectorAll("[data-filter]");
  }

  /* ---------- Events ---------- */
  bindEvents() {
    // Add task
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      this.addTask(this.input.value);
      this.input.value = "";
    });

    // Filters
    this.filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.filter = btn.dataset.filter;
        this.render();
      });
    });

    // Theme toggle
    this.themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      this.themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }

  /* ---------- CRUD ---------- */
  addTask(text) {
    if (!text.trim()) return;

    this.tasks.push({
      id: Date.now(),
      text: text.trim(),
      completed: false
    });

    this.save();
    this.render();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  toggleTask(id) {
    this.tasks = this.tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.save();
    this.render();
  }

  editTask(id, newText) {
    this.tasks = this.tasks.map(t =>
      t.id === id ? { ...t, text: newText } : t
    );
    this.save();
    this.render();
  }

  /* ---------- Helpers ---------- */
  getFilteredTasks() {
    if (this.filter === "active") return this.tasks.filter(t => !t.completed);
    if (this.filter === "completed") return this.tasks.filter(t => t.completed);
    return this.tasks;
  }

  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  /* ---------- Render ---------- */
  render() {
    this.list.innerHTML = "";

    this.getFilteredTasks().forEach(task => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      li.draggable = true;
      li.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => this.toggleTask(task.id));

      const span = document.createElement("span");
      span.textContent = task.text;
      span.addEventListener("dblclick", () => {
        const updated = prompt("Edit task:", task.text);
        if (updated && updated.trim()) {
          this.editTask(task.id, updated.trim());
        }
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => this.deleteTask(task.id));

      li.append(checkbox, span, delBtn);
      this.addDragEvents(li);
      this.list.appendChild(li);
    });

    this.updateStats();
  }

  /* ---------- Drag & Drop ---------- */
  addDragEvents(item) {
    item.addEventListener("dragstart", () =>
      item.classList.add("dragging")
    );

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      this.reorderTasks();
    });

    item.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (dragging && dragging !== item) {
        this.list.insertBefore(dragging, item);
      }
    });
  }

  reorderTasks() {
    const ids = [...this.list.children].map(li => Number(li.dataset.id));
    this.tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    this.save();
  }

  /* ---------- Stats ---------- */
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;

    this.totalEl.textContent = total;
    this.completedEl.textContent = completed;
    this.activeEl.textContent = total - completed;
  }
}

/* ---------- Init ---------- */
new TaskManager();
