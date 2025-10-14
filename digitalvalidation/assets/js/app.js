// Digital Validation - Main Application
let currentScreen = 1;
const totalScreens = 5;
let answers = {};
let userProfile = {};

// Initialize Supabase
let supabase;
try {
    supabase = window.supabase.createClient(
        'https://uyaubwfmxmxelcshuyaf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YXVid2ZteG14ZWxjc2h1eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDA0MTksImV4cCI6MjA2OTUxNjQxOX0.Sc9qUUXr73x8yw5-2rs-pcI03lFpMTSyuhW9RDLcOLI'
    );
} catch (error) {
    console.warn('Supabase initialization failed:', error);
}

// Conversational responses
const chatResponses = {
    userName: [
        "Nice to meet you, {name}! I'm excited to help you grow.",
        "Welcome {name}! Let's explore your digital potential.",
        "Hello {name}! Ready to transform your business?",
        "Great to have you here, {name}!"
    ],
    businessName: [
        "{business} - love the name! Tell me more...",
        "{business} sounds impressive! Let's unlock its potential.",
        "Great name! {business} is ready for digital success.",
        "{business} - I can already see the possibilities!"
    ],
    businessType: {
        retail: "Retail is booming online! Perfect timing.",
        services: "Service businesses see 3x growth with digital tools!",
        manufacturing: "B2B digitalization is the future!",
        food: "Food delivery apps changed everything, right?"
    },
    location: [
        "{city} has amazing business potential online!",
        "Great location! {city} businesses are thriving digitally.",
        "{city} is buzzing with digital opportunities!",
        "Love {city}! Let's make you the digital leader there."
    ],
    digitalStatus: {
        no_presence: "Perfect blank canvas! We'll build something amazing.",
        whatsapp: "Smart start! Let's expand your reach.",
        basic_website: "Good foundation! Time to maximize it.",
        social_only: "Social is great! Need a home base though.",
        full_website_no_results: "Let's diagnose and fix that!"
    },
    managedBy: {
        nobody: "That's why you're here! We'll make it easy.",
        myself: "Busy entrepreneur! Let's automate things.",
        family: "Family businesses need professional tools!",
        employee: "Great! We'll give them better tools.",
        agency: "Time to bring it in-house and save costs!"
    },
    budget: {
        nothing: "Let's invest smartly!",
        below_2k: "Budget-friendly solutions work wonders!",
        "2k_10k": "Perfect range for serious growth!",
        "10k_25k": "Ready for scale! Let's optimize.",
        "25k_plus": "Enterprise level! Custom solutions await."
    },
    goals: {
        more_customers: "Sales growth - music to my ears!",
        brand_recognition: "Brand power drives premium pricing!",
        showcase_products: "Visual selling works magic!",
        online_payments: "24/7 sales even while sleeping!",
        customer_management: "Happy customers = repeat business!",
        reduce_manual_work: "Automation saves 10 hours/week!"
    },
    challenge: {
        no_leads: "We'll fix your lead pipeline!",
        too_many_platforms: "One dashboard for everything!",
        dont_know: "Data-driven decisions ahead!",
        competitors_ahead: "Time to leapfrog them!",
        no_time: "We'll handle everything!"
    },
    timeline: {
        immediately: "Let's start with quick wins!",
        "1_3_months": "Perfect timeline for transformation!",
        "3_6_months": "Strategic approach for lasting results!",
        exploring: "Smart to plan ahead!"
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateProgress();
});

