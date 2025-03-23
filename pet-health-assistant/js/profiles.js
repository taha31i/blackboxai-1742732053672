import { storage, showNotification } from './app.js';

const STORAGE_KEY = 'pet_profiles';

export function initProfiles() {
    const form = document.getElementById('pet-profile-form');
    const photoInput = document.getElementById('pet-photo');
    
    if (form) {
        form.addEventListener('submit', handleAddProfile);
        loadProfiles();
    }

    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoPreview);
    }
}

function handlePhotoPreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photo-preview');
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function handleAddProfile(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const photoInput = document.getElementById('pet-photo');
        
        // Basic validation
        if (!formData.get('name').trim()) {
            throw new Error('Please enter your pet\'s name');
        }

        // Handle photo
        let photoData = null;
        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(photoInput.files[0]);
            reader.onload = (e) => {
                photoData = e.target.result;
                saveProfile(formData, photoData);
            };
        } else {
            saveProfile(formData, photoData);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function saveProfile(formData, photoData) {
    const profile = {
        id: Date.now(),
        name: formData.get('name').trim(),
        breed: formData.get('breed').trim(),
        age: formData.get('age').trim(),
        weight: formData.get('weight').trim(),
        photo: photoData,
        medicalHistory: formData.get('medical-history').trim(),
        vaccinations: formData.get('vaccinations').trim(),
        notes: formData.get('notes').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const profiles = storage.load(STORAGE_KEY) || [];
    profiles.push(profile);
    
    if (storage.save(STORAGE_KEY, profiles)) {
        showNotification('Pet profile added successfully');
        document.getElementById('pet-profile-form').reset();
        document.getElementById('photo-preview').classList.add('hidden');
        loadProfiles();
    } else {
        throw new Error('Failed to save pet profile');
    }
}

function loadProfiles() {
    const profilesList = document.getElementById('profiles-list');
    if (!profilesList) return;

    try {
        const profiles = storage.load(STORAGE_KEY) || [];
        
        if (profiles.length === 0) {
            profilesList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-paw text-4xl mb-4"></i>
                    <p>No pet profiles yet. Add your first pet above!</p>
                </div>
            `;
            return;
        }

        profilesList.innerHTML = profiles.map(profile => `
            <div class="bg-white rounded-lg shadow-md p-6 mb-6" data-id="${profile.id}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center">
                            ${profile.photo ? `
                                <img src="${profile.photo}" alt="${profile.name}" 
                                     class="w-20 h-20 rounded-full object-cover mr-4">
                            ` : `
                                <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                    <i class="fas fa-paw text-gray-400 text-2xl"></i>
                                </div>
                            `}
                            <div>
                                <h3 class="text-xl font-semibold text-gray-900">${profile.name}</h3>
                                <p class="text-gray-600">${profile.breed}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p class="text-sm text-gray-500">Age</p>
                                <p class="font-medium">${profile.age}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Weight</p>
                                <p class="font-medium">${profile.weight}</p>
                            </div>
                        </div>

                        ${profile.medicalHistory ? `
                            <div class="mt-4">
                                <p class="text-sm text-gray-500">Medical History</p>
                                <p class="mt-1">${profile.medicalHistory}</p>
                            </div>
                        ` : ''}

                        ${profile.vaccinations ? `
                            <div class="mt-4">
                                <p class="text-sm text-gray-500">Vaccinations</p>
                                <p class="mt-1">${profile.vaccinations}</p>
                            </div>
                        ` : ''}

                        ${profile.notes ? `
                            <div class="mt-4">
                                <p class="text-sm text-gray-500">Notes</p>
                                <p class="mt-1">${profile.notes}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="flex space-x-2">
                        <button onclick="handleEditProfile(${profile.id})"
                                class="text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="handleDeleteProfile(${profile.id})"
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add global functions for event handlers
        window.handleEditProfile = handleEditProfile;
        window.handleDeleteProfile = handleDeleteProfile;
    } catch (error) {
        console.error('Error loading profiles:', error);
        profilesList.innerHTML = `
            <div class="text-red-500 text-center py-4">
                Error loading pet profiles. Please try refreshing the page.
            </div>
        `;
    }
}

function handleEditProfile(profileId) {
    try {
        const profiles = storage.load(STORAGE_KEY) || [];
        const profile = profiles.find(p => p.id === profileId);
        
        if (profile) {
            // Populate form with profile data
            const form = document.getElementById('pet-profile-form');
            form.querySelector('[name="name"]').value = profile.name;
            form.querySelector('[name="breed"]').value = profile.breed;
            form.querySelector('[name="age"]').value = profile.age;
            form.querySelector('[name="weight"]').value = profile.weight;
            form.querySelector('[name="medical-history"]').value = profile.medicalHistory;
            form.querySelector('[name="vaccinations"]').value = profile.vaccinations;
            form.querySelector('[name="notes"]').value = profile.notes;
            
            if (profile.photo) {
                const preview = document.getElementById('photo-preview');
                preview.src = profile.photo;
                preview.classList.remove('hidden');
            }
            
            // Update form submit handler
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Profile';
            form.dataset.editId = profileId;
            
            // Scroll form into view
            form.scrollIntoView({ behavior: 'smooth' });
            
            // Update form submit handler
            form.onsubmit = (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const photoInput = document.getElementById('pet-photo');
                
                const updatedProfile = {
                    ...profile,
                    name: formData.get('name').trim(),
                    breed: formData.get('breed').trim(),
                    age: formData.get('age').trim(),
                    weight: formData.get('weight').trim(),
                    medicalHistory: formData.get('medical-history').trim(),
                    vaccinations: formData.get('vaccinations').trim(),
                    notes: formData.get('notes').trim(),
                    updatedAt: new Date().toISOString()
                };

                if (photoInput.files[0]) {
                    const reader = new FileReader();
                    reader.readAsDataURL(photoInput.files[0]);
                    reader.onload = (e) => {
                        updatedProfile.photo = e.target.result;
                        saveUpdatedProfile(profiles, updatedProfile);
                    };
                } else {
                    saveUpdatedProfile(profiles, updatedProfile);
                }
            };
        }
    } catch (error) {
        showNotification('Error editing pet profile', 'error');
    }
}

function saveUpdatedProfile(profiles, updatedProfile) {
    const profileIndex = profiles.findIndex(p => p.id === updatedProfile.id);
    profiles[profileIndex] = updatedProfile;
    
    if (storage.save(STORAGE_KEY, profiles)) {
        showNotification('Pet profile updated successfully');
        const form = document.getElementById('pet-profile-form');
        form.reset();
        form.querySelector('button[type="submit"]').textContent = 'Add Profile';
        delete form.dataset.editId;
        form.onsubmit = handleAddProfile;
        document.getElementById('photo-preview').classList.add('hidden');
        loadProfiles();
    } else {
        throw new Error('Failed to update pet profile');
    }
}

function handleDeleteProfile(profileId) {
    if (confirm('Are you sure you want to delete this pet profile?')) {
        try {
            const profiles = storage.load(STORAGE_KEY) || [];
            const updatedProfiles = profiles.filter(p => p.id !== profileId);
            
            if (storage.save(STORAGE_KEY, updatedProfiles)) {
                showNotification('Pet profile deleted successfully');
                loadProfiles();
            }
        } catch (error) {
            showNotification('Error deleting pet profile', 'error');
        }
    }
}