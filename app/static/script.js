const API_URL = "/api/tasks";

let tasks = [];
let currentFilter = "all";
let currentPriority = "all";
let editingTaskId = null;

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    updateCurrentDate();
    loadTasks();
});

function setupEventListeners() {
    document.getElementById("openTaskForm").addEventListener("click", openCreateForm);
    document.getElementById("closeTaskForm").addEventListener("click", closeTaskForm);
    document.getElementById("cancelTaskForm").addEventListener("click", closeTaskForm);
    document.getElementById("taskForm").addEventListener("submit", saveTask);
    document.getElementById("searchInput").addEventListener("input", renderTasks);

    document.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach(item =>
                item.classList.toggle("active", item === button)
            );
            updateSectionHeading();
            renderTasks();
        });
    });

    document.querySelectorAll("[data-priority]").forEach(button => {
        button.addEventListener("click", () => {
            currentPriority = button.dataset.priority;
            document.querySelectorAll("[data-priority]").forEach(item =>
                item.classList.toggle("active", item === button)
            );
            renderTasks();
        });
    });

    const dialog = document.getElementById("taskDialog");
    dialog.addEventListener("click", event => {
        if (event.target === dialog) closeTaskForm();
    });

    document.getElementById("taskList").addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const task = tasks.find(item => item.id === id);
        if (!task) return;

        if (button.dataset.action === "toggle") toggleTask(id);
        if (button.dataset.action === "edit") openEditForm(task);
        if (button.dataset.action === "delete") deleteTask(id);
    });
}

async function loadTasks() {
    const taskList = document.getElementById("taskList");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        tasks = await response.json();
        renderTasks();
        updateStatistics();
    } catch (error) {
        console.error("Unable to load tasks:", error);
        taskList.replaceChildren();
        const message = document.createElement("div");
        message.className = "empty-state";
        const heading = document.createElement("h3");
        heading.textContent = "Unable to load tasks";
        const detail = document.createElement("p");
        detail.textContent = "Check that FastAPI is running, then try again.";
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "secondary-button";
        retry.textContent = "Try again";
        retry.addEventListener("click", loadTasks);
        message.append(heading, detail, retry);
        taskList.append(message);
    }
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    const template = document.getElementById("taskTemplate");
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const today = getTodayDate();

    const filtered = tasks.filter(task => {
        const textMatches =
            String(task.title || "").toLowerCase().includes(query) ||
            String(task.description || "").toLowerCase().includes(query);
        const priorityMatches = currentPriority === "all" || task.priority === currentPriority;

        let statusMatches = true;
        if (currentFilter === "today") statusMatches = task.due_date === today && !task.completed;
        else if (currentFilter === "upcoming") statusMatches = Boolean(task.due_date) && task.due_date > today && !task.completed;
        else if (currentFilter === "pending") statusMatches = !task.completed;
        else if (currentFilter === "completed") statusMatches = Boolean(task.completed);

        return textMatches && priorityMatches && statusMatches;
    });

    document.getElementById("visibleCount").textContent =
        `${filtered.length} ${filtered.length === 1 ? "task" : "tasks"}`;

    taskList.replaceChildren();

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        const icon = document.createElement("div");
        icon.className = "empty-icon";
        icon.textContent = "✓";
        const heading = document.createElement("h3");
        heading.textContent = "No tasks found";
        const detail = document.createElement("p");
        detail.textContent = "Add a task or try changing your filters.";
        empty.append(icon, heading, detail);
        taskList.append(empty);
        return;
    }

    filtered.forEach(task => {
        const card = template.content.firstElementChild.cloneNode(true);
        const completeButton = card.querySelector('[data-action="toggle"]');
        const title = card.querySelector(".task-title");
        const description = card.querySelector(".task-description");
        const dueDate = card.querySelector(".task-due-date");
        const priority = card.querySelector(".task-priority");

        card.dataset.taskId = String(task.id);
        title.textContent = task.title || "";
        description.textContent = task.description || "";
        dueDate.textContent = task.due_date ? `◷ ${task.due_date}` : "";
        priority.textContent = task.priority || "Medium";
        priority.classList.add(String(task.priority || "Medium").toLowerCase());

        card.querySelectorAll("button[data-action]").forEach(button => {
            button.dataset.id = String(task.id);
        });

        if (task.completed) {
            card.classList.add("task-completed");
            completeButton.classList.add("checked");
            completeButton.textContent = "✓";
            completeButton.setAttribute("aria-label", "Mark as pending");
            completeButton.title = "Mark as pending";
        } else {
            completeButton.textContent = "";
            completeButton.setAttribute("aria-label", "Mark as completed");
            completeButton.title = "Mark as completed";
        }

        taskList.append(card);
    });
}