function initializeEventListeners() {
    // Screen 1 inputs
    const userNameInput = document.getElementById('userName');
    const businessNameInput = document.getElementById('businessName');
    const locationInput = document.getElementById('location');
    
    if (userNameInput) {
        userNameInput.addEventListener('input', (e) => {
            userProfile.userName = e.target.value.trim();
            if (userProfile.userName.length > 2) {
                updateChatMessage(getRandomResponse(chatResponses.userName, {name: userProfile.userName.split(' ')[0]}));
                updateProfileDisplay();
            }
            checkScreen1Validity();
        });
    }
    
    if (businessNameInput) {
        businessNameInput.addEventListener('input', (e) => {
            userProfile.businessName = e.target.value.trim();
            if (userProfile.businessName.length > 2) {
                updateChatMessage(getRandomResponse(chatResponses.businessName, {business: userProfile.businessName}));
                updateProfileDisplay();
            }
            checkScreen1Validity();
        });
    }
    
    if (locationInput) {
        locationInput.addEventListener('input', (e) => {
            userProfile.location = e.target.value.trim();
            if (userProfile.location.length > 2) {
                const city = userProfile.location.split(',')[0];
                updateChatMessage(getRandomResponse(chatResponses.location, {city}));
                updateProfileDisplay();
            }
            checkScreen1Validity();
        });
    }
    
    // Business type selection
    document.querySelectorAll('#screen1 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#screen1 .option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userProfile.businessType = card.dataset.value;
            updateChatMessage(chatResponses.businessType[userProfile.businessType]);
            updateProfileDisplay();
            checkScreen1Validity();
        });
    });
    
    // Screen 2 selections
    document.querySelectorAll('#screen2 .option-card').forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.closest('.form-group');
            const question = parent.querySelector('label').textContent;
            
            // Clear previous selection in same group
            parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const value = this.dataset.value;
            
            if (question.includes('digital presence')) {
                answers.digitalStatus = value;
                updateChatMessage(chatResponses.digitalStatus[value]);
            } else if (question.includes('manages')) {
                answers.managedBy = value;
                updateChatMessage(chatResponses.managedBy[value]);
            } else if (question.includes('spend')) {
                answers.budget = value;
                updateChatMessage(chatResponses.budget[value]);
            }
            
            updateProfileDisplay();
            checkScreen2Validity();
        });
    });
    
    // Screen 3 - Goals (checkboxes)
    document.querySelectorAll('#screen3 input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (!answers.goals) answers.goals = [];
            
            if (this.checked) {
                answers.goals.push(this.value);
                updateChatMessage(chatResponses.goals[this.value]);
            } else {
                answers.goals = answers.goals.filter(g => g !== this.value);
            }
            
            updateProfileDisplay();
            checkScreen3Validity();
        });
    });
    
    // Screen 3 - Challenge & Timeline
    document.querySelectorAll('#screen3 .option-card').forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.closest('.form-group');
            const question = parent.querySelector('label').textContent;
            
            parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const value = this.dataset.value;
            
            if (question.includes('challenge')) {
                answers.challenge = value;
                updateChatMessage(chatResponses.challenge[value]);
            } else if (question.includes('soon')) {
                answers.timeline = value;
                updateChatMessage(chatResponses.timeline[value]);
            }
            
            updateProfileDisplay();
            checkScreen3Validity();
        });
    });
    
    // Screen 4 selections
    document.querySelectorAll('#screen4 .option-card').forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.closest('.form-group');
            const question = parent.querySelector('label').textContent;
            
            parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const value = this.dataset.value;
            
            if (question.includes('domain')) {
                answers.domain = value;
            } else if (question.includes('products')) {
                answers.productCount = value;
            } else if (question.includes('Team')) {
                answers.teamSize = value;
            }
            
            updateProfileDisplay();
            checkScreen4Validity();
        });
    });
    
    // Screen 4 - Communication preferences
    document.querySelectorAll('#screen4 input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (!answers.communication) answers.communication = [];
            
            if (this.checked) {
                answers.communication.push(this.value);
            } else {
                answers.communication = answers.communication.filter(c => c !== this.value);
            }
            
            checkScreen4Validity();
        });
    });
    
    // Screen 5 - Industry needs and marketing
    document.querySelectorAll('#screen5 input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parent = this.closest('.form-group');
            const question = parent.querySelector('label').textContent;
            
            if (question.includes('industry')) {
                if (!answers.industryNeeds) answers.industryNeeds = [];
                
                if (this.checked) {
                    answers.industryNeeds.push(this.value);
                } else {
                    answers.industryNeeds = answers.industryNeeds.filter(n => n !== this.value);
                }
            } else if (question.includes('Marketing')) {
                if (!answers.marketingPrefs) answers.marketingPrefs = [];
                
                if (this.checked) {
                    answers.marketingPrefs.push(this.value);
                } else {
                    answers.marketingPrefs = answers.marketingPrefs.filter(m => m !== this.value);
                }
            }
            
            checkScreen5Validity();
        });
    });
    
    // Contact info
    document.getElementById('phone')?.addEventListener('input', (e) => {
        userProfile.phone = e.target.value.trim();
        checkScreen5Validity();
    });
    
    document.getElementById('email')?.addEventListener('input', (e) => {
        userProfile.email = e.target.value.trim();
    });
    
    // Navigation buttons
    document.getElementById('nextBtn1')?.addEventListener('click', () => nextScreen());
    document.getElementById('nextBtn2')?.addEventListener('click', () => nextScreen());
    document.getElementById('nextBtn3')?.addEventListener('click', () => nextScreen());
    document.getElementById('nextBtn4')?.addEventListener('click', () => nextScreen());
    document.getElementById('submitBtn')?.addEventListener('click', () => submitForm());
}

