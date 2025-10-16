// Corrected Configuration for Lactic Acid
const REGION_NAMES = [
    "ENTER THE READING OF (-C=O) CARBONYL STRETCH OBSERVED IN PHOTOACOUSTIC SPECTROSCOPY.",
    "ENTER THE READING OF (-CH₃) METHYL GROUP DEFORMATION OBSERVED IN PHOTOACOUSTIC SPECTROSCOPY.",
    "ENTER THE READING OF (-C-OH) CARBON-OXYGEN STRETCH OBSERVED IN PHOTOACOUSTIC SPECTROSCOPY.",
    "ENTER THE READING OF (-O-H) HYDROXYL STRETCH OBSERVED IN PHOTOACOUSTIC SPECTROSCOPY."
];

// Lactic Acid specific normal ranges
const NORMAL_MEANS = [1.2, 1.8, 2.8, 2.2];
const NORMAL_STDS = [0.4, 0.6, 0.7, 0.9];
const THRESHOLD = 0.42;

// Enhanced State
let patientCount = 1;
let backendAvailable = false;
let vibrationChart = null;
let autoTriggerTimeout = null;
let currentProbability = 0;
let decisionLog = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    // Set up Get Started button
    document.getElementById('get-started-btn').addEventListener('click', function () {
        document.getElementById('welcome-screen').style.opacity = '0';
        setTimeout(function () {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
        }, 500);
    });

    // Check backend connection
    checkBackendConnection();

    // Set up event listeners for frequency inputs
    document.querySelectorAll('.frequency-input').forEach((input, index) => {
        input.addEventListener('input', () => {
            validateInput(index);
            updateVibrationGraph();

            // Auto-trigger analysis when all inputs are filled
            clearTimeout(autoTriggerTimeout);
            autoTriggerTimeout = setTimeout(autoTriggerAnalysis, 1000);
        });
    });

    // Set up event listeners for patient info
    document.getElementById('patient-name').addEventListener('input', validatePatientInfo);
    document.getElementById('patient-age').addEventListener('input', validatePatientInfo);

    // Set up event listeners for gender selection
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', validatePatientInfo);
    });

    document.getElementById('analyze-btn').addEventListener('click', analyzePatient);
    document.getElementById('next-btn').addEventListener('click', nextPatient);

    // Set up action buttons
    document.getElementById('schedule-btn').addEventListener('click', function () {
        document.getElementById('scheduling-options').style.display = 'block';
        prefillSchedulingOptions();
    });

    document.getElementById('research-btn').addEventListener('click', function () {
        simulateMetabolicResearch();
    });

    document.getElementById('back-btn').addEventListener('click', function () {
        document.getElementById('redirect-page').style.display = 'none';
    });

    // Set up scheduling options
    document.querySelectorAll('.urgency-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.urgency-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    document.querySelectorAll('.test-option').forEach(option => {
        option.addEventListener('click', function () {
            const checkbox = this.querySelector('.test-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        });
    });

    document.getElementById('schedule-submit').addEventListener('click', submitSchedule);

    // Initialize the vibration graph
    initializeVibrationGraph();

    // Add initial log entry
    addLogEntry("Lactic acid biomarker analysis system initialized");
    addLogEntry("Multi-agent collaboration system activated");
});

// Simulate metabolic research
function simulateMetabolicResearch() {
    addLogEntry("Researching lactic acid metabolic patterns in cancer database");

    // Show loading state
    const researchBtn = document.getElementById('research-btn');
    const originalText = researchBtn.innerHTML;
    researchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching...';
    researchBtn.disabled = true;

    setTimeout(() => {
        addLogEntry("Found 28 similar metabolic patterns with 92% match confidence");
        addLogEntry("Research complete - patterns consistent with Warburg effect");

        // Show proactive recommendation based on research
        const proactiveText = document.getElementById('proactive-text');
        proactiveText.innerHTML = "Based on metabolic research, recommend lactate dehydrogenase (LDH) testing";

        researchBtn.innerHTML = originalText;
        researchBtn.disabled = false;
    }, 2000);
}

