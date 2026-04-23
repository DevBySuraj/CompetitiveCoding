class MinHeap {
  constructor() {
    this.heap = [];
  }

  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  _higher(a, b) {
    if (a.priority !== b.priority) return a.priority < b.priority;
    return a.id < b.id;
  }

  insert(task) {
    this.heap.push(task);
    this._heapifyUp(this.heap.length - 1);
  }

  _heapifyUp(index) {
    while (index > 0) {
      const parent = this._parent(index);
      if (this._higher(this.heap[index], this.heap[parent])) {
        this._swap(index, parent);
        index = parent;
      } else {
        break;
      }
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);
    return min;
  }

  _heapifyDown(index) {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      const left  = this._left(index);
      const right = this._right(index);

      if (left < n  && this._higher(this.heap[left],  this.heap[smallest])) smallest = left;
      if (right < n && this._higher(this.heap[right], this.heap[smallest])) smallest = right;

      if (smallest === index) break;
      this._swap(index, smallest);
      index = smallest;
    }
  }

  peek() {
    return this.heap.length ? this.heap[0] : null;
  }

  deleteById(id) {
    const index = this.heap.findIndex(t => t.id === id);
    if (index === -1) return;

    if (index === this.heap.length - 1) {
      this.heap.pop();
      return;
    }

    this.heap[index] = this.heap.pop();
    this._heapifyUp(index);
    this._heapifyDown(index);
  }

  updateById(id, changes) {
    const task = this.heap.find(t => t.id === id);
    if (task) Object.assign(task, changes);
  }

  getSorted() {
    return [...this.heap].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.id - b.id;
    });
  }

  get size() { return this.heap.length; }

  isEmpty() { return this.heap.length === 0; }
}

const pq = new MinHeap();
let taskIdCounter = 0;
let activeFilter  = 'all';
let executingTaskId = null;

function saveTasks() {
  localStorage.setItem('taskflow_tasks',   JSON.stringify(pq.heap));
  localStorage.setItem('taskflow_counter', JSON.stringify(taskIdCounter));
}

function loadTasks() {
  const saved   = localStorage.getItem('taskflow_tasks');
  const counter = localStorage.getItem('taskflow_counter');

  if (saved) {
    const tasks = JSON.parse(saved);
    tasks.forEach(t => pq.insert(t));
  }
  if (counter) {
    taskIdCounter = JSON.parse(counter);
  }
}

function validateForm() {
  let valid = true;

  const taskVal    = document.getElementById('taskInput').value.trim();
  const priorityVal = document.getElementById('priorityInput').value;
  const dateVal    = document.getElementById('dateInput').value;

  document.getElementById('taskError').classList.remove('show');
  document.getElementById('priorityError').classList.remove('show');
  document.getElementById('dateError').classList.remove('show');

  if (!taskVal) {
    document.getElementById('taskError').classList.add('show');
    document.getElementById('taskInput').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('taskInput').classList.remove('input-error');
  }

  if (!priorityVal) {
    document.getElementById('priorityError').classList.add('show');
    document.getElementById('priorityInput').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('priorityInput').classList.remove('input-error');
  }

  if (!dateVal) {
    document.getElementById('dateError').classList.add('show');
    document.getElementById('dateInput').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('dateInput').classList.remove('input-error');
  }

  return valid;
}

function addTask() {
  if (!validateForm()) return;

  const task = {
    id:        ++taskIdCounter,
    title:     document.getElementById('taskInput').value.trim(),
    priority:  parseInt(document.getElementById('priorityInput').value),
    date:      document.getElementById('dateInput').value,
    completed: false,
    createdAt: Date.now()
  };

  pq.insert(task);
  saveTasks();

  document.getElementById('taskInput').value    = '';
  document.getElementById('priorityInput').value = '';
  document.getElementById('dateInput').value    = '';

  const btn = document.querySelector('.btn-primary');
  btn.classList.add('btn-success-flash');
  setTimeout(() => btn.classList.remove('btn-success-flash'), 600);

  displayTasks();
  updateStats();
}

function executeTask() {
  executingTaskId = null;

  const task = pq.extractMin();
  const banner = document.getElementById('executingBanner');
  const text   = document.getElementById('executingText');

  if (!task) {
    banner.classList.remove('active');
    text.textContent = 'No tasks to execute';
    displayTasks();
    updateStats();
    return;
  }

  const labels = { 1: 'HIGH', 2: 'MEDIUM', 3: 'LOW' };
  text.textContent = `Executing: "${task.title}" [${labels[task.priority]} Priority · Due ${formatDate(task.date)}]`;
  banner.classList.add('active');

  saveTasks();
  displayTasks();
  updateStats();

  setTimeout(() => banner.classList.remove('active'), 5000);
}

function deleteTask(id) {
  pq.deleteById(id);
  if (executingTaskId === id) executingTaskId = null;
  saveTasks();
  displayTasks();
  updateStats();
}

function toggleComplete(id) {
  const task = pq.heap.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  displayTasks();
  updateStats();
}

function setFilter(el, filter) {
  activeFilter = filter;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  displayTasks();
}

const PRIORITY_META = {
  1: { label: 'HIGH',   cls: 'high',   emoji: '🔴' },
  2: { label: 'MEDIUM', cls: 'medium', emoji: '🟡' },
  3: { label: 'LOW',    cls: 'low',    emoji: '🟢' }
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00') < today;
}

function displayTasks() {
  const list      = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const search    = document.getElementById('searchInput').value.toLowerCase().trim();

  const tasks = pq.getSorted();

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search);
    const matchFilter   = activeFilter === 'all'       ? true
                        : activeFilter === 'completed' ? t.completed
                        : t.priority === parseInt(activeFilter);
    return matchSearch && matchFilter;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((t, visIndex) => {
    const meta    = PRIORITY_META[t.priority];
    const overdue = isOverdue(t.date) && !t.completed;

    const li = document.createElement('li');
    li.className = `task-card ${t.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''} ${t.id === executingTaskId ? 'executing' : ''}`;
    li.style.animationDelay = `${visIndex * 40}ms`;

    li.innerHTML = `
      <div class="task-left">
        <button class="check-btn ${t.completed ? 'checked' : ''}" onclick="toggleComplete(${t.id})" title="Mark complete">
          ${t.completed ? '✓' : ''}
        </button>
        <div class="task-info">
          <span class="task-title">${escapeHtml(t.title)}</span>
          <div class="task-meta">
            <span class="priority-badge ${meta.cls}">${meta.emoji} ${meta.label}</span>
            <span class="due-date ${overdue ? 'overdue-text' : ''}">
              ${overdue ? '⚠ ' : '📅 '} ${formatDate(t.date)}
            </span>
            <span class="task-id">#${t.id}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn delete-btn" onclick="deleteTask(${t.id})" title="Delete task">✕</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateStats() {
  const all       = pq.heap;
  const completed = all.filter(t => t.completed).length;
  const pending   = all.filter(t => !t.completed).length;
  document.getElementById('totalCount').textContent     = all.length;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('pendingCount').textContent   = pending;
}

function initTheme() {
  const saved = localStorage.getItem('taskflow_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeIcon').textContent = saved === 'dark' ? '☽' : '☀';
}

document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.getElementById('themeIcon').textContent = next === 'dark' ? '☽' : '☀';
  localStorage.setItem('taskflow_theme', next);
});

document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

(function init() {
  initTheme();
  loadTasks();
  displayTasks();
  updateStats();
})();