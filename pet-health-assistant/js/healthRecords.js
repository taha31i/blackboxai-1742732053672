import { storage, showNotification } from './app.js';

const STORAGE_KEY = 'pet_health_records';

export function initHealthRecords() {
    const form = document.getElementById('health-record-form');
    if (form) {
        form.addEventListener('submit', handleAddHealthRecord);
        loadHealthRecords();
    }
}

function handleAddHealthRecord(event) {
    event.preventDefault();
    
    const dateInput = document.getElementById('record-date');
    const typeInput = document.getElementById('record-type');
    const notesInput = document.getElementById('record-notes');
    
    try {
        // Validate inputs
        if (!dateInput.value) {
            throw new Error('Please select a date');
        }
        if (!typeInput.value) {
            throw new Error('Please select a record type');
        }

        const healthRecord = {
            id: Date.now(),
            date: dateInput.value,
            type: typeInput.value,
            notes: notesInput.value.trim(),
            createdAt: new Date().toISOString()
        };

        // Add record to storage
        const records = storage.load(STORAGE_KEY) || [];
        records.push(healthRecord);
        
        if (storage.save(STORAGE_KEY, records)) {
            showNotification('Health record added successfully');
            event.target.reset();
            loadHealthRecords();
        } else {
            throw new Error('Failed to save health record');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function loadHealthRecords() {
    const recordsList = document.getElementById('health-records-list');
    if (!recordsList) return;

    try {
        const records = storage.load(STORAGE_KEY) || [];
        
        if (records.length === 0) {
            recordsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-notes-medical text-4xl mb-4"></i>
                    <p>No health records yet. Add your first record above!</p>
                </div>
            `;
            return;
        }

        // Sort records by date (most recent first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        recordsList.innerHTML = records.map(record => `
            <div class="bg-gray-50 rounded-lg p-4 mb-4" data-id="${record.id}">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                getTypeStyles(record.type)
                            }">
                                ${formatRecordType(record.type)}
                            </span>
                            <span class="ml-2 text-sm text-gray-500">
                                ${formatDate(record.date)}
                            </span>
                        </div>
                        ${record.notes ? `
                            <p class="mt-2 text-gray-700">${record.notes}</p>
                        ` : ''}
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="handleEditHealthRecord(${record.id})"
                                class="text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="handleDeleteHealthRecord(${record.id})"
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add global functions for event handlers
        window.handleEditHealthRecord = handleEditHealthRecord;
        window.handleDeleteHealthRecord = handleDeleteHealthRecord;
    } catch (error) {
        console.error('Error loading health records:', error);
        recordsList.innerHTML = `
            <div class="text-red-500 text-center py-4">
                Error loading health records. Please try refreshing the page.
            </div>
        `;
    }
}

function handleEditHealthRecord(recordId) {
    try {
        const records = storage.load(STORAGE_KEY) || [];
        const record = records.find(r => r.id === recordId);
        
        if (record) {
            // Populate form with record data
            document.getElementById('record-date').value = record.date;
            document.getElementById('record-type').value = record.type;
            document.getElementById('record-notes').value = record.notes || '';
            
            // Update form submit handler to handle edit
            const form = document.getElementById('health-record-form');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            submitBtn.textContent = 'Update Record';
            form.dataset.editId = recordId;
            
            // Scroll form into view
            form.scrollIntoView({ behavior: 'smooth' });
            
            // Update form submit handler
            form.onsubmit = (e) => {
                e.preventDefault();
                
                const updatedRecord = {
                    ...record,
                    date: document.getElementById('record-date').value,
                    type: document.getElementById('record-type').value,
                    notes: document.getElementById('record-notes').value.trim(),
                    updatedAt: new Date().toISOString()
                };
                
                const recordIndex = records.findIndex(r => r.id === recordId);
                records[recordIndex] = updatedRecord;
                
                if (storage.save(STORAGE_KEY, records)) {
                    showNotification('Health record updated successfully');
                    form.reset();
                    submitBtn.textContent = 'Add Health Record';
                    delete form.dataset.editId;
                    form.onsubmit = handleAddHealthRecord;
                    loadHealthRecords();
                }
            };
        }
    } catch (error) {
        showNotification('Error editing health record', 'error');
    }
}

function handleDeleteHealthRecord(recordId) {
    if (confirm('Are you sure you want to delete this health record?')) {
        try {
            const records = storage.load(STORAGE_KEY) || [];
            const updatedRecords = records.filter(r => r.id !== recordId);
            
            if (storage.save(STORAGE_KEY, updatedRecords)) {
                showNotification('Health record deleted successfully');
                loadHealthRecords();
            }
        } catch (error) {
            showNotification('Error deleting health record', 'error');
        }
    }
}

function formatDate(dateStr) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function formatRecordType(type) {
    return type.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getTypeStyles(type) {
    const styles = {
        vaccination: 'bg-green-100 text-green-800',
        checkup: 'bg-blue-100 text-blue-800',
        medication: 'bg-yellow-100 text-yellow-800',
        surgery: 'bg-red-100 text-red-800',
        other: 'bg-gray-100 text-gray-800'
    };
    return styles[type] || styles.other;
}