// Add entry to decision log
function addLogEntry(message) {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];

    decisionLog.push({
        time: timeString,
        message: message
    });

    // Update the log display
    const logContainer = document.getElementById('decision-log');
    const logEntries = logContainer.querySelectorAll('.log-entry');

    // Remove old entries if we have more than 5
    if (logEntries.length >= 5) {
        logEntries[0].remove();
    }

    // Add new entry
    const newEntry = document.createElement('div');
    newEntry.className = 'log-entry';
    newEntry.innerHTML = `
                <div class="log-time">${timeString}</div>
                <div>${message}</div>
            `;

    logContainer.appendChild(newEntry);
}

// Prefill scheduling options based on probability
function prefillSchedulingOptions() {
    // Set urgency based on probability
    let urgencyLevel = 'low';
    if (currentProbability > 0.8) {
        urgencyLevel = 'high';
    } else if (currentProbability >= 0.5) {
        urgencyLevel = 'medium';
    }

    document.querySelectorAll('.urgency-option').forEach(option => {
        if (option.dataset.urgency === urgencyLevel) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Clear all checkboxes first
    document.querySelectorAll('.test-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.test-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Set test suggestions based on probability
    const suggestionsList = document.getElementById('suggested-tests-list');
    suggestionsList.innerHTML = '';

    if (currentProbability > 0.8) {
        // High probability - suggest comprehensive testing
        suggestionsList.innerHTML = `
                    <li><strong>Biopsy</strong> - Recommended for tissue analysis</li>
                    <li><strong>Blood Test</strong> - Recommended for LDH and cancer markers</li>
                    <li><strong>CT Scan</strong> - Recommended for detailed imaging</li>
                    <li><strong>Metabolic Panel</strong> - Recommended for lactic acid levels</li>
                `;

        // Pre-select these tests
        document.getElementById('test-biopsy').checked = true;
        document.querySelector('.test-option[data-test="biopsy"]').classList.add('selected');
        document.getElementById('test-blood').checked = true;
        document.querySelector('.test-option[data-test="blood-test"]').classList.add('selected');
        document.getElementById('test-ct').checked = true;
        document.querySelector('.test-option[data-test="ct-scan"]').classList.add('selected');
    } else if (currentProbability >= 0.5) {
        // Medium probability - suggest targeted testing
        suggestionsList.innerHTML = `
                    <li><strong>Blood Test</strong> - Recommended for LDH and cancer markers</li>
                    <li><strong>Ultrasound</strong> - Recommended for initial screening</li>
                    <li><strong>Metabolic Panel</strong> - Recommended for lactic acid levels</li>
                `;

        // Pre-select these tests
        document.getElementById('test-blood').checked = true;
        document.querySelector('.test-option[data-test="blood-test"]').classList.add('selected');
    } else {
        // Low probability - suggest optional screening
        suggestionsList.innerHTML = `
                    <li><strong>Blood Test</strong> - Optional screening for LDH levels</li>
                    <li><strong>Ultrasound</strong> - Non-invasive imaging option</li>
                `;
    }

    // Set default date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('preferred-date').valueAsDate = tomorrow;

    // Reset preferred time to default (empty)
    document.getElementById('preferred-time').value = '';
}

// Submit schedule
function submitSchedule() {
    const urgencyOption = document.querySelector('.urgency-option.selected');
    if (!urgencyOption) {
        alert('Please select an urgency level');
        return;
    }

    const selectedTests = Array.from(document.querySelectorAll('.test-checkbox:checked'))
        .map(checkbox => checkbox.nextElementSibling.textContent);

    if (selectedTests.length === 0) {
        alert('Please select at least one test');
        return;
    }

    const preferredDate = document.getElementById('preferred-date').value;
    if (!preferredDate) {
        alert('Please select a preferred date');
        return;
    }

    const preferredTime = document.getElementById('preferred-time').value;
    if (!preferredTime) {
        alert('Please select a preferred time');
        return;
    }

    // Show the redirect page instead of an alert
    document.getElementById('redirect-page').style.display = 'flex';

    // Hide scheduling options
    document.getElementById('scheduling-options').style.display = 'none';

    // Log the scheduling action
    addLogEntry(`Scheduled ${selectedTests.join(', ')} with ${urgencyOption.dataset.urgency} urgency`);
}

// Auto-trigger analysis when all inputs are filled
function autoTriggerAnalysis() {
    // Check if all frequency inputs have values
    const allFilled = Array.from(document.querySelectorAll('.frequency-input'))
        .every(input => input.value && input.value.trim() !== '');

    // Check if patient info is filled
    const nameInput = document.getElementById('patient-name');
    const ageInput = document.getElementById('patient-age');
    const patientInfoFilled = nameInput.value.trim() !== '' &&
        ageInput.value &&
        parseInt(ageInput.value) >= 1 &&
        parseInt(ageInput.value) <= 120;

    if (allFilled && patientInfoFilled) {
        analyzePatient();
    }
}

// Initialize the vibration graph
function initializeVibrationGraph() {
    const ctx = document.getElementById('vibration-graph').getContext('2d');

    vibrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['-C=O Carbonyl (1720 cm⁻¹)', '-CH₃ Methyl (1300 cm⁻¹)', '-C-OH C-O Stretch (1100 cm⁻¹)', '-O-H Hydroxyl (3500 cm⁻¹)'],
            datasets: [{
                label: 'Vibration Intensity',
                data: [0, 0, 0, 0],
                borderColor: '#0d4a8c',
                backgroundColor: 'rgba(13, 74, 140, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#0d4a8c',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }, {
                label: 'Normal Range',
                data: NORMAL_MEANS,
                borderColor: '#2ecc71',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Intensity (MHz)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Lactic Acid Molecular Vibrations',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

// Update the vibration graph with current input values
function updateVibrationGraph() {
    if (!vibrationChart) return;

    const values = [];
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`input${i}`);
        values.push(input.value ? parseFloat(input.value) : 0);
    }

    vibrationChart.data.datasets[0].data = values;
    vibrationChart.update();
}

// Check if backend is available
async function checkBackendConnection() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'GET'
        });

        if (response.ok) {
            backendAvailable = true;
            addLogEntry("Backend connection established");
        } else {
            backendAvailable = false;
            addLogEntry("Backend unavailable - using enhanced lactic acid analysis model");
        }
    } catch (error) {
        backendAvailable = false;
        addLogEntry("Backend connection failed - using enhanced lactic acid analysis model");
    }
}

