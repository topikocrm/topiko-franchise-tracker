// Product and Service Configuration
const products = {
    // Core Products
    disblay: {
        id: 'disblay',
        name: 'Disblay',
        tagline: 'Your Digital Start',
        price: 1499,
        period: 'year',
        category: 'product',
        icon: '🌐',
        color: '#4CAF50',
        features: [
            'Professional Website',
            'Mobile Responsive Design',
            'Basic SEO Setup',
            'Contact Form',
            'Google Maps Integration',
            'Social Media Links',
            'Free Hosting for 1 Year',
            'SSL Certificate Included'
        ],
        bestFor: ['no_presence', 'budget_below_2k'],
        description: 'Perfect entry-level solution for businesses taking their first step online.'
    },
    
    topiko: {
        id: 'topiko',
        name: 'Topiko',
        tagline: 'All-in-One Business Platform',
        price: 9999,
        period: 'year',
        category: 'product',
        icon: '🚀',
        color: '#667eea',
        features: [
            'E-commerce Website',
            'Mobile App for Business',
            'Mini CRM System',
            'Inventory Management',
            'Customer Engagement Tools',
            'WhatsApp Business Integration',
            'Payment Gateway Integration',
            'Multi-User Access',
            'Analytics Dashboard',
            'Free Domain + Hosting + SSL'
        ],
        bestFor: ['wants_growth', 'budget_2k_10k', 'has_products'],
        description: 'Complete digital ecosystem for growing businesses.'
    },
    
    flex: {
        id: 'flex',
        name: 'Flex',
        tagline: 'White Label Solutions',
        price: 20000,
        period: 'one-time',
        category: 'product',
        icon: '⚡',
        color: '#FF6B6B',
        features: [
            'Custom E-commerce Platform',
            'Service Booking System',
            'Subscription Management',
            'Custom Branding',
            'Advanced Analytics',
            'API Integrations',
            'Dedicated Support',
            'Source Code Access'
        ],
        bestFor: ['custom_needs', 'budget_10k_25k', 'enterprise'],
        description: 'Customizable white-label solution for unique business needs.'
    },
    
    aiCustom: {
        id: 'aiCustom',
        name: 'AI Custom Development',
        tagline: 'Bespoke AI Solutions',
        price: 50000,
        period: 'project',
        category: 'product',
        icon: '🤖',
        color: '#9C27B0',
        features: [
            'Custom AI Development',
            'End-to-End Delivery',
            'Machine Learning Models',
            'Process Automation',
            'Chatbot Development',
            'Predictive Analytics',
            'Complete Ownership',
            '6 Months Support'
        ],
        bestFor: ['enterprise', 'budget_25k_plus', 'custom_needs'],
        description: 'Cutting-edge AI solutions tailored to your business.'
    }
};

const services = {
    // Brandpreneuring Services
    branding: {
        id: 'branding',
        name: 'Brand Identity Package',
        price: 5000,
        period: 'one-time',
        category: 'service',
        icon: '🎨',
        color: '#E91E63',
        features: [
            'Logo Design (3 Concepts)',
            'Business Card Design',
            'Letterhead Design',
            'Brand Guidelines',
            'Color Palette',
            'Typography Guide'
        ],
        bestFor: ['new_business', 'wants_brand']
    },
    
    digitalMarketing: {
        id: 'digitalMarketing',
        name: 'Digital Marketing',
        price: 5000,
        period: 'month',
        category: 'service',
        icon: '📈',
        color: '#FF9800',
        features: [
            'Google Ads Management',
            'Facebook & Instagram Ads',
            'Monthly Reports',
            'Landing Page Optimization',
            'Lead Tracking',
            'A/B Testing'
        ],
        bestFor: ['wants_leads', 'has_website']
    },
    
    socialMedia: {
        id: 'socialMedia',
        name: 'Social Media Management',
        price: 3000,
        period: 'month',
        category: 'service',
        icon: '📱',
        color: '#00BCD4',
        features: [
            '15 Posts per Month',
            'Content Calendar',
            'Hashtag Research',
            'Engagement Management',
            'Monthly Analytics',
            'Story Creation'
        ],
        bestFor: ['wants_brand', 'social_presence']
    },
    
    gmb: {
        id: 'gmb',
        name: 'Google My Business Setup',
        price: 1500,
        period: 'one-time',
        category: 'service',
        icon: '📍',
        color: '#4285F4',
        features: [
            'GMB Profile Creation',
            'Verification Assistance',
            'Photo Optimization',
            'Review Management Setup',
            'Local SEO Optimization',
            'Posts Training'
        ],
        bestFor: ['local_business', 'no_presence']
    },
    
    contentCreation: {
        id: 'contentCreation',
        name: 'Content & Assets Creation',
        price: 2000,
        period: 'month',
        category: 'service',
        icon: '✍️',
        color: '#795548',
        features: [
            '20 Product Photos',
            '10 Social Media Graphics',
            '4 Blog Posts',
            'Product Descriptions',
            'Email Templates',
            'WhatsApp Broadcast Content'
        ],
        bestFor: ['has_products', 'wants_content']
    }
};

