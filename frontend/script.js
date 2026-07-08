const API_URL = 'http://127.0.0.1:8000';

const todoList = document.getElementById('todoList');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const addBtn = document.getElementById('addBtn');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) throw new Error('Ошибка загрузки');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return [];
    }
}

async function createTodo(title, description) {
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description: description || null, completed: false })
        });
        if (!response.ok) throw new Error('Ошибка создания');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

async function updateTodo(todoId, completed) {
    try {
        const response = await fetch(`${API_URL}/todos/${todoId}?completed=${completed}`, {
            method: 'PATCH'
        });
        if (!response.ok) throw new Error('Ошибка обновления');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

async function deleteTodo(todoId) {
    try {
        const response = await fetch(`${API_URL}/todos/${todoId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ошибка удаления');
        return true;
    } catch (error) {
        console.error('Ошибка:', error);
        return false;
    }
}

function renderTodos(todos) {
    const filtered = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filtered.length === 0) {
        todoList.innerHTML = `
            <div class="empty-msg">
                ${todos.length === 0 ? 'Нет задач' : 'Нет задач в этом фильтре'}
            </div>
        `;
        taskCount.textContent = todos.length;
        return;
    }

    let html = '';
    for (const todo of filtered) {
        const isDone = todo.completed;
        html += `
            <div class="todo-item" data-id="${todo.id}">
                <div class="todo-info">
                    <button class="todo-check ${isDone ? 'done' : ''}" data-id="${todo.id}"></button>
                    <div class="todo-text">
                        <span class="todo-title ${isDone ? 'done' : ''}">${escapeHtml(todo.title)}</span>
                        ${todo.description ? `<span class="todo-desc">— ${escapeHtml(todo.description)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="delete-btn" data-id="${todo.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    todoList.innerHTML = html;
    taskCount.textContent = todos.length;

    document.querySelectorAll('.todo-check').forEach(btn => {
        btn.addEventListener('click', handleToggle);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleToggle(event) {
    const btn = event.target;
    const todoId = parseInt(btn.dataset.id);
    const isDone = btn.classList.contains('done');
    const updated = await updateTodo(todoId, !isDone);
    if (updated) await loadAndRender();
}

async function handleDelete(event) {
    const btn = event.target.closest('.delete-btn');
    if (!btn) return;
    const todoId = parseInt(btn.dataset.id);
    if (confirm('Удалить задачу?')) {
        const success = await deleteTodo(todoId);
        if (success) await loadAndRender();
    }
}

async function loadAndRender() {
    const todos = await fetchTodos();
    renderTodos(todos);
}

async function handleAdd() {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title) {
        alert('Введите название задачи');
        return;
    }
    const newTodo = await createTodo(title, description || null);
    if (newTodo) {
        titleInput.value = '';
        descInput.value = '';
        await loadAndRender();
    }
}

addBtn.addEventListener('click', handleAdd);

titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});
descInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadAndRender();
    });
});

loadAndRender();