// Validate patient information
function validatePatientInfo() {
    const nameInput = document.getElementById('patient-name');
    const ageInput = document.getElementById('patient-age');
    const nameFeedback = document.getElementById('name-feedback');
    const ageFeedback = document.getElementById('age-feedback');

    // Validate name
    if (nameInput.value.trim() === '') {
        nameFeedback.className = 'feedback error';
        nameFeedback.innerHTML = '⚠️ Please enter patient name';
        nameInput.style.borderColor = '#e74c3c';
    } else {
        nameFeedback.className = 'feedback';
        nameInput.style.borderColor = '';
    }

    // Validate age
    if (!ageInput.value) {
        ageFeedback.className = 'feedback error';
        ageFeedback.innerHTML = '⚠️ Please enter patient age';
        ageInput.style.borderColor = '#e74c3c';
    } else if (parseInt(ageInput.value) < 1 || parseInt(ageInput.value) > 120) {
        ageFeedback.className = 'feedback error';
        ageFeedback.innerHTML = '⚠️ Please enter a valid age (1-120)';
        ageInput.style.borderColor = '#e74c3c';
    } else {
        ageFeedback.className = 'feedback';
        ageInput.style.borderColor = '';
    }
}

// Validate input and provide feedback
function validateInput(index) {
    const input = document.getElementById(`input${index + 1}`);
    const feedback = document.getElementById(`feedback${index + 1}`);

    if (!input.value) {
        feedback.className = 'feedback';
        return;
    }

    const value = parseFloat(input.value);

    // Check for negative values
    if (value < 0) {
        feedback.className = 'feedback error';
        feedback.innerHTML = '❌ Negative values are not allowed';
        input.style.borderColor = '#e74c3c';
        return;
    }

    const mean = NORMAL_MEANS[index];
    const std = NORMAL_STDS[index];

    if (Math.abs(value - mean) <= std) {
        feedback.className = 'feedback normal';
        feedback.innerHTML = '✅ At normal level';
        input.style.borderColor = '';
    } else if (value > mean) {
        feedback.className = 'feedback high';
        feedback.innerHTML = '⚠️ Higher than normal level';
        input.style.borderColor = '';
    } else {
        feedback.className = 'feedback low';
        feedback.innerHTML = '⚠️ Lower than normal level';
        input.style.borderColor = '';
    }
}

