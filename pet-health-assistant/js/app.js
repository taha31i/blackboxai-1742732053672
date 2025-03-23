// Import modules
import { initReminders } from './reminders.js';
import { initHealthRecords } from './healthRecords.js';
import { initAdvice } from './advice.js';
import { initProfiles } from './profiles.js';

// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
const pages = document.querySelectorAll('.page');

// Initialize mobile menu
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Navigation handling
function navigateToPage(pageId) {
    // Hide all pages
    pages.forEach(page => page.classList.add('hidden'));
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }

    // Update active state in navigation
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('text-indigo-600', 'font-medium');
            link.classList.remove('text-gray-500');
        } else {
            link.classList.remove('text-indigo-600', 'font-medium');
            link.classList.add('text-gray-500');
        }
    });

    // Hide mobile menu after navigation
    mobileMenu.classList.add('hidden');
}

// Add click event listeners to navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;
        navigateToPage(pageId);
    });
});

// Style navigation links
navLinks.forEach(link => {
    link.classList.add(
        'inline-flex',
        'items-center',
        'px-1',
        'pt-1',
        'text-sm',
        'font-medium',
        'text-gray-500',
        'hover:text-indigo-600',
        'transition-colors'
    );
});

// Style mobile navigation links
document.querySelectorAll('.nav-link-mobile').forEach(link => {
    link.classList.add(
        'block',
        'pl-3',
        'pr-4',
        'py-2',
        'text-base',
        'font-medium',
        'text-gray-500',
        'hover:text-indigo-600',
        'hover:bg-gray-50'
    );
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize modules
        initProfiles();
        initReminders();
        initHealthRecords();
        initAdvice();

        // Set initial page
        navigateToPage('home');

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = `
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> Unable to initialize the application. Please refresh the page.</span>
        `;
        document.querySelector('main').prepend(errorDiv);
    }
});

// Storage helper functions
export const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
};

// Show notification helper
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}