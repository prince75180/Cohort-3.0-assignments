document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const totalTasksSpan = document.getElementById('total-tasks');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize
    renderTasks();
    updateStats();

    // Event Listener for form submission (Create Task)
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Get values from form properties (not just attributes)
        const titleInput = document.getElementById('task-title');
        const descInput = document.getElementById('task-desc');
        const prioritySelect = document.getElementById('task-priority');
        const dateInput = document.getElementById('task-date');

        const newTask = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
            priority: prioritySelect.value,
            dueDate: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (newTask.title) {
            tasks.push(newTask);
            saveToLocalStorage();
            renderTasks();
            updateStats();
            taskForm.reset();
        }
    });

    // Event Delegation for Task Actions (Complete / Delete)
    // We attach one listener to the ul (task-list) instead of many to each li.
    // This demonstrates Event Delegation leveraging Event Bubbling.
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        
        // Find the closest li element to get the task id
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        // Handle Delete Button Click
        if (target.closest('.delete-btn')) {
            deleteTask(taskId);
        }
        
        // Handle Checkbox Click
        if (target.classList.contains('task-checkbox')) {
            toggleTaskCompletion(taskId);
        }
    });

    // Event Capturing demonstration (Optional for assignment requirement)
    // taskList.addEventListener('click', (e) => {
    //     console.log('Capturing phase: Task list clicked');
    // }, true); // 'true' enables capturing phase listener

    // Functions

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasks();
        updateStats();
    }

    function toggleTaskCompletion(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveToLocalStorage();
            renderTasks();
        }
    }

    function renderTasks() {
        taskList.innerHTML = ''; // Clear current list (DOM Manipulation)

        // Sort tasks: incomplete first, then by date
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
            }
            return a.completed ? 1 : -1;
        });

        sortedTasks.forEach(task => {
            // Create DOM elements dynamically
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            // Using dataset property (Attributes vs Properties)
            li.dataset.id = task.id;

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <h3>${escapeHTML(task.title)}</h3>
                    ${task.description ? `<p>${escapeHTML(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="priority-badge ${task.priority}">${task.priority}</span>
                        ${task.dueDate ? `<span class="task-date">📅 ${formatDate(task.dueDate)}</span>` : ''}
                    </div>
                </div>
                <button class="delete-btn" aria-label="Delete Task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            taskList.appendChild(li); // Modifying Render Tree by appending to DOM
        });
    }

    function updateStats() {
        totalTasksSpan.textContent = tasks.length; // Property manipulation
    }

    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Utility: Simple XSS protection
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        // Creating date from yyyy-mm-dd format without timezone shifting issues
        const [y, m, d] = dateString.split('-');
        return new Date(y, m - 1, d).toLocaleDateString(undefined, options);
    }
});