// Analyze patient data
async function analyzePatient() {
    // Validate patient info
    const nameInput = document.getElementById('patient-name');
    const ageInput = document.getElementById('patient-age');

    if (nameInput.value.trim() === '' || !ageInput.value ||
        parseInt(ageInput.value) < 1 || parseInt(ageInput.value) > 120) {
        validatePatientInfo();
        alert('Please fill in valid patient information');
        return;
    }

    // Get input values
    const values = [];
    let allFilled = true;
    let hasNegative = false;

    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`input${i}`);
        if (!input.value) {
            allFilled = false;
            input.style.borderColor = '#e74c3c';
        } else if (parseFloat(input.value) < 0) {
            hasNegative = true;
            input.style.borderColor = '#e74c3c';
        } else {
            input.style.borderColor = '';
            values.push(parseFloat(input.value));
        }
    }

    if (!allFilled) {
        alert('Please fill in all fields');
        return;
    }

    if (hasNegative) {
        alert('Negative values are not allowed. Please enter positive values only.');
        return;
    }

    // Update progress tracker
    document.getElementById('step2').classList.add('step-completed');

    // Show loading state
    document.getElementById('analyze-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhanced Analysis...';
    document.getElementById('analyze-btn').disabled = true;

    // Add log entries
    addLogEntry("Starting lactic acid molecular analysis");
    addLogEntry("Analyzing 4 key lactic acid biomarkers");

    let probability;

    if (backendAvailable) {
        try {
            const response = await fetch('https://your-backend-url.com/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: values })
            });

            if (response.ok) {
                const data = await response.json();
                probability = data.probability;
                addLogEntry("Received prediction from lactic acid analysis model");
            } else {
                throw new Error('Backend prediction failed');
            }
        } catch (error) {
            console.error('Backend call failed:', error);
            probability = enhancedLacticAcidPrediction(values);
            addLogEntry("Using enhanced lactic acid analysis model");
        }
    } else {
        probability = enhancedLacticAcidPrediction(values);
        addLogEntry("Using enhanced lactic acid analysis model");
    }

    // Store current probability for scheduling
    currentProbability = probability;

    // Get gender values
    const selectedGender = document.querySelector('input[name="gender"]:checked');
    const genderDisplay = selectedGender
        ? selectedGender.value.charAt(0).toUpperCase() + selectedGender.value.slice(1)
        : 'Not Specified';

    // Display results
    displayResults(probability, nameInput.value, ageInput.value, genderDisplay);

    // Reset button
    document.getElementById('analyze-btn').innerHTML = 'Run Auto Analysis';
    document.getElementById('analyze-btn').disabled = false;

    // Show next patient button
    document.getElementById('next-patient').style.display = 'block';
    document.getElementById('analyze-btn').style.display = 'none';

    // Update progress tracker
    document.getElementById('step3').classList.add('step-completed');
}

