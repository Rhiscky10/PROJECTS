// Global variables
let tasks = [];
let schedule = [];
let activeTab = 'tasks';
let studyTimer = {
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
    interval: null
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    updateDashboard();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
}

// Load data from localStorage
function loadData() {
    const savedTasks = localStorage.getItem('studentTasks');
    const savedSchedule = localStorage.getItem('studentSchedule');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
    
    if (savedSchedule) {
        schedule = JSON.parse(savedSchedule);
        renderSchedule();
    }
    
    updateDashboard();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('studentTasks', JSON.stringify(tasks));
    localStorage.setItem('studentSchedule', JSON.stringify(schedule));
}

// Switch tabs
function switchTab(tabName) {
    // Update active tab
    activeTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-500');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-500');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// Task functions
function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const subject = document.getElementById('taskSubject').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const type = document.getElementById('taskType').value;
    
    if (!title) return;
    
    const task = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        priority,
        type,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveData();
    renderTasks();
    updateDashboard();
    
    // Clear form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskSubject').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskType').value = 'assignment';
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
        updateDashboard();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateDashboard();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="text-gray-500 text-center py-8">No tasks yet. Add your first task!</p>';
        return;
    }
    
    taskList.innerHTML = tasks.map(task => `
        <div class="p-4 border rounded-lg ${task.completed ? 'completed-task' : 'bg-white'}">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})"
                           class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-lg">${getTypeIcon(task.type)}</span>
                            <h3 class="font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}">${task.title}</h3>
                            <span class="px-2 py-1 text-xs rounded-full priority-${task.priority}">${task.priority}</span>
                        </div>
                        ${task.subject ? `<p class="text-sm text-gray-600 mb-1">${task.subject}</p>` : ''}
                        ${task.dueDate ? `<p class="text-sm text-gray-500">Due: ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
                    </div>
                </div>
                <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Event functions
function addEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('eventStartTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const type = document.getElementById('eventType').value;
    
    if (!title || !date) return;
    
    const event = {
        id: Date.now(),
        title,
        date,
        startTime,
        endTime,
        type
    };
    
    schedule.push(event);
    saveData();
    renderSchedule();
    updateDashboard();
    
    // Clear form
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventStartTime').value = '';
    document.getElementById('eventEndTime').value = '';
    document.getElementById('eventType').value = 'class';
}

function deleteEvent(id) {
    schedule = schedule.filter(e => e.id !== id);
    saveData();
    renderSchedule();
    updateDashboard();
}

function renderSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    
    if (schedule.length === 0) {
        scheduleList.innerHTML = '<p class="text-gray-500 text-center py-8">No events scheduled. Add your first event!</p>';
        return;
    }
    
    const sortedSchedule = schedule.sort((a, b) => 
        new Date(a.date + ' ' + (a.startTime || '00:00')) - new Date(b.date + ' ' + (b.startTime || '00:00'))
    );
    
    scheduleList.innerHTML = sortedSchedule.map(event => `
        <div class="p-4 border rounded-lg bg-white">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h3 class="font-medium text-gray-900">${event.title}</h3>
                        <span class="px-2 py-1 text-xs rounded-full event-${event.type}">${event.type}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">📅 ${new Date(event.date).toLocaleDateString()}</p>
                    ${event.startTime ? `<p class="text-sm text-gray-600">🕐 ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}</p>` : ''}
                </div>
                <button onclick="deleteEvent(${event.id})" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Timer functions
function toggleTimer() {
    if (studyTimer.isActive) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    studyTimer.isActive = true;
    document.getElementById('startPauseBtn').innerHTML = '⏸️ Pause';
    document.getElementById('startPauseBtn').className = 'px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium';
    
    studyTimer.interval = setInterval(() => {
        if (studyTimer.seconds > 0) {
            studyTimer.seconds--;
        } else if (studyTimer.minutes > 0) {
            studyTimer.minutes--;
            studyTimer.seconds = 59;
        } else {
            // Timer finished
            studyTimer.isBreak = !studyTimer.isBreak;
            studyTimer.minutes = studyTimer.isBreak ? 5 : 25;
            studyTimer.seconds = 0;
            studyTimer.isActive = false;
            clearInterval(studyTimer.interval);
            
            document.getElementById('startPauseBtn').innerHTML = '▶️ Start';
            document.getElementById('startPauseBtn').className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium';
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    studyTimer.isActive = false;
    clearInterval(studyTimer.interval);
    document.getElementById('startPauseBtn').innerHTML = '▶️ Start';
    document.getElementById('startPauseBtn').className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium';
}

function resetTimer() {
    studyTimer.isActive = false;
    studyTimer.isBreak = false;
    studyTimer.minutes = 25;
    studyTimer.seconds = 0;
    clearInterval(studyTimer.interval);
    
    document.getElementById('startPauseBtn').innerHTML = '▶️ Start';
    document.getElementById('startPauseBtn').className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium';
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const title = document.getElementById('timerTitle');
    const description = document.getElementById('timerDescription');
    
    const minutes = studyTimer.minutes.toString().padStart(2, '0');
    const seconds = studyTimer.seconds.toString().padStart(2, '0');
    
    display.textContent = `${minutes}:${seconds}`;
    display.className = `text-6xl font-mono font-bold mb-4 ${studyTimer.isBreak ? 'text-green-600' : 'text-blue-600'}`;
    
    title.textContent = studyTimer.isBreak ? '☕ Break Time' : '📚 Study Session';
    description.textContent = studyTimer.isBreak ? 'Take a break and relax' : 'Focus on your studies';
}

// Dashboard functions
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    // Update stats
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('upcomingEvents').textContent = schedule.filter(e => e.date >= today).length;
    
    // Update today's schedule
    const todayEvents = schedule.filter(e => e.date === today).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    const todayScheduleEl = document.getElementById('todaySchedule');
    
    if (todayEvents.length === 0) {
        todayScheduleEl.innerHTML = '<p class="text-gray-500">No events scheduled for today</p>';
    } else {
        todayScheduleEl.innerHTML = '<div class="space-y-2">' + todayEvents.map(event => `
            <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <span class="text-sm font-medium text-gray-600">${event.startTime || ''}</span>
                <span class="flex-1">${event.title}</span>
                <span class="px-2 py-1 text-xs rounded event-${event.type}">${event.type}</span>
            </div>
        `).join('') + '</div>';
    }
    
    // Update upcoming tasks
    const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate >= today).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
    const upcomingTasksEl = document.getElementById('upcomingTasksList');
    
    if (upcomingTasks.length === 0) {
        upcomingTasksEl.innerHTML = '<p class="text-gray-500">No upcoming tasks</p>';
    } else {
        upcomingTasksEl.innerHTML = '<div class="space-y-2">' + upcomingTasks.map(task => `
            <div class="p-2 bg-gray-50 rounded">
                <div class="flex items-center space-x-2">
                    <span>${getTypeIcon(task.type)}</span>
                    <span class="flex-1 text-sm">${task.title}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
        `).join('') + '</div>';
    }
}

// Helper functions
function getTypeIcon(type) {
    const icons = {
        assignment: '📝',
        exam: '📚',
        project: '💼',
        reading: '📖'
    };
    return icons[type] || '📋';
}

// Initialize timer display
updateTimerDisplay();
