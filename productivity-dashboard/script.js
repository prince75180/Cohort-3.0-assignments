document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Theme Toggle
    // -------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // -------------------------------------------------------------
    // Dashboard Navigation
    // -------------------------------------------------------------
    const dashboard = document.getElementById('dashboard');
    const featureCards = document.querySelectorAll('.feature-card');
    const backBtns = document.querySelectorAll('.back-btn');
    const views = document.querySelectorAll('.view');

    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            views.forEach(v => v.classList.remove('active'));
            dashboard.classList.add('active');
        });
    });

    // -------------------------------------------------------------
    // 3. Date & Time
    // -------------------------------------------------------------
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');

    function updateDateTime() {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dateDisplay.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // -------------------------------------------------------------
    // 4. Weather Widget
    // -------------------------------------------------------------
    const weatherTemp = document.getElementById('weather-temp');
    const weatherIcon = document.getElementById('weather-icon');

    function fetchWeather(lat, lon) {
        // Using Open-Meteo free API (no key required)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const cw = data.current_weather;
                weatherTemp.textContent = `${cw.temperature}°C`;
                // Basic mapping based on WMO weather interpretation codes
                if(cw.weathercode === 0) weatherIcon.textContent = 'clear_day';
                else if(cw.weathercode <= 3) weatherIcon.textContent = 'partly_cloudy_day';
                else if(cw.weathercode < 70) weatherIcon.textContent = 'rainy';
                else if(cw.weathercode < 80) weatherIcon.textContent = 'ac_unit'; // Snow
                else weatherIcon.textContent = 'thunderstorm';
            })
            .catch(() => {
                weatherTemp.textContent = 'Err';
            });
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
        }, () => {
            weatherTemp.textContent = 'No Loc';
        });
    } else {
        weatherTemp.textContent = 'N/A';
    }

    // -------------------------------------------------------------
    // 5. Todo List
    // -------------------------------------------------------------
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${todo.completed ? 'completed' : ''} ${todo.important ? 'important' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}" class="todo-check">
                <span class="task-text">${todo.text}</span>
                <div class="task-actions">
                    <button class="icon-btn todo-important" data-index="${index}"><span class="material-symbols-outlined" style="font-size: 1.2rem;">${todo.important ? 'star' : 'star_border'}</span></button>
                    <button class="icon-btn todo-delete" data-index="${index}"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text, completed: false, important: false });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    });

    todoList.addEventListener('click', (e) => {
        const index = e.target.closest('button, input')?.getAttribute('data-index');
        if (index === undefined) return;
        
        if (e.target.classList.contains('todo-check')) {
            todos[index].completed = !todos[index].completed;
        } else if (e.target.closest('.todo-important')) {
            todos[index].important = !todos[index].important;
        } else if (e.target.closest('.todo-delete')) {
            todos.splice(index, 1);
        }
        saveTodos();
        renderTodos();
    });
    renderTodos();

    // -------------------------------------------------------------
    // 6. Daily Planner
    // -------------------------------------------------------------
    const plannerSlots = document.getElementById('planner-slots');
    let plannerData = JSON.parse(localStorage.getItem('planner')) || {};

    function renderPlanner() {
        plannerSlots.innerHTML = '';
        for (let i = 6; i <= 22; i++) { // 6 AM to 10 PM
            const timeStr = i < 12 ? `${i} AM` : (i === 12 ? `12 PM` : `${i - 12} PM`);
            const slot = document.createElement('div');
            slot.className = 'planner-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'planner-time';
            timeLabel.textContent = timeStr;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'planner-input';
            input.value = plannerData[i] || '';
            input.placeholder = '...';
            input.addEventListener('change', (e) => {
                plannerData[i] = e.target.value;
                localStorage.setItem('planner', JSON.stringify(plannerData));
            });

            slot.appendChild(timeLabel);
            slot.appendChild(input);
            plannerSlots.appendChild(slot);
        }
    }
    renderPlanner();

    // -------------------------------------------------------------
    // 7. Daily Goals
    // -------------------------------------------------------------
    const goalsForm = document.getElementById('goals-form');
    const goalInput = document.getElementById('goal-input');
    const goalsList = document.getElementById('goals-list');
    const progressText = document.getElementById('goals-progress-text');
    const progressFill = document.getElementById('goals-progress-fill');

    let goals = JSON.parse(localStorage.getItem('goals')) || [];

    function updateGoalsProgress() {
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        progressText.textContent = `${completed} of ${total} completed`;
        const percent = total === 0 ? 0 : (completed / total) * 100;
        progressFill.style.width = `${percent}%`;
    }

    function saveGoals() {
        localStorage.setItem('goals', JSON.stringify(goals));
        updateGoalsProgress();
    }

    function renderGoals() {
        goalsList.innerHTML = '';
        goals.forEach((goal, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${goal.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" ${goal.completed ? 'checked' : ''} data-index="${index}" class="goal-check">
                <span class="task-text">${goal.text}</span>
                <div class="task-actions">
                    <button class="icon-btn goal-delete" data-index="${index}"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
                </div>
            `;
            goalsList.appendChild(li);
        });
        updateGoalsProgress();
    }

    goalsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = goalInput.value.trim();
        if (text) {
            goals.push({ text, completed: false });
            goalInput.value = '';
            saveGoals();
            renderGoals();
        }
    });

    goalsList.addEventListener('click', (e) => {
        const index = e.target.closest('button, input')?.getAttribute('data-index');
        if (index === undefined) return;
        
        if (e.target.classList.contains('goal-check')) {
            goals[index].completed = !goals[index].completed;
        } else if (e.target.closest('.goal-delete')) {
            goals.splice(index, 1);
        }
        saveGoals();
        renderGoals();
    });
    renderGoals();

    // -------------------------------------------------------------
    // 8. Pomodoro Timer
    // -------------------------------------------------------------
    const timerDisplay = document.getElementById('timer-display');
    const pomoStart = document.getElementById('pomo-start');
    const pomoPause = document.getElementById('pomo-pause');
    const pomoReset = document.getElementById('pomo-reset');
    const pomoMode = document.getElementById('pomodoro-mode');

    let pomoInterval = null;
    let timeRemaining = 25 * 60; // 25 minutes
    let isWorking = true;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeRemaining);
    }

    pomoStart.addEventListener('click', () => {
        if (pomoInterval) return;
        pomoInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimerDisplay();
            } else {
                clearInterval(pomoInterval);
                pomoInterval = null;
                // Switch mode
                isWorking = !isWorking;
                timeRemaining = isWorking ? 25 * 60 : 5 * 60;
                pomoMode.textContent = isWorking ? 'Work Session' : 'Break Session';
                updateTimerDisplay();
                alert(isWorking ? 'Break is over! Back to work.' : 'Work session complete! Take a break.');
            }
        }, 1000);
    });

    pomoPause.addEventListener('click', () => {
        clearInterval(pomoInterval);
        pomoInterval = null;
    });

    pomoReset.addEventListener('click', () => {
        clearInterval(pomoInterval);
        pomoInterval = null;
        isWorking = true;
        timeRemaining = 25 * 60;
        pomoMode.textContent = 'Work Session';
        updateTimerDisplay();
    });

    // -------------------------------------------------------------
    // 9. Motivation Quote
    // -------------------------------------------------------------
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');

    function fetchQuote() {
        quoteText.textContent = "Fetching inspiration...";
        quoteAuthor.textContent = "";
        
        fetch('https://dummyjson.com/quotes/random')
            .then(res => res.json())
            .then(data => {
                quoteText.textContent = `"${data.quote}"`;
                quoteAuthor.textContent = `- ${data.author}`;
            })
            .catch(() => {
                quoteText.textContent = "Stay positive and keep working hard!";
                quoteAuthor.textContent = "";
            });
    }

    newQuoteBtn.addEventListener('click', fetchQuote);
    // Fetch initial quote
    fetchQuote();

});