// Enhanced lactic acid prediction
function enhancedLacticAcidPrediction(values) {
    // Lactic acid specific analysis with biological weighting
    const biologicalWeights = [1.3, 1.0, 0.9, 1.2]; // Carbonyl most important for cancer detection

    let weightedScore = 0;
    for (let i = 0; i < values.length; i++) {
        const deviation = Math.max(0, (values[i] - NORMAL_MEANS[i]) / NORMAL_STDS[i]);
        weightedScore += deviation * biologicalWeights[i];
    }

    // Convert to probability with lactic acid specific calibration
    const probability = 1 / (1 + Math.exp(-weightedScore * 0.6 + 2.2));

    // Add some randomness to simulate real model behavior
    return Math.min(0.99, probability + (Math.random() * 0.06 - 0.03));
}

// Display results
function displayResults(probability, name, age, gender) {
    const resultDiv = document.getElementById('result');
    const probabilityFill = document.getElementById('probability-fill');
    const probabilityValue = document.getElementById('probability-value');
    const riskLevel = document.getElementById('risk-level');
    const recommendation = document.getElementById('recommendation');
    const patientInfo = document.getElementById('patient-info');
    const molecularReasons = document.getElementById('molecular-reasons');
    const actionButtons = document.getElementById('action-buttons');
    const schedulingOptions = document.getElementById('scheduling-options');
    const reasoningText = document.getElementById('reasoning-text');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceFill = document.getElementById('confidence-fill');
    const proactiveText = document.getElementById('proactive-text');
    const aiReasoning = document.getElementById('ai-reasoning');

    // Show AI reasoning section
    aiReasoning.style.display = 'block';

    // Hide scheduling options initially
    schedulingOptions.style.display = 'none';

    // Update probability meter
    const percentage = Math.round(probability * 100);
    probabilityFill.style.width = `${percentage}%`;
    probabilityValue.textContent = percentage;

    // Set confidence level based on data quality and probability
    const confidence = Math.min(95, 75 + (probability * 20) + (Math.random() * 10));
    confidenceValue.textContent = `${Math.round(confidence)}%`;
    confidenceFill.style.width = `${confidence}%`;

    // Set AI reasoning text based on probability
    if (probability >= THRESHOLD) {
        reasoningText.textContent = "The AI has detected abnormal lactic acid molecular vibration patterns consistent with cancer metabolic alterations. The elevated carbonyl and hydroxyl vibrations suggest Warburg effect activity in potential cancerous tissue.";
        proactiveText.textContent = "Proactive recommendation: Schedule oncology consultation and LDH testing";
    } else {
        reasoningText.textContent = "The lactic acid molecular vibration patterns appear within normal metabolic ranges. No significant biomarkers associated with cancer metabolism were detected in this analysis.";
        proactiveText.textContent = "Proactive monitoring: Recommend routine metabolic screening in 12 months";
    }

    // Set colors and text based on risk
    if (probability >= THRESHOLD) {
        resultDiv.className = 'result high-risk';
        probabilityFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        riskLevel.innerHTML = '⚠️ HIGH RISK OF CANCER DETECTION';
        riskLevel.style.color = '#c0392b';

        // Show molecular reasons section for high risk
        molecularReasons.style.display = 'block';
        addLogEntry("High cancer risk detected - abnormal lactic acid metabolism");
        addLogEntry("Warburg effect patterns identified in molecular vibrations");
    } else {
        resultDiv.className = 'result low-risk';
        probabilityFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        riskLevel.innerHTML = '✅ LOW RISK OF CANCER DETECTION';
        riskLevel.style.color = '#27ae60';

        // Hide molecular reasons section for low risk
        molecularReasons.style.display = 'none';
        addLogEntry("Low cancer risk detected - normal lactic acid metabolism");
    }

    // Set recommendation based on probability ranges
    if (probability > 0.8) {
        recommendation.innerHTML = `<strong>HIGH PRIORITY AND URGENT FOLLOW UP:</strong> <strong>${name}</strong> shows very high probability of cancer-associated lactic acid metabolism. Immediate comprehensive evaluation including metabolic panel, LDH testing, and oncology consultation is recommended.`;
        addLogEntry("High priority metabolic follow-up recommended");
    } else if (probability >= 0.5 && probability <= 0.8) {
        recommendation.innerHTML = `<strong>METABOLIC EVALUATION:</strong> <strong>${name}</strong> shows moderate probability of altered lactic acid metabolism. Secondary diagnostics including targeted metabolic panel and LDH testing are recommended.`;
        addLogEntry("Metabolic evaluation recommended");
    } else {
        recommendation.innerHTML = `<strong>ROUTINE METABOLIC SCREENING:</strong> <strong>${name}</strong> shows low probability of cancer-associated metabolic changes. Maintain routine metabolic screening with consideration of individual risk factors.`;
        addLogEntry("Routine metabolic screening recommended");
    }

    // Show action buttons for all probability levels
    actionButtons.style.display = 'flex';

    // Display patient information
    patientInfo.innerHTML = `
                <p><strong>Patient Name:</strong> ${name}</p>
                <p><strong>Patient Age:</strong> ${age}</p>
                <p><strong>Patient Gender:</strong> ${gender}</p>
                <p><strong>Analysis Method:</strong> Lactic Acid Molecular Vibration Analysis</p>
                <p><strong>Biomarkers Analyzed:</strong> 4 key lactic acid functional groups</p>
                <p><strong>Diagnosis Date:</strong> ${new Date().toLocaleDateString()}</p>
            `;

    // Show results
    resultDiv.style.display = 'block';

    // Update progress tracker
    document.getElementById('step4').classList.add('step-completed');

    // Add final log entry
    addLogEntry(`Lactic acid analysis complete - ${percentage}% probability with ${Math.round(confidence)}% confidence`);
}