const packages = {
    starter: {
        name: 'Digital Starter',
        products: ['disblay'],
        services: ['gmb', 'branding'],
        totalPrice: 7999,
        savings: 1000,
        bestFor: 'Businesses with no digital presence and budget < ₹10K'
    },
    
    growth: {
        name: 'Growth Accelerator',
        products: ['topiko'],
        services: ['digitalMarketing', 'socialMedia'],
        totalPrice: 17999,
        period: 'First year',
        monthlyRecurring: 8000,
        savings: 2000,
        bestFor: 'Growing businesses wanting leads and sales'
    },
    
    brand: {
        name: 'Brand Builder',
        products: ['topiko'],
        services: ['branding', 'socialMedia', 'contentCreation'],
        totalPrice: 19999,
        period: 'First year',
        monthlyRecurring: 5000,
        savings: 3000,
        bestFor: 'Businesses focused on brand building'
    },
    
    enterprise: {
        name: 'Enterprise Solution',
        products: ['flex'],
        services: ['digitalMarketing', 'socialMedia', 'contentCreation'],
        totalPrice: 35000,
        period: 'Setup',
        monthlyRecurring: 10000,
        savings: 5000,
        bestFor: 'Established businesses needing custom solutions'
    }
};

// Recommendation Logic
function getRecommendation(answers) {
    const recommendations = {
        primary: null,
        secondary: [],
        services: [],
        package: null,
        reasoning: '',
        totalInvestment: 0,
        monthlyRecurring: 0
    };
    
    // Analyze user profile
    const hasNoPresence = answers.digitalStatus === 'no_presence';
    const hasBasicPresence = ['whatsapp', 'basic_website', 'social_only'].includes(answers.digitalStatus);
    const hasFullPresence = answers.digitalStatus === 'full_website_no_results';
    
    const isLowBudget = answers.budget === 'below_2k';
    const isMediumBudget = answers.budget === '2k_10k';
    const isHighBudget = ['10k_25k', '25k_plus'].includes(answers.budget);
    
    const wantsLeads = answers.goals?.includes('more_customers');
    const wantsBrand = answers.goals?.includes('brand_recognition');
    const wantsAutomation = answers.goals?.includes('reduce_manual_work');
    const wantsEcommerce = answers.goals?.includes('online_payments');
    
    // Decision tree for primary product
    if (hasNoPresence && isLowBudget) {
        recommendations.primary = products.disblay;
        recommendations.services.push(services.gmb);
        recommendations.reasoning = "Starting your digital journey affordably with professional presence.";
    } else if (hasNoPresence && (isMediumBudget || isHighBudget)) {
        recommendations.primary = products.topiko;
        recommendations.services.push(services.branding);
        recommendations.services.push(services.gmb);
        recommendations.reasoning = "Complete digital transformation with all tools you need.";
    } else if (hasBasicPresence && wantsLeads) {
        if (isMediumBudget || isHighBudget) {
            recommendations.primary = products.topiko;
            recommendations.services.push(services.digitalMarketing);
        } else {
            recommendations.services.push(services.digitalMarketing);
            recommendations.services.push(services.gmb);
        }
        recommendations.reasoning = "Amplifying your existing presence for lead generation.";
    } else if (hasFullPresence && !wantsLeads) {
        recommendations.services.push(services.digitalMarketing);
        recommendations.services.push(services.contentCreation);
        recommendations.reasoning = "Optimizing your current setup for better results.";
    }
    
    // Add brand services if requested
    if (wantsBrand && !recommendations.services.find(s => s.id === 'branding')) {
        recommendations.services.push(services.branding);
    }
    
    // Check for package fit
    if (hasNoPresence && isLowBudget) {
        recommendations.package = packages.starter;
    } else if (wantsLeads && (isMediumBudget || isHighBudget)) {
        recommendations.package = packages.growth;
    } else if (wantsBrand && isMediumBudget) {
        recommendations.package = packages.brand;
    } else if (isHighBudget && answers.teamSize > 10) {
        recommendations.package = packages.enterprise;
    }
    
    // Calculate total investment
    if (recommendations.primary) {
        recommendations.totalInvestment += recommendations.primary.price;
    }
    
    recommendations.services.forEach(service => {
        if (service.period === 'month') {
            recommendations.monthlyRecurring += service.price;
        } else {
            recommendations.totalInvestment += service.price;
        }
    });
    
    return recommendations;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, services, packages, getRecommendation };
}