function checkScreen1Validity() {
    const btn = document.getElementById('nextBtn1');
    if (btn) {
        btn.disabled = !(
            userProfile.userName?.length > 2 &&
            userProfile.businessName?.length > 2 &&
            userProfile.businessType &&
            userProfile.location?.length > 2
        );
    }
}

function checkScreen2Validity() {
    const btn = document.getElementById('nextBtn2');
    if (btn) {
        btn.disabled = !(
            answers.digitalStatus &&
            answers.managedBy &&
            answers.budget
        );
    }
}

function checkScreen3Validity() {
    const btn = document.getElementById('nextBtn3');
    if (btn) {
        btn.disabled = !(
            answers.goals?.length > 0 &&
            answers.challenge &&
            answers.timeline
        );
    }
}

function checkScreen4Validity() {
    const btn = document.getElementById('nextBtn4');
    if (btn) {
        btn.disabled = !(
            answers.domain &&
            answers.productCount &&
            answers.teamSize &&
            answers.communication?.length > 0
        );
    }
}

function checkScreen5Validity() {
    const btn = document.getElementById('submitBtn');
    const phone = document.getElementById('phone')?.value;
    if (btn) {
        btn.disabled = !(phone?.length >= 10);
    }
}

function updateChatMessage(message) {
    const chatBubbles = document.querySelectorAll('.screen.active .chat-text');
    if (chatBubbles.length > 0) {
        const bubble = chatBubbles[chatBubbles.length - 1];
        bubble.style.opacity = '0';
        setTimeout(() => {
            bubble.textContent = message;
            bubble.style.opacity = '1';
        }, 200);
    }
}

function getRandomResponse(responses, replacements = {}) {
    let message;
    if (Array.isArray(responses)) {
        message = responses[Math.floor(Math.random() * responses.length)];
    } else {
        message = responses;
    }
    
    // Replace placeholders
    Object.keys(replacements).forEach(key => {
        message = message.replace(`{${key}}`, replacements[key]);
    });
    
    return message;
}

function nextScreen() {
    if (currentScreen < totalScreens) {
        document.getElementById(`screen${currentScreen}`).classList.remove('active');
        currentScreen++;
        document.getElementById(`screen${currentScreen}`).classList.add('active');
        updateProgress();
        
        // Save progress
        saveProgress();
    }
}