function openCreateForm() {
    editingTaskId = null;
    document.getElementById("taskForm").reset();
    document.getElementById("dialogTitle").textContent = "Create a task";
    document.getElementById("saveTaskButton").textContent = "Save task";
    document.getElementById("formError").textContent = "";
    document.getElementById("taskDialog").showModal();
    document.getElementById("taskTitle").focus();
}

function openEditForm(task) {
    editingTaskId = task.id;
    document.getElementById("taskTitle").value = task.title || "";
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskDueDate").value = task.due_date || "";
    document.getElementById("taskPriority").value = task.priority || "Medium";
    document.getElementById("dialogTitle").textContent = "Edit task";
    document.getElementById("saveTaskButton").textContent = "Save changes";
    document.getElementById("formError").textContent = "";
    document.getElementById("taskDialog").showModal();
    document.getElementById("taskTitle").focus();
}

function closeTaskForm() {
    const dialog = document.getElementById("taskDialog");
    if (dialog.open) dialog.close();
    document.getElementById("taskForm").reset();
    document.getElementById("formError").textContent = "";
    editingTaskId = null;
}

async function saveTask(event) {
    event.preventDefault();

    const formError = document.getElementById("formError");
    const saveButton = document.getElementById("saveTaskButton");
    const title = document.getElementById("taskTitle").value.trim();

    if (!title) {
        formError.textContent = "Please enter a task title.";
        return;
    }

    const payload = {
        title,
        description: document.getElementById("taskDescription").value.trim(),
        due_date: document.getElementById("taskDueDate").value,
        priority: document.getElementById("taskPriority").value
    };

    let url = API_URL;
    let method = "POST";

    if (editingTaskId !== null) {
        const existing = tasks.find(task => task.id === editingTaskId);
        payload.completed = Boolean(existing && existing.completed);
        url = `${API_URL}/${editingTaskId}`;
        method = "PUT";
    }

    saveButton.disabled = true;
    formError.textContent = "";

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            const detail = typeof result.detail === "string" ? result.detail : `Request failed (${response.status})`;
            throw new Error(detail);
        }

        closeTaskForm();
        await loadTasks();
        showMessage("Task saved successfully.");
    } catch (error) {
        console.error("Unable to save task:", error);
        formError.textContent = error.message || "Unable to save task.";
    } finally {
        saveButton.disabled = false;
    }
}

async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/complete`, { method: "PATCH" });
        if (!response.ok) throw new Error(`Unable to update task (${response.status})`);
        await loadTasks();
    } catch (error) {
        console.error("Unable to update task:", error);
        showMessage(error.message, true);
    }
}

async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Unable to delete task (${response.status})`);
        await loadTasks();
        showMessage("Task deleted successfully.");
    } catch (error) {
        console.error("Unable to delete task:", error);
        showMessage(error.message, true);
    }
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressPercent").textContent = progress;
    document.getElementById("progressBar").style.width = `${progress}%`;
    document.getElementById("allCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
}

function updateSectionHeading() {
    const headings = {
        all: ["All tasks", "Everything you want to get done."],
        today: ["Today's tasks", "What you need to focus on today."],
        upcoming: ["Upcoming tasks", "Things planned for the days ahead."],
        pending: ["Pending tasks", "Tasks still waiting for you."],
        completed: ["Completed tasks", "Look at what you've accomplished."]
    };
    const heading = headings[currentFilter] || headings.all;
    document.getElementById("sectionTitle").textContent = heading[0];
    document.getElementById("taskSubtitle").textContent = heading[1];
}

function getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function updateCurrentDate() {
    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        }).toUpperCase();
}

function showMessage(message, isError = false) {
    let element = document.getElementById("appMessage");
    if (!element) {
        element = document.createElement("div");
        element.id = "appMessage";
        element.setAttribute("role", "status");
        document.body.append(element);
    }

    element.textContent = message;
    element.style.background = isError ? "#fff0f1" : "#e7f8f0";
    element.style.color = isError ? "#b42332" : "#18794e";
    element.style.display = "block";

    clearTimeout(element.hideTimer);
    element.hideTimer = setTimeout(() => {
        element.style.display = "none";
    }, 3500);
}