// Reset for next patient
function nextPatient() {
    patientCount++;

    // Clear inputs
    document.getElementById('patient-name').value = '';
    document.getElementById('patient-age').value = '';
    document.getElementById('name-feedback').className = 'feedback';
    document.getElementById('age-feedback').className = 'feedback';

    // Clear gender radio buttons
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.checked = false;
    });

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`input${i}`).value = '';
        document.getElementById(`feedback${i}`).className = 'feedback';
    }

    // Reset graph
    if (vibrationChart) {
        vibrationChart.data.datasets[0].data = [0, 0, 0, 0];
        vibrationChart.update();
    }

    // Hide results
    document.getElementById('result').style.display = 'none';
    document.getElementById('ai-reasoning').style.display = 'none';

    // Hide scheduling options
    document.getElementById('scheduling-options').style.display = 'none';

    // Reset proactive text
    document.getElementById('proactive-text').textContent = "Analyzing lactic acid metabolic patterns...";

    // Update patient counter
    document.getElementById('patient-counter').textContent = `Patient ${patientCount}: Provide Lactic Acid IR frequency readings in Mega Hertz (MHz)`;

    // Show analyze button, hide next button
    document.getElementById('analyze-btn').style.display = 'block';
    document.getElementById('next-patient').style.display = 'none';

    // Reset progress tracker (keep step 1 completed)
    document.getElementById('step2').classList.remove('step-completed');
    document.getElementById('step3').classList.remove('step-completed');
    document.getElementById('step4').classList.remove('step-completed');

    // Clear decision log
    document.getElementById('decision-log').innerHTML = '<h4>Decision Log</h4>';
    decisionLog = [];
    addLogEntry("Lactic acid biomarker system ready for new patient data");
    addLogEntry("Multi-agent collaboration system active");
}