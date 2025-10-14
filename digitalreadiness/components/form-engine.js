// Enhanced Form Engine for Digital Readiness Assessment
class DigitalReadinessFormEngine {
    constructor() {
        this.currentScreen = 1;
        this.totalScreens = 4;
        this.formData = this.initializeFormData();
        this.supabase = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.initializeSupabase();
        this.bindEvents();
        this.captureUTMParameters();
    }

    initializeFormData() {
        return {
            // Personal Information
            fullName: '',
            businessName: '',
            businessType: '',
            location: '',
            
            // Business Goals & Status
            goals: [],
            digitalStatus: '',
            budget: '',
            challenge: '',
            
            // Contact & Verification
            mobile: '',
            email: '',
            otpVerified: false,
            
            // Technical Tracking
            sessionId: this.generateSessionId(),
            browserInfo: this.getBrowserInfo(),
            utmParameters: {},
            startTime: new Date().toISOString(),
            campaignSource: 'digital_readiness',
            
            // Engagement Metrics
            timeSpentPerScreen: {},
            interactions: [],
            completedScreens: []
        };
    }

    generateSessionId() {
        return 'dr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        };
    }

    captureUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        this.formData.utmParameters = {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_term: urlParams.get('utm_term') || '',
            utm_content: urlParams.get('utm_content') || '',
            gclid: urlParams.get('gclid') || '',
            fbclid: urlParams.get('fbclid') || ''
        };
    }

    async initializeSupabase() {
        try {
            const SUPABASE_URL = 'https://uyaubwfmxmxelcshuyaf.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YXVid2ZteG14ZWxjc2h1eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDA0MTksImV4cCI6MjA2OTUxNjQxOX0.Sc9qUUXr73x8yw5-2rs-pcI03lFpMTSyuhW9RDLcOLI';
            
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Digital Readiness: Supabase initialized successfully');
            
            // Initial save to create the lead record
            await this.saveProgress('initial_load');
            return true;
        } catch (error) {
            console.error('Digital Readiness: Supabase initialization failed:', error);
            return false;
        }
    }

    bindEvents() {
        // Add global event listeners for interaction tracking
        document.addEventListener('click', (e) => this.trackInteraction('click', e.target));
        document.addEventListener('input', (e) => this.trackInteraction('input', e.target));
        document.addEventListener('change', (e) => this.trackInteraction('change', e.target));
        
        // Track screen time
        this.screenStartTime = Date.now();
        
        // Track page visibility for engagement metrics
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.screenStartTime = Date.now();
            } else {
                this.trackScreenTime();
            }
        });
        
        // Track beforeunload for abandonment analysis
        window.addEventListener('beforeunload', () => {
            this.trackScreenTime();
            this.trackInteraction('page_exit', { screen: this.currentScreen });
        });
    }

    trackInteraction(type, target) {
        const interaction = {
            type,
            timestamp: new Date().toISOString(),
            screen: this.currentScreen,
            element: target?.id || target?.className || 'unknown',
            value: target?.value || target?.textContent || ''
        };
        
        this.formData.interactions.push(interaction);
        
        // Limit interactions array to prevent bloat
        if (this.formData.interactions.length > 100) {
            this.formData.interactions = this.formData.interactions.slice(-50);
        }
    }

    trackScreenTime() {
        if (this.screenStartTime) {
            const timeSpent = Date.now() - this.screenStartTime;
            this.formData.timeSpentPerScreen[`screen_${this.currentScreen}`] = 
                (this.formData.timeSpentPerScreen[`screen_${this.currentScreen}`] || 0) + timeSpent;
        }
    }

    async saveProgress(phase, additionalData = {}) {
        this.trackScreenTime();
        
        if (!this.supabase) {
            console.log('Offline mode - data saved locally');
            return;
        }

        const leadData = {
            // Basic Information
            first_name: this.formData.fullName.split(' ')[0] || '',
            last_name: this.formData.fullName.split(' ').slice(1).join(' ') || '',
            phone: this.formData.mobile || '',
            email: this.formData.email || '',
            city: this.formData.location || '',
            
            // Business Information
            business_name: this.formData.businessName || '',
            business_type: this.formData.businessType || '',
            
            // Assessment Data
            answers: {
                goals: this.formData.goals,
                digitalStatus: this.formData.digitalStatus,
                budget: this.formData.budget,
                challenge: this.formData.challenge,
                ...additionalData
            },
            
            // Campaign & Tracking
            campaign_source: this.formData.campaignSource,
            utm_data: this.formData.utmParameters,
            session_id: this.formData.sessionId,
            browser_info: this.formData.browserInfo,
            
            // Engagement Metrics
            time_spent_per_screen: this.formData.timeSpentPerScreen,
            interactions: this.formData.interactions.slice(-20), // Last 20 interactions
            
            // Status & Timestamps
            lead_status: phase,
            created_at: this.formData.startTime,
            [`${phase}_at`]: new Date().toISOString(),
            
            // Progress tracking
            completed_screens: this.formData.completedScreens,
            current_screen: this.currentScreen
        };

        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('franchise_leads')
                .upsert(leadData, { 
                    onConflict: 'session_id',
                    ignoreDuplicates: false 
                });

            if (error) throw error;
            
            console.log(`Digital Readiness: ${phase} saved successfully`);
            this.retryCount = 0; // Reset retry count on success
            return data;
        });
    }

    async retryOperation(operation) {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                
                if (attempt === this.maxRetries) {
                    console.error('Max retries reached. Operation failed.');
                    return null;
                }
                
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Screen transition methods
    async goToScreen(screenNumber) {
        if (screenNumber < 1 || screenNumber > this.totalScreens) return;
        
        // Save current screen completion
        if (!this.formData.completedScreens.includes(this.currentScreen)) {
            this.formData.completedScreens.push(this.currentScreen);
        }
        
        // Update progress
        this.currentScreen = screenNumber;
        this.updateProgressBar();
        
        // Reset screen timer
        this.screenStartTime = Date.now();
        
        // Show the new screen
        this.showScreen(screenNumber);
        
        // Save progress
        await this.saveProgress(`screen_${screenNumber}_viewed`);
    }

    showScreen(screenNumber) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`screen${screenNumber}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Animate screen entrance
            gsap.fromTo(targetScreen, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgressBar() {
        const progress = (this.currentScreen / this.totalScreens) * 100;
        const progressBar = document.getElementById('progressBar');
        
        if (progressBar) {
            gsap.to(progressBar, {
                width: `${progress}%`,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }

    // Validation methods
    validateScreen(screenNumber) {
        switch (screenNumber) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateBusinessInfo();
            case 3:
                return this.validateVerification();
            case 4:
                return true; // Results screen
            default:
                return false;
        }
    }

    validatePersonalInfo() {
        const requiredFields = ['fullName', 'businessName', 'businessType', 'location'];
        return requiredFields.every(field => this.formData[field] && this.formData[field].trim().length > 0);
    }

    validateBusinessInfo() {
        return this.formData.goals.length > 0 && 
               this.formData.digitalStatus && 
               this.formData.budget && 
               this.formData.challenge;
    }

    validateVerification() {
        return this.formData.mobile && 
               this.formData.mobile.length >= 10 && 
               this.formData.otpVerified;
    }

    // Utility methods
    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        const loading = button.querySelector('.loading-dots');
        
        if (button && loading) {
            button.disabled = true;
            loading.style.display = 'inline-flex';
        }
    }

    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        const loading = button.querySelector('.loading-dots');
        
        if (button && loading) {
            button.disabled = false;
            loading.style.display = 'none';
        }
    }

    // Analytics methods
    getEngagementMetrics() {
        const totalTime = Object.values(this.formData.timeSpentPerScreen)
            .reduce((sum, time) => sum + time, 0);
        
        return {
            totalTimeSpent: totalTime,
            screensCompleted: this.formData.completedScreens.length,
            completionRate: (this.formData.completedScreens.length / this.totalScreens) * 100,
            averageTimePerScreen: totalTime / Math.max(this.formData.completedScreens.length, 1),
            totalInteractions: this.formData.interactions.length,
            abandonmentPoint: this.currentScreen
        };
    }

    // Export functionality for admin dashboard
    exportFormData() {
        return {
            ...this.formData,
            engagementMetrics: this.getEngagementMetrics(),
            exportedAt: new Date().toISOString()
        };
    }
}

// Initialize form engine when DOM is loaded
window.digitalReadinessForm = null;

document.addEventListener('DOMContentLoaded', () => {
    window.digitalReadinessForm = new DigitalReadinessFormEngine();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalReadinessFormEngine;
}