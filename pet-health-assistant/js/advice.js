import { showNotification } from './app.js';

// Pet health advice database
const ADVICE_DATABASE = {
    'vomiting': {
        symptoms: [
            'Loss of appetite',
            'Lethargy',
            'Dehydration',
            'Multiple episodes of vomiting'
        ],
        immediateActions: [
            'Withhold food for 12 hours but ensure access to water',
            'Monitor frequency of vomiting',
            'Check for dehydration signs (dry gums, lethargy)',
            'Look for blood in vomit or unusual colors'
        ],
        veterinaryCare: [
            'Vomiting persists for more than 24 hours',
            'Blood in vomit',
            'Severe lethargy or weakness',
            'Signs of dehydration',
            'Known ingestion of toxic substances or foreign objects'
        ]
    },
    'diarrhea': {
        symptoms: [
            'Loose or watery stools',
            'Increased frequency of bowel movements',
            'Urgency to defecate',
            'Possible stomach upset or pain'
        ],
        immediateActions: [
            'Ensure constant access to fresh water',
            'Temporarily switch to a bland diet (rice and boiled chicken)',
            'Monitor frequency and consistency',
            'Keep your pet clean and comfortable'
        ],
        veterinaryCare: [
            'Diarrhea persists for more than 48 hours',
            'Blood in stool',
            'Severe lethargy',
            'Signs of dehydration',
            'Fever or vomiting accompanies diarrhea'
        ]
    },
    'lethargy': {
        symptoms: [
            'Decreased energy levels',
            'Reluctance to play or exercise',
            'Sleeping more than usual',
            'Reduced interest in daily activities'
        ],
        immediateActions: [
            'Monitor food and water intake',
            'Check for other symptoms',
            'Ensure comfortable rest area',
            'Monitor body temperature if possible'
        ],
        veterinaryCare: [
            'Lethargy persists for more than 24 hours',
            'Accompanied by other symptoms',
            'Complete loss of appetite',
            'Difficulty breathing',
            'Unusual behavior changes'
        ]
    },
    'loss-of-appetite': {
        symptoms: [
            'Refusing food',
            'Eating less than usual',
            'Weight loss',
            'Possible changes in behavior'
        ],
        immediateActions: [
            'Offer different food options',
            'Check for dental issues',
            'Monitor water intake',
            'Keep track of when appetite changed'
        ],
        veterinaryCare: [
            'Not eating for more than 24 hours',
            'Rapid weight loss',
            'Accompanied by vomiting or diarrhea',
            'Signs of pain or distress',
            'Difficulty swallowing'
        ]
    },
    'excessive-thirst': {
        symptoms: [
            'Drinking more water than usual',
            'Frequent urination',
            'Possible accidents in the house',
            'Changes in urine color or smell'
        ],
        immediateActions: [
            'Ensure clean, fresh water is always available',
            'Monitor daily water intake if possible',
            'Watch for changes in urination',
            'Note any other behavioral changes'
        ],
        veterinaryCare: [
            'Sudden increase in thirst',
            'Accompanied by lethargy or appetite changes',
            'Changes in urination patterns',
            'Signs of dehydration despite drinking',
            'Other unusual symptoms'
        ]
    }
};

export function initAdvice() {
    const issueSelector = document.getElementById('issue-selector');
    const adviceContent = document.getElementById('advice-content');
    
    if (issueSelector && adviceContent) {
        issueSelector.addEventListener('change', () => {
            const selectedIssue = issueSelector.value;
            if (selectedIssue) {
                displayAdvice(selectedIssue);
            } else {
                adviceContent.classList.add('hidden');
            }
        });
    }
}

function displayAdvice(issue) {
    const adviceContent = document.getElementById('advice-content');
    const advice = ADVICE_DATABASE[issue];
    
    if (!advice) {
        showNotification('Advice not found for this issue', 'error');
        return;
    }

    const formattedIssue = issue.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    adviceContent.innerHTML = `
        <div class="space-y-6">
            <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    <i class="fas fa-exclamation-circle text-yellow-500"></i>
                    Common Symptoms of ${formattedIssue}
                </h3>
                <ul class="list-disc pl-5 space-y-1">
                    ${advice.symptoms.map(symptom => `
                        <li class="text-gray-700">${symptom}</li>
                    `).join('')}
                </ul>
            </div>

            <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    <i class="fas fa-first-aid text-blue-500"></i>
                    Immediate Actions
                </h3>
                <ul class="list-disc pl-5 space-y-1">
                    ${advice.immediateActions.map(action => `
                        <li class="text-gray-700">${action}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="bg-red-50 p-4 rounded-md">
                <h3 class="text-xl font-semibold text-red-800 mb-2">
                    <i class="fas fa-hospital text-red-600"></i>
                    Seek Veterinary Care If:
                </h3>
                <ul class="list-disc pl-5 space-y-1">
                    ${advice.veterinaryCare.map(condition => `
                        <li class="text-red-700">${condition}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="bg-gray-50 p-4 rounded-md mt-6">
                <p class="text-gray-600 text-sm">
                    <i class="fas fa-info-circle"></i>
                    <strong>Disclaimer:</strong> This advice is for informational purposes only and should not replace professional veterinary consultation. When in doubt, always consult with your veterinarian.
                </p>
            </div>
        </div>
    `;

    adviceContent.classList.remove('hidden');
}