function previousScreen() {
    if (currentScreen > 1) {
        document.getElementById(`screen${currentScreen}`).classList.remove('active');
        currentScreen--;
        document.getElementById(`screen${currentScreen}`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    const percentage = ((currentScreen - 1) / (totalScreens - 1)) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index < currentScreen) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateProfileDisplay() {
    // Update avatar
    const avatar = document.getElementById('profileAvatar');
    if (avatar && userProfile.userName) {
        avatar.textContent = userProfile.userName.charAt(0).toUpperCase();
    }
    
    // Update name and status
    const profileName = document.getElementById('profileName');
    const profileStatus = document.getElementById('profileStatus');
    if (profileName && userProfile.userName) {
        const firstName = userProfile.userName.split(' ')[0];
        profileName.textContent = `${firstName}${userProfile.location ? ' from ' + userProfile.location.split(',')[0] : ''}`;
    }
    if (profileStatus) {
        profileStatus.textContent = getProfileStatus();
    }
    
    // Update sections
    updateBasicInfoSection();
    updateDigitalStateSection();
    updateGoalsSection();
    updateRequirementsSection();
    updateScoreSection();
}

function getProfileStatus() {
    const statuses = [
        "Building your digital strategy...",
        "Analyzing your requirements...",
        "Finding perfect solutions...",
        "Calculating recommendations..."
    ];
    return statuses[currentScreen - 1] || "Complete your profile";
}

function updateBasicInfoSection() {
    const section = document.getElementById('basicInfoSection');
    if (userProfile.userName || userProfile.businessName) {
        section.style.display = 'block';
        
        if (userProfile.userName) {
            document.getElementById('profileUserName').textContent = userProfile.userName;
        }
        if (userProfile.businessName) {
            document.getElementById('profileBusinessName').textContent = userProfile.businessName;
        }
        if (userProfile.businessType) {
            const types = {
                retail: 'Retail/E-commerce',
                services: 'Professional Services',
                manufacturing: 'Manufacturing',
                food: 'Restaurant/Food'
            };
            document.getElementById('profileBusinessType').textContent = types[userProfile.businessType];
        }
        if (userProfile.location) {
            document.getElementById('profileLocation').textContent = userProfile.location;
        }
    }
}

function updateDigitalStateSection() {
    const section = document.getElementById('digitalStateSection');
    if (answers.digitalStatus || answers.budget) {
        section.style.display = 'block';
        
        if (answers.digitalStatus) {
            const states = {
                no_presence: 'No digital presence',
                whatsapp: 'WhatsApp Business only',
                basic_website: 'Basic website',
                social_only: 'Social media only',
                full_website_no_results: 'Website without results'
            };
            document.getElementById('profileDigitalState').textContent = states[answers.digitalStatus];
        }
        if (answers.managedBy) {
            const managers = {
                nobody: 'Nobody',
                myself: 'Self-managed',
                family: 'Family member',
                employee: 'Employee',
                agency: 'Agency/Freelancer'
            };
            document.getElementById('profileManagedBy').textContent = managers[answers.managedBy];
        }
        if (answers.budget) {
            const budgets = {
                nothing: 'No budget',
                below_2k: '< ₹2,000/month',
                '2k_10k': '₹2,000-10,000/month',
                '10k_25k': '₹10,000-25,000/month',
                '25k_plus': '₹25,000+/month'
            };
            document.getElementById('profileBudget').textContent = budgets[answers.budget];
        }
    }
}

function updateGoalsSection() {
    const section = document.getElementById('goalsSection');
    if (answers.goals?.length > 0 || answers.challenge) {
        section.style.display = 'block';
        
        const goalsContainer = document.getElementById('profileGoals');
        if (goalsContainer && answers.goals) {
            goalsContainer.innerHTML = '';
            const goalLabels = {
                more_customers: 'More Customers',
                brand_recognition: 'Brand Building',
                showcase_products: 'Product Showcase',
                online_payments: 'Online Payments',
                customer_management: 'CRM',
                reduce_manual_work: 'Automation'
            };
            answers.goals.forEach(goal => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = goalLabels[goal];
                goalsContainer.appendChild(tag);
            });
        }
        
        if (answers.challenge) {
            const challenges = {
                no_leads: 'No leads',
                too_many_platforms: 'Platform overload',
                dont_know: 'Lack of knowledge',
                competitors_ahead: 'Behind competitors',
                no_time: 'No time'
            };
            document.getElementById('profileChallenge').textContent = challenges[answers.challenge];
        }
        
        if (answers.timeline) {
            const timelines = {
                immediately: 'Immediate',
                '1_3_months': '1-3 months',
                '3_6_months': '3-6 months',
                exploring: 'Exploring'
            };
            document.getElementById('profileTimeline').textContent = timelines[answers.timeline];
        }
    }
}

function updateRequirementsSection() {
    const section = document.getElementById('requirementsSection');
    if (answers.productCount || answers.teamSize) {
        section.style.display = 'block';
        
        if (answers.productCount) {
            const counts = {
                less_10: '< 10 items',
                '10_50': '10-50 items',
                '50_200': '50-200 items',
                '200_plus': '200+ items'
            };
            document.getElementById('profileProducts').textContent = counts[answers.productCount];
        }
        
        if (answers.teamSize) {
            const sizes = {
                just_me: 'Solo',
                '2_5': '2-5 people',
                '5_10': '5-10 people',
                '10_plus': '10+ people'
            };
            document.getElementById('profileTeam').textContent = sizes[answers.teamSize];
        }
        
        if (answers.domain) {
            const domains = {
                no_idea: 'Needs guidance',
                need_everything: 'Needs all',
                have_domain: 'Has domain',
                have_both: 'Has domain & hosting'
            };
            document.getElementById('profileDomain').textContent = domains[answers.domain];
        }
    }
}

function updateScoreSection() {
    const section = document.getElementById('scoreSection');
    if (currentScreen >= 3) {
        section.style.display = 'block';
        
        // Calculate a preliminary score
        let score = 25; // Base score
        
        // Add points based on readiness
        if (answers.digitalStatus === 'full_website_no_results') score += 15;
        else if (answers.digitalStatus === 'basic_website') score += 10;
        else if (answers.digitalStatus === 'social_only' || answers.digitalStatus === 'whatsapp') score += 5;
        
        // Budget readiness
        if (answers.budget === '25k_plus') score += 20;
        else if (answers.budget === '10k_25k') score += 15;
        else if (answers.budget === '2k_10k') score += 10;
        else if (answers.budget === 'below_2k') score += 5;
        
        // Goals clarity
        if (answers.goals?.length > 3) score += 15;
        else if (answers.goals?.length > 1) score += 10;
        else if (answers.goals?.length > 0) score += 5;
        
        // Timeline urgency
        if (answers.timeline === 'immediately') score += 10;
        else if (answers.timeline === '1_3_months') score += 7;
        else if (answers.timeline === '3_6_months') score += 5;
        
        document.getElementById('miniScore').textContent = Math.min(score, 100);
    }
}

async function saveProgress() {
    if (!supabase) return;
    
    try {
        const data = {
            user_profile: userProfile,
            answers: answers,
            current_screen: currentScreen,
            timestamp: new Date().toISOString()
        };
        
        await supabase.from('digital_validation_progress').upsert(data);
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

async function submitForm() {
    // Prepare final data
    const finalData = {
        ...userProfile,
        ...answers,
        recommendation: getRecommendation(answers),
        submitted_at: new Date().toISOString()
    };
    
    // Save to database
    if (supabase) {
        try {
            await supabase.from('digital_validation_leads').insert(finalData);
        } catch (error) {
            console.error('Error saving lead:', error);
        }
    }
    
    // Show results
    showResults(finalData.recommendation);
}

function showResults(recommendation) {
    // Hide current screen
    document.getElementById('screen5').classList.remove('active');
    
    // Show results screen
    const resultsScreen = document.getElementById('resultsScreen');
    resultsScreen.classList.add('active');
    
    // Generate and display results
    const resultsHTML = generateResultsHTML(recommendation);
    document.querySelector('.results-container').innerHTML = resultsHTML;
}

function generateResultsHTML(recommendation) {
    let html = `
        <div class="chat-bubble">
            <div class="chat-text">🎉 Fantastic! Based on your answers, I've crafted the perfect solution for ${userProfile.businessName}!</div>
        </div>
        
        <div class="result-card">
            <h1>Your Personalized Digital Solution</h1>
            
            <div class="user-summary">
                <p>Hello <strong>${userProfile.userName}</strong>! You run <strong>${userProfile.businessName}</strong>, 
                a ${getBusinessTypeLabel(userProfile.businessType)} in <strong>${userProfile.location}</strong>.</p>
            </div>
    `;
    
    // Show package if available
    if (recommendation.package) {
        html += `
            <div class="recommendation-section">
                <h2>💎 Recommended Package: ${recommendation.package.name}</h2>
                <p class="package-description">${recommendation.package.bestFor}</p>
                <div class="price-box">
                    <div class="price-main">₹${recommendation.package.totalPrice.toLocaleString()}</div>
                    <div class="price-savings">Save ₹${recommendation.package.savings.toLocaleString()}</div>
                </div>
                ${recommendation.package.monthlyRecurring ? 
                    `<p class="recurring-note">+ ₹${recommendation.package.monthlyRecurring.toLocaleString()}/month for marketing services</p>` : ''
                }
            </div>
        `;
    }
    
    // Show primary product recommendation
    if (recommendation.primary) {
        html += `
            <div class="recommendation-section">
                <h2>${recommendation.primary.icon} Primary Solution: ${recommendation.primary.name}</h2>
                <p class="tagline">${recommendation.primary.tagline}</p>
                <div class="features-grid">
                    ${recommendation.primary.features.slice(0, 6).map(f => 
                        `<div class="feature-item">✓ ${f}</div>`
                    ).join('')}
                </div>
                <div class="price-box">
                    <div class="price-main">₹${recommendation.primary.price.toLocaleString()}/${recommendation.primary.period}</div>
                </div>
            </div>
        `;
    }
    
    // Show recommended services
    if (recommendation.services.length > 0) {
        html += `
            <div class="recommendation-section">
                <h2>📈 Recommended Services</h2>
                <div class="services-list">
        `;
        
        recommendation.services.forEach(service => {
            html += `
                <div class="service-card">
                    <div class="service-header">
                        <span class="service-icon">${service.icon}</span>
                        <h3>${service.name}</h3>
                    </div>
                    <ul class="service-features">
                        ${service.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    <div class="service-price">₹${service.price.toLocaleString()}/${service.period}</div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // Investment Summary
    const totalFirstYear = recommendation.totalInvestment + (recommendation.monthlyRecurring * 12);
    html += `
        <div class="investment-summary">
            <h2>💰 Investment Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">One-time Investment</div>
                    <div class="summary-value">₹${recommendation.totalInvestment.toLocaleString()}</div>
                </div>
                ${recommendation.monthlyRecurring > 0 ? `
                <div class="summary-item">
                    <div class="summary-label">Monthly Services</div>
                    <div class="summary-value">₹${recommendation.monthlyRecurring.toLocaleString()}/mo</div>
                </div>
                <div class="summary-item highlight">
                    <div class="summary-label">First Year Total</div>
                    <div class="summary-value">₹${totalFirstYear.toLocaleString()}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Why this recommendation
    html += `
        <div class="recommendation-section">
            <h2>🎯 Why This Solution?</h2>
            <p class="reasoning">${recommendation.reasoning}</p>
            <div class="benefits-list">
                ${generateBenefits(answers).map(b => `<div class="benefit">✓ ${b}</div>`).join('')}
            </div>
        </div>
    `;
    
    // CTA Section
    html += `
        <div class="cta-section">
            <h2>Ready to Transform Your Business?</h2>
            <p>Our team will contact you within 24 hours to discuss your personalized solution.</p>
            <div class="button-group">
                <button class="btn btn-primary btn-large" onclick="scheduleCallback()">
                    📞 Get Free Consultation
                </button>
                <button class="btn btn-secondary" onclick="downloadReport()">
                    📄 Download Report
                </button>
            </div>
            <p class="contact-note">Or call us directly at <strong>+91 88888 88888</strong></p>
        </div>
        
        </div>
    `;
    
    return html;
}

function getBusinessTypeLabel(type) {
    const types = {
        retail: 'Retail/E-commerce business',
        services: 'Professional Services business',
        manufacturing: 'Manufacturing business',
        food: 'Restaurant/Food business'
    };
    return types[type] || 'business';
}

function generateBenefits(answers) {
    const benefits = [];
    
    if (answers.digitalStatus === 'no_presence') {
        benefits.push('Get online in just 48 hours');
        benefits.push('Professional digital presence from Day 1');
    }
    
    if (answers.goals?.includes('more_customers')) {
        benefits.push('Start generating leads immediately');
    }
    
    if (answers.goals?.includes('brand_recognition')) {
        benefits.push('Build a memorable brand identity');
    }
    
    if (answers.goals?.includes('online_payments')) {
        benefits.push('Accept payments 24/7');
    }
    
    if (answers.challenge === 'no_time') {
        benefits.push('Completely managed solution - no time needed from you');
    }
    
    if (answers.timeline === 'immediately') {
        benefits.push('Quick implementation - see results in days');
    }
    
    return benefits.slice(0, 4);
}

function scheduleCallback() {
    alert('Thank you! Our team will call you within 24 hours.');
    // In production, this would trigger an API call
}

function downloadReport() {
    alert('Your personalized report will be emailed to you shortly.');
    // In production, this would generate and email a PDF
}

// Make previousScreen available globally
window.previousScreen = previousScreen;