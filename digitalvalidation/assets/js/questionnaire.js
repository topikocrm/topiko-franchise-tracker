// Digital Validation - One Question at a Time Flow
let currentQuestion = 0;
let answers = {};
let userProfile = {};

// Question definitions
const questions = [
    // Step 1: Basic Info
    {
        id: 'userName',
        step: 1,
        type: 'text',
        question: "What's your name?",
        placeholder: 'Enter your full name',
        required: true,
        chat: "👋 Hi! I'm your <span class='topiko-text'>digital consultant</span>. Let's discover the perfect solution for your business. What's your name?"
    },
    {
        id: 'businessName', 
        step: 1,
        type: 'text',
        question: "What's your business name?",
        placeholder: 'Enter your business name',
        required: true,
        chat: (name) => `Nice to meet you, ${name}! What's your business called?`
    },
    {
        id: 'businessType',
        step: 1,
        type: 'options',
        question: "What type of business do you run?",
        required: true,
        options: [
            { value: 'retail', label: 'Retail/E-commerce', icon: '🛍️' },
            { value: 'services', label: 'Professional Services', icon: '💼' },
            { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
            { value: 'food', label: 'Restaurant/Food', icon: '🍽️' }
        ],
        chat: (name, business) => `${business} - great name! What industry are you in?`
    },
    {
        id: 'location',
        step: 1,
        type: 'text',
        question: "Where are you located?",
        placeholder: 'City, State',
        required: true,
        chat: () => `Perfect! Where is your business located?`
    },
    
    // Step 2: Current State
    {
        id: 'digitalStatus',
        step: 2,
        type: 'options',
        question: "What's your current digital presence?",
        required: true,
        options: [
            { value: 'no_presence', label: 'No presence at all', sublabel: 'Starting from scratch', icon: '🌱' },
            { value: 'whatsapp', label: 'Only WhatsApp Business', sublabel: 'Basic communication', icon: '💬' },
            { value: 'basic_website', label: 'Basic website', sublabel: 'Simple online presence', icon: '🌐' },
            { value: 'social_only', label: 'Social media only', sublabel: 'Facebook/Instagram', icon: '📱' },
            { value: 'full_website_no_results', label: 'Full website but no results', sublabel: 'Not generating leads', icon: '📉' }
        ],
        chat: () => `Great! Now let's see where you stand digitally. Be honest - no judgment here! 😊`
    },
    {
        id: 'managedBy',
        step: 2,
        type: 'options',
        question: "Who manages your digital presence?",
        required: true,
        options: [
            { value: 'nobody', label: 'Nobody' },
            { value: 'myself', label: 'Myself' },
            { value: 'family', label: 'Family member' },
            { value: 'employee', label: 'Employee' },
            { value: 'agency', label: 'Agency/Freelancer' }
        ],
        chat: () => `Who currently handles your digital marketing and online presence?`
    },
    {
        id: 'budget',
        step: 2,
        type: 'options',
        question: "Current monthly digital spend?",
        required: true,
        options: [
            { value: 'nothing', label: 'Nothing', icon: '💰' },
            { value: 'below_2k', label: 'Below ₹2,000', icon: '💳' },
            { value: '2k_10k', label: '₹2,000 - ₹10,000', icon: '💎' },
            { value: '10k_25k', label: '₹10,000 - ₹25,000', icon: '🏆' },
            { value: '25k_plus', label: '₹25,000+', icon: '🚀' }
        ],
        chat: () => `What's your current monthly investment in digital marketing and tools?`
    },
    
    // Step 3: Goals
    {
        id: 'goals',
        step: 3,
        type: 'checkbox',
        question: "What are your primary goals?",
        required: true,
        options: [
            { value: 'more_customers', label: 'Get more customers' },
            { value: 'brand_recognition', label: 'Build brand recognition' },
            { value: 'showcase_products', label: 'Showcase products/services' },
            { value: 'online_payments', label: 'Accept online payments' },
            { value: 'customer_management', label: 'Manage customers better' },
            { value: 'reduce_manual_work', label: 'Reduce manual work' }
        ],
        chat: () => `Now the exciting part - what do you want to achieve? Dream big! 🚀 (Select all that apply)`
    },
    {
        id: 'challenge',
        step: 3,
        type: 'options',
        question: "What's your biggest challenge?",
        required: true,
        options: [
            { value: 'no_leads', label: 'No enquiries/leads', icon: '📢' },
            { value: 'too_many_platforms', label: 'Too many platforms', icon: '🤯' },
            { value: 'dont_know', label: "Don't know what works", icon: '❓' },
            { value: 'competitors_ahead', label: 'Competitors are ahead', icon: '🏃' },
            { value: 'no_time', label: 'No time to learn', icon: '⏰' }
        ],
        chat: () => `What's the biggest obstacle you're facing right now?`
    },
    {
        id: 'timeline',
        step: 3,
        type: 'options',
        question: "How soon do you need results?",
        required: true,
        options: [
            { value: 'immediately', label: 'Immediately' },
            { value: '1_3_months', label: '1-3 months' },
            { value: '3_6_months', label: '3-6 months' },
            { value: 'exploring', label: 'Just exploring' }
        ],
        chat: () => `When do you need to see results from your digital transformation?`
    },
    
    // Step 4: Technical Details
    {
        id: 'productCount',
        step: 4,
        type: 'options',
        question: "How many products/services do you offer?",
        required: true,
        options: [
            { value: 'less_10', label: '< 10 items' },
            { value: '10_50', label: '10-50 items' },
            { value: '50_200', label: '50-200 items' },
            { value: '200_plus', label: '200+ items' }
        ],
        chat: () => `Let's talk about your business scale. How many products or services do you offer?`
    },
    {
        id: 'teamSize',
        step: 4,
        type: 'options',
        question: "Team size who'll use this?",
        required: true,
        options: [
            { value: 'just_me', label: 'Just me' },
            { value: '2_5', label: '2-5 people' },
            { value: '5_10', label: '5-10 people' },
            { value: '10_plus', label: '10+ people' }
        ],
        chat: () => `How many people in your team will be using the digital tools?`
    },
    
    // Step 5: Contact
    {
        id: 'phone',
        step: 5,
        type: 'text',
        question: "What's your mobile number?",
        placeholder: '10-digit mobile number',
        required: true,
        pattern: '^[0-9]{10}$',
        chat: () => `Almost done! I'll need your contact details to share your personalized recommendation.`
    },
    {
        id: 'email',
        step: 5,
        type: 'text',
        question: "What's your email address?",
        placeholder: 'your@email.com (optional)',
        required: false,
        chat: () => `And your email address? (This is optional, but helps us send you a detailed report)`
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion(0);
    initializeSupabase();
});

// Initialize Supabase
let supabase;
function initializeSupabase() {
    try {
        supabase = window.supabase.createClient(
            'https://uyaubwfmxmxelcshuyaf.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YXVid2ZteG14ZWxjc2h1eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDA0MTksImV4cCI6MjA2OTUxNjQxOX0.Sc9qUUXr73x8yw5-2rs-pcI03lFpMTSyuhW9RDLcOLI'
        );
    } catch (error) {
        console.warn('Supabase initialization failed:', error);
    }
}

// Load a specific question
function loadQuestion(index) {
    if (index >= questions.length) {
        showResults();
        return;
    }
    
    currentQuestion = index;
    const q = questions[index];
    const contentDiv = document.getElementById('questionContent');
    const chatDiv = document.getElementById('chatMessage');
    
    // Update chat message
    if (typeof q.chat === 'function') {
        const firstName = userProfile.userName ? userProfile.userName.split(' ')[0] : '';
        chatDiv.textContent = q.chat(firstName, userProfile.businessName);
    } else {
        chatDiv.textContent = q.chat;
    }
    
    // Fade effect for chat
    chatDiv.style.opacity = '0';
    setTimeout(() => {
        chatDiv.style.opacity = '1';
    }, 100);
    
    // Generate question HTML
    let html = `<h3>${q.question}${q.required ? ' *' : ''}</h3>`;
    
    switch(q.type) {
        case 'text':
            html += `
                <input type="text" 
                    id="${q.id}" 
                    class="form-input" 
                    placeholder="${q.placeholder}"
                    ${q.pattern ? `pattern="${q.pattern}"` : ''}
                    value="${answers[q.id] || ''}"
                    onkeyup="handleTextInput('${q.id}')"
                    onkeypress="if(event.key==='Enter' && !document.getElementById('nextBtn').disabled) nextQuestion()">
            `;
            break;
            
        case 'options':
            html += '<div class="option-list">';
            q.options.forEach(opt => {
                const selected = answers[q.id] === opt.value ? 'selected' : '';
                html += `
                    <div class="option-card ${selected}" onclick="selectOption('${q.id}', '${opt.value}')">
                        ${opt.icon ? `<span class="option-icon">${opt.icon}</span>` : ''}
                        <div class="option-content">
                            <strong>${opt.label}</strong>
                            ${opt.sublabel ? `<small>${opt.sublabel}</small>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            break;
            
        case 'checkbox':
            html += '<div class="checkbox-list">';
            const selectedValues = answers[q.id] || [];
            q.options.forEach(opt => {
                const checked = selectedValues.includes(opt.value) ? 'checked' : '';
                html += `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${opt.value}" ${checked} 
                            onchange="handleCheckbox('${q.id}', this)">
                        <span class="checkbox-custom"></span>
                        <span>${opt.label}</span>
                    </label>
                `;
            });
            html += '</div>';
            break;
    }
    
    // Update content with fade effect
    contentDiv.style.opacity = '0';
    setTimeout(() => {
        contentDiv.innerHTML = html;
        contentDiv.style.opacity = '1';
        
        // Focus text input if present
        if (q.type === 'text') {
            document.getElementById(q.id)?.focus();
        }
    }, 200);
    
    // Update progress
    updateProgress();
    
    // Update buttons
    document.getElementById('backBtn').style.display = index > 0 ? 'inline-block' : 'none';
    validateCurrentQuestion();
}

// Handle text input
function handleTextInput(id) {
    const input = document.getElementById(id);
    answers[id] = input.value.trim();
    
    // Update profile if it's user info
    if (id === 'userName') userProfile.userName = answers[id];
    if (id === 'businessName') userProfile.businessName = answers[id];
    if (id === 'location') userProfile.location = answers[id];
    if (id === 'phone') userProfile.phone = answers[id];
    if (id === 'email') userProfile.email = answers[id];
    
    updateProfilePanel();
    validateCurrentQuestion();
}

// Select an option
function selectOption(questionId, value) {
    answers[questionId] = value;
    
    // Update UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update profile
    if (questionId === 'businessType') userProfile.businessType = value;
    
    updateProfilePanel();
    validateCurrentQuestion();
    
    // Auto-advance after selection
    setTimeout(() => {
        if (document.getElementById('nextBtn').disabled === false) {
            nextQuestion();
        }
    }, 300);
}

// Handle checkbox
function handleCheckbox(questionId, checkbox) {
    if (!answers[questionId]) answers[questionId] = [];
    
    if (checkbox.checked) {
        answers[questionId].push(checkbox.value);
    } else {
        answers[questionId] = answers[questionId].filter(v => v !== checkbox.value);
    }
    
    validateCurrentQuestion();
}

// Validate current question
function validateCurrentQuestion() {
    const q = questions[currentQuestion];
    const nextBtn = document.getElementById('nextBtn');
    let isValid = false;
    
    if (!q.required) {
        isValid = true;
    } else {
        switch(q.type) {
            case 'text':
                const value = answers[q.id] || '';
                isValid = value.length > 0;
                if (q.pattern) {
                    isValid = isValid && new RegExp(q.pattern).test(value);
                }
                break;
            case 'options':
                isValid = !!answers[q.id];
                break;
            case 'checkbox':
                isValid = answers[q.id] && answers[q.id].length > 0;
                break;
        }
    }
    
    nextBtn.disabled = !isValid;
}

// Navigate to next question
function nextQuestion() {
    // If last question, submit
    if (currentQuestion === questions.length - 1) {
        submitForm();
    } else {
        loadQuestion(currentQuestion + 1);
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestion > 0) {
        loadQuestion(currentQuestion - 1);
    }
}

// Update progress bar
function updateProgress() {
    const currentStep = questions[currentQuestion].step;
    const progress = (currentQuestion / questions.length) * 100;
    
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else if (index === currentStep - 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Update profile panel
function updateProfilePanel() {
    const avatar = document.getElementById('profileAvatar');
    const name = document.getElementById('profileName');
    const status = document.getElementById('profileStatus');
    const content = document.getElementById('profileContent');
    
    // Update avatar
    if (userProfile.userName) {
        avatar.textContent = userProfile.userName.charAt(0).toUpperCase();
    }
    
    // Update name
    if (userProfile.userName) {
        const firstName = userProfile.userName.split(' ')[0];
        const location = userProfile.location ? ` from ${userProfile.location.split(',')[0]}` : '';
        name.textContent = firstName + location;
    }
    
    // Update status
    const step = questions[currentQuestion].step;
    const statuses = {
        1: 'Getting basic info...',
        2: 'Understanding your needs...',
        3: 'Exploring your goals...',
        4: 'Finalizing details...',
        5: 'Almost done!'
    };
    status.textContent = statuses[step];
    
    // Build profile content
    let profileHTML = '';
    
    if (userProfile.businessName || userProfile.businessType) {
        profileHTML += `
            <div class="profile-section">
                <h4>📋 Business Info</h4>
                ${userProfile.businessName ? `<div class="profile-detail"><span class="label">Business:</span> <span class="value">${userProfile.businessName}</span></div>` : ''}
                ${userProfile.businessType ? `<div class="profile-detail"><span class="label">Type:</span> <span class="value">${getLabel('businessType', userProfile.businessType)}</span></div>` : ''}
                ${userProfile.location ? `<div class="profile-detail"><span class="label">Location:</span> <span class="value">${userProfile.location}</span></div>` : ''}
            </div>
        `;
    }
    
    if (answers.digitalStatus || answers.budget) {
        profileHTML += `
            <div class="profile-section">
                <h4>💻 Current State</h4>
                ${answers.digitalStatus ? `<div class="profile-detail"><span class="label">Digital:</span> <span class="value">${getLabel('digitalStatus', answers.digitalStatus)}</span></div>` : ''}
                ${answers.budget ? `<div class="profile-detail"><span class="label">Budget:</span> <span class="value">${getLabel('budget', answers.budget)}</span></div>` : ''}
            </div>
        `;
    }
    
    if (answers.goals && answers.goals.length > 0) {
        profileHTML += `
            <div class="profile-section">
                <h4>🎯 Goals</h4>
                <div class="tags-container">
                    ${answers.goals.map(g => `<span class="tag">${getLabel('goals', g)}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    if (profileHTML) {
        content.innerHTML = profileHTML;
    }
    
    // Update mobile profile components
    updateMobileProfile();
    
    // Show mobile float widget after name is entered (on mobile/tablet)
    if (userProfile.userName && window.innerWidth <= 1400) {
        showMobileFloat();
    }
}

// Mobile Profile Functions
function updateMobileProfile() {
    // Update all avatar elements
    const avatarElements = document.querySelectorAll('.profile-avatar, .float-avatar, .sheet-avatar');
    avatarElements.forEach(el => {
        if (userProfile.userName) {
            el.textContent = userProfile.userName.charAt(0).toUpperCase();
        }
    });
    
    // Update name displays
    const firstName = userProfile.userName ? userProfile.userName.split(' ')[0] : '';
    const desktopName = firstName + (userProfile.location ? ` from ${userProfile.location.split(',')[0]}` : '');
    const mobileName = firstName ? `Building profile for ${firstName}` : 'Building your profile...';
    
    // Update float widget
    const floatName = document.getElementById('float-name');
    const floatStatus = document.getElementById('float-status');
    if (floatName) floatName.textContent = mobileName;
    if (floatStatus) floatStatus.textContent = getProfileStatus();
    
    // Update sheet
    const sheetName = document.getElementById('sheet-name');
    const sheetStatus = document.getElementById('sheet-status');
    if (sheetName) sheetName.textContent = mobileName;
    if (sheetStatus) sheetStatus.textContent = getProfileStatus();
    
    // Update mobile profile content
    const mobileContent = document.getElementById('mobile-profile-content');
    if (mobileContent) {
        let mobileHTML = '';
        
        if (userProfile.businessName || userProfile.businessType) {
            mobileHTML += `
                <div class="profile-section">
                    <h4>📋 Business Info</h4>
                    ${userProfile.businessName ? `<div class="profile-detail"><span class="label">Business:</span> <span class="value">${userProfile.businessName}</span></div>` : ''}
                    ${userProfile.businessType ? `<div class="profile-detail"><span class="label">Type:</span> <span class="value">${getLabel('businessType', userProfile.businessType)}</span></div>` : ''}
                    ${userProfile.location ? `<div class="profile-detail"><span class="label">Location:</span> <span class="value">${userProfile.location}</span></div>` : ''}
                </div>
            `;
        }
        
        if (answers.digitalStatus || answers.budget) {
            mobileHTML += `
                <div class="profile-section">
                    <h4>💻 Current State</h4>
                    ${answers.digitalStatus ? `<div class="profile-detail"><span class="label">Digital:</span> <span class="value">${getLabel('digitalStatus', answers.digitalStatus)}</span></div>` : ''}
                    ${answers.budget ? `<div class="profile-detail"><span class="label">Budget:</span> <span class="value">${getLabel('budget', answers.budget)}</span></div>` : ''}
                </div>
            `;
        }
        
        if (answers.goals && answers.goals.length > 0) {
            mobileHTML += `
                <div class="profile-section">
                    <h4>🎯 Goals</h4>
                    <div class="tags-container">
                        ${answers.goals.map(g => `<span class="tag">${getLabel('goals', g)}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (mobileHTML) {
            mobileContent.innerHTML = mobileHTML;
        }
    }
}

function showMobileFloat() {
    const mobileFloat = document.getElementById('mobile-float');
    if (mobileFloat && window.innerWidth <= 1400) {
        mobileFloat.classList.add('show');
        
        // Add click handler to show bottom sheet
        mobileFloat.onclick = toggleMobileProfile;
    }
}

function toggleMobileProfile() {
    const mobileSheet = document.getElementById('mobile-sheet');
    if (mobileSheet) {
        if (!mobileSheet.style.display || mobileSheet.style.display === 'none') {
            mobileSheet.style.display = 'block';
            setTimeout(() => mobileSheet.classList.add('active'), 10);
        } else {
            mobileSheet.classList.remove('active');
            setTimeout(() => mobileSheet.style.display = 'none', 400);
        }
    }
}

function getProfileStatus() {
    const step = questions[currentQuestion].step;
    const statuses = {
        1: 'Getting basic info...',
        2: 'Understanding your needs...',
        3: 'Exploring your goals...',
        4: 'Finalizing details...',
        5: 'Almost done!'
    };
    return statuses[step] || 'Complete your profile';
}

// Get label for a value
function getLabel(type, value) {
    const labels = {
        businessType: {
            retail: 'Retail/E-commerce',
            services: 'Services',
            manufacturing: 'Manufacturing',
            food: 'Restaurant/Food'
        },
        digitalStatus: {
            no_presence: 'No presence',
            whatsapp: 'WhatsApp only',
            basic_website: 'Basic website',
            social_only: 'Social media only',
            full_website_no_results: 'Website (no results)'
        },
        budget: {
            nothing: 'No budget',
            below_2k: '< ₹2K/mo',
            '2k_10k': '₹2-10K/mo',
            '10k_25k': '₹10-25K/mo',
            '25k_plus': '₹25K+/mo'
        },
        goals: {
            more_customers: 'More Customers',
            brand_recognition: 'Brand Building',
            showcase_products: 'Showcase',
            online_payments: 'Payments',
            customer_management: 'CRM',
            reduce_manual_work: 'Automation'
        }
    };
    
    return labels[type]?.[value] || value;
}

// Submit form and show results
async function submitForm() {
    const btn = document.getElementById('nextBtn');
    btn.textContent = 'Generating recommendation...';
    btn.disabled = true;
    
    // Get recommendation
    const recommendation = getRecommendation(answers);
    
    // Save to Supabase
    if (supabase) {
        try {
            await supabase.from('digital_validation_leads').insert({
                ...userProfile,
                ...answers,
                recommendation: recommendation,
                submitted_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving lead:', error);
        }
    }
    
    // Show results
    setTimeout(() => {
        showResults(recommendation);
    }, 1000);
}

// Show results
function showResults(recommendation) {
    document.querySelector('.question-container').style.display = 'none';
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    
    // Generate results HTML (similar to before but cleaner)
    resultsContainer.innerHTML = generateResultsHTML(recommendation || getRecommendation(answers));
}

// Generate results HTML
function generateResultsHTML(recommendation) {
    // Use the same logic from before
    let html = `
        <div class="result-card">
            <h1>🎉 Your Personalized Solution</h1>
            <div class="user-summary">
                <p>Perfect match for <strong>${userProfile.businessName}</strong> in ${userProfile.location}!</p>
            </div>
    `;
    
    if (recommendation.primary) {
        html += `
            <div class="recommendation-section">
                <h2>Recommended: ${recommendation.primary.name}</h2>
                <p>${recommendation.primary.description}</p>
                <div class="price-box">
                    <div class="price-main">₹${recommendation.primary.price.toLocaleString()}/${recommendation.primary.period}</div>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="cta-section">
            <h2>Ready to Get Started?</h2>
            <button class="btn btn-primary btn-large" onclick="alert('Our team will contact you within 24 hours!')">
                Get Free Consultation
            </button>
        </div>
        </div>
    `;
    
    return html;
}