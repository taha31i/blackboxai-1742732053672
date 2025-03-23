import { storage, showNotification } from './app.js';

const STORAGE_KEY = 'pet_reminders';

export function initReminders() {
    const form = document.getElementById('reminder-form');
    if (form) {
        initDateTimeInput(); // Initialize the datetime input
        form.addEventListener('submit', handleAddReminder);
        loadReminders();
    }
}

// Initialize datetime-local input with current date/time
function initDateTimeInput() {
    const dateTimeInput = document.getElementById('reminder-datetime');
    if (dateTimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateTimeInput.min = now.toISOString().slice(0,16);
        
        // Set default value to current time + 1 hour
        const defaultTime = new Date(now.getTime() + 60 * 60 * 1000);
        dateTimeInput.value = defaultTime.toISOString().slice(0,16);
    }
}

function handleAddReminder(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('reminder-title');
    const dateTimeInput = document.getElementById('reminder-datetime');
    const notesInput = document.getElementById('reminder-notes');
    
    try {
        // Validate inputs
        if (!titleInput.value.trim()) {
            throw new Error('Please enter a reminder title');
        }
        if (!dateTimeInput.value) {
            throw new Error('Please select a date and time');
        }

        // Parse the date input value
        const selectedDate = new Date(dateTimeInput.value);
        const now = new Date();

        // Validate date
        if (isNaN(selectedDate.getTime())) {
            throw new Error('Please enter a valid date and time');
        }
        if (selectedDate < now) {
            throw new Error('Please select a future date and time');
        }

        const reminder = {
            id: Date.now(),
            title: titleInput.value.trim(),
            datetime: selectedDate.toISOString(),
            notes: notesInput.value.trim(),
            completed: false
        };

        // Add reminder to storage
        const reminders = storage.load(STORAGE_KEY) || [];
        reminders.push(reminder);
        
        if (storage.save(STORAGE_KEY, reminders)) {
            showNotification('Reminder added successfully');
            event.target.reset();
            loadReminders();
            
            // Schedule notification if supported
            scheduleNotification(reminder);
        } else {
            throw new Error('Failed to save reminder');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function loadReminders() {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) return;

    try {
        const reminders = storage.load(STORAGE_KEY) || [];
        
        if (reminders.length === 0) {
            remindersList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-bell text-4xl mb-4"></i>
                    <p>No reminders yet. Add your first reminder above!</p>
                </div>
            `;
            return;
        }

        // Sort reminders by date
        reminders.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        remindersList.innerHTML = reminders.map(reminder => `
            <div class="bg-gray-50 rounded-lg p-4 flex items-start justify-between ${
                reminder.completed ? 'opacity-50' : ''
            }" data-id="${reminder.id}">
                <div class="flex-1">
                    <div class="flex items-center">
                        <input type="checkbox" 
                               class="reminder-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300"
                               ${reminder.completed ? 'checked' : ''}
                               onchange="handleReminderToggle(${reminder.id})">
                        <h3 class="ml-2 text-lg font-medium ${
                            reminder.completed ? 'line-through' : ''
                        }">${reminder.title}</h3>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                        <i class="far fa-clock"></i>
                        ${formatDateTime(reminder.datetime)}
                    </p>
                    ${reminder.notes ? `
                        <p class="text-sm text-gray-600 mt-2">${reminder.notes}</p>
                    ` : ''}
                </div>
                <button onclick="handleDeleteReminder(${reminder.id})"
                        class="ml-4 text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add global functions for event handlers
        window.handleReminderToggle = handleReminderToggle;
        window.handleDeleteReminder = handleDeleteReminder;
    } catch (error) {
        console.error('Error loading reminders:', error);
        remindersList.innerHTML = `
            <div class="text-red-500 text-center py-4">
                Error loading reminders. Please try refreshing the page.
            </div>
        `;
    }
}

function handleReminderToggle(reminderId) {
    try {
        const reminders = storage.load(STORAGE_KEY) || [];
        const reminderIndex = reminders.findIndex(r => r.id === reminderId);
        
        if (reminderIndex !== -1) {
            reminders[reminderIndex].completed = !reminders[reminderIndex].completed;
            if (storage.save(STORAGE_KEY, reminders)) {
                loadReminders();
            }
        }
    } catch (error) {
        showNotification('Error updating reminder', 'error');
    }
}

function handleDeleteReminder(reminderId) {
    try {
        const reminders = storage.load(STORAGE_KEY) || [];
        const updatedReminders = reminders.filter(r => r.id !== reminderId);
        
        if (storage.save(STORAGE_KEY, updatedReminders)) {
            showNotification('Reminder deleted successfully');
            loadReminders();
        }
    } catch (error) {
        showNotification('Error deleting reminder', 'error');
    }
}

function formatDateTime(dateTimeStr) {
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

function scheduleNotification(reminder) {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
        return;
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Schedule notification if permitted
    if (Notification.permission === 'granted') {
        const notificationTime = new Date(reminder.datetime).getTime();
        const now = new Date().getTime();
        
        if (notificationTime > now) {
            setTimeout(() => {
                new Notification('Pet Care Reminder', {
                    body: reminder.title,
                    icon: '/favicon.ico' // Add a favicon to your project for this
                });
            }, notificationTime - now);
        }
    }
}