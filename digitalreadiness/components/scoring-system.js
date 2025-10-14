// Advanced Digital Readiness Scoring System
class DigitalReadinessScorer {
    constructor() {
        this.maxScore = 100;
        this.weights = {
            goals: 0.25,           // 25% - What they want to achieve
            digitalStatus: 0.30,   // 30% - Current digital maturity
            budget: 0.25,          // 25% - Investment readiness
            challenge: 0.20        // 20% - Problem awareness
        };
        
        this.scoringRules = this.initializeScoringRules();
    }

    initializeScoringRules() {
        return {
            goals: {
                'more_customers': 25,
                'showcase': 20,
                'brand': 20,
                'automate': 25,
                'app': 30
            },
            digitalStatus: {
                'no_presence': 10,
                'basic_social': 40,
                'basic_website': 70,
                'no_results': 85
            },
            budget: {
                'below_2k': 30,
                '2k_10k': 60,
                '10k_25k': 80,
                '25k_plus': 100
            },
            challenge: {
                'no_leads': 90,      // High awareness = high readiness
                'dont_know': 40,     // Low awareness but willing to learn
                'no_time': 70,       // Clear problem identification
                'low_sales': 95      // Highest pain point = highest readiness
            }
        };
    }

    calculateOverallScore(formData) {
        let totalScore = 0;
        const scoreBreakdown = {};

        // Goals scoring
        const goalsScore = this.calculateGoalsScore(formData.goals);
        scoreBreakdown.goals = {
            score: goalsScore,
            weight: this.weights.goals,
            weightedScore: goalsScore * this.weights.goals
        };
        totalScore += scoreBreakdown.goals.weightedScore;

        // Digital status scoring
        const statusScore = this.scoringRules.digitalStatus[formData.digitalStatus] || 0;
        scoreBreakdown.digitalStatus = {
            score: statusScore,
            weight: this.weights.digitalStatus,
            weightedScore: statusScore * this.weights.digitalStatus
        };
        totalScore += scoreBreakdown.digitalStatus.weightedScore;

        // Budget scoring
        const budgetScore = this.scoringRules.budget[formData.budget] || 0;
        scoreBreakdown.budget = {
            score: budgetScore,
            weight: this.weights.budget,
            weightedScore: budgetScore * this.weights.budget
        };
        totalScore += scoreBreakdown.budget.weightedScore;

        // Challenge scoring
        const challengeScore = this.scoringRules.challenge[formData.challenge] || 0;
        scoreBreakdown.challenge = {
            score: challengeScore,
            weight: this.weights.challenge,
            weightedScore: challengeScore * this.weights.challenge
        };
        totalScore += scoreBreakdown.challenge.weightedScore;

        return {
            totalScore: Math.min(Math.round(totalScore), this.maxScore),
            breakdown: scoreBreakdown,
            category: this.getScoreCategory(totalScore),
            recommendations: this.getRecommendations(totalScore, formData)
        };
    }

    calculateGoalsScore(goals) {
        if (!goals || !Array.isArray(goals) || goals.length === 0) {
            return 0;
        }

        // Calculate base score from individual goals
        let baseScore = 0;
        goals.forEach(goal => {
            baseScore += this.scoringRules.goals[goal] || 0;
        });

        // Apply multipliers for goal combinations
        const multiplier = this.getGoalsMultiplier(goals);
        
        // Ensure score doesn't exceed 100
        return Math.min(baseScore * multiplier, 100);
    }

    getGoalsMultiplier(goals) {
        // Multiple complementary goals indicate higher readiness
        if (goals.length >= 4) return 1.2;
        if (goals.length === 3) return 1.1;
        if (goals.length === 2) return 1.0;
        return 0.8; // Single goal might indicate limited vision
    }

    getScoreCategory(score) {
        if (score >= 80) return { level: 'high', label: 'Digitally Ready', color: '#10b981' };
        if (score >= 60) return { level: 'medium-high', label: 'Nearly Ready', color: '#3b82f6' };
        if (score >= 40) return { level: 'medium', label: 'Getting Started', color: '#f59e0b' };
        if (score >= 20) return { level: 'low-medium', label: 'Early Stage', color: '#ef4444' };
        return { level: 'low', label: 'Just Beginning', color: '#6b7280' };
    }

    getRecommendations(score, formData) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            productSuggestion: null
        };

        // Immediate recommendations based on current status
        if (formData.digitalStatus === 'no_presence') {
            recommendations.immediate.push({
                icon: '🌐',
                title: 'Establish Online Presence',
                description: 'Start with a basic website or social media profiles',
                priority: 'high'
            });
        }

        if (formData.challenge === 'no_leads') {
            recommendations.immediate.push({
                icon: '📈',
                title: 'Lead Generation Setup',
                description: 'Implement basic lead capture and follow-up systems',
                priority: 'high'
            });
        }

        // Short-term recommendations
        if (formData.goals.includes('automate')) {
            recommendations.shortTerm.push({
                icon: '🤖',
                title: 'Process Automation',
                description: 'Set up automated customer management workflows',
                priority: 'medium'
            });
        }

        if (formData.goals.includes('brand')) {
            recommendations.shortTerm.push({
                icon: '✨',
                title: 'Brand Development',
                description: 'Create consistent brand identity across all platforms',
                priority: 'medium'
            });
        }

        // Long-term recommendations
        if (formData.budget === '25k_plus') {
            recommendations.longTerm.push({
                icon: '🚀',
                title: 'Advanced Solutions',
                description: 'Custom development and enterprise-level features',
                priority: 'low'
            });
        }

        // Product suggestion based on comprehensive analysis
        recommendations.productSuggestion = this.getProductRecommendation(score, formData);

        return recommendations;
    }

    getProductRecommendation(score, formData) {
        const { budget, digitalStatus, goals, challenge } = formData;

        // Decision tree for product recommendation
        if (budget === 'below_2k' || digitalStatus === 'no_presence') {
            return {
                product: 'Disblay',
                confidence: 'high',
                reason: 'Perfect starting point for digital presence',
                features: [
                    'Quick setup and deployment',
                    'Basic online presence',
                    'Mobile-friendly design',
                    'WhatsApp integration'
                ],
                pricing: 'Under ₹2,000/month',
                setupTime: '24-48 hours'
            };
        }

        if (budget === '25k_plus' && goals.includes('app')) {
            return {
                product: 'HEBT',
                confidence: 'high',
                reason: 'Advanced custom solutions for your requirements',
                features: [
                    'Custom app development',
                    'Enterprise-grade features',
                    'Full technical support',
                    'Scalable architecture'
                ],
                pricing: '₹25,000+/month',
                setupTime: '4-8 weeks'
            };
        }

        if (goals.includes('brand') && (budget === '10k_25k' || budget === '25k_plus')) {
            return {
                product: 'Topiko + Brandpreneuring',
                confidence: 'high',
                reason: 'Complete brand building and digital presence solution',
                features: [
                    'Professional brand strategy',
                    'Complete digital ecosystem',
                    'Marketing campaign support',
                    'Premium design and development'
                ],
                pricing: '₹15,000-30,000/month',
                setupTime: '2-4 weeks'
            };
        }

        // Default recommendation - Topiko
        return {
            product: 'Topiko',
            confidence: 'medium',
            reason: 'Comprehensive solution for growing businesses',
            features: [
                'Professional website and app',
                'Lead management system',
                'Digital marketing tools',
                'Analytics and reporting'
            ],
            pricing: '₹5,000-15,000/month',
            setupTime: '1-2 weeks'
        };
    }

    // Dimension-based scoring for detailed breakdown
    calculateDimensionScores(formData) {
        const dimensions = {
            visibility: this.calculateVisibilityScore(formData),
            engagement: this.calculateEngagementScore(formData),
            automation: this.calculateAutomationScore(formData),
            brandPresentation: this.calculateBrandScore(formData)
        };

        return dimensions;
    }

    calculateVisibilityScore(formData) {
        let score = 0;
        
        // Base score from digital status
        const statusScores = {
            'no_presence': 20,
            'basic_social': 50,
            'basic_website': 75,
            'no_results': 90
        };
        score += statusScores[formData.digitalStatus] || 0;
        
        // Boost for showcase goal
        if (formData.goals.includes('showcase')) {
            score += 15;
        }
        
        return Math.min(score, 100);
    }

    calculateEngagementScore(formData) {
        let score = 30; // Base score
        
        // Score based on goals
        if (formData.goals.includes('more_customers')) score += 30;
        if (formData.goals.includes('brand')) score += 20;
        
        // Challenge awareness
        if (formData.challenge === 'no_leads') score += 20;
        if (formData.challenge === 'low_sales') score += 25;
        
        return Math.min(score, 100);
    }

    calculateAutomationScore(formData) {
        let score = 10; // Base score
        
        // Direct automation goal
        if (formData.goals.includes('automate')) score += 50;
        
        // Budget indicates automation capability
        if (formData.budget === '10k_25k') score += 20;
        if (formData.budget === '25k_plus') score += 30;
        
        // Time constraint indicates need for automation
        if (formData.challenge === 'no_time') score += 20;
        
        return Math.min(score, 100);
    }

    calculateBrandScore(formData) {
        let score = 40; // Base score for existing businesses
        
        // Brand-focused goals
        if (formData.goals.includes('brand')) score += 40;
        if (formData.goals.includes('app')) score += 20;
        
        // Higher budget indicates brand investment capability
        if (formData.budget === '25k_plus') score += 20;
        
        return Math.min(score, 100);
    }

    // Generate insights based on scoring
    generateInsights(scoreData, formData) {
        const insights = [];
        const { totalScore, breakdown, category } = scoreData;

        // Overall readiness insight
        insights.push({
            type: 'overall',
            icon: category.level === 'high' ? '🎉' : category.level === 'medium-high' ? '👍' : '💡',
            title: `You're ${category.label}!`,
            description: this.getReadinessDescription(category.level, totalScore),
            priority: 'high'
        });

        // Specific insights based on weak areas
        Object.entries(breakdown).forEach(([dimension, data]) => {
            if (data.score < 60) {
                insights.push(this.getImprovementInsight(dimension, data.score, formData));
            }
        });

        // Opportunity insights
        if (formData.budget === '25k_plus' && totalScore < 80) {
            insights.push({
                type: 'opportunity',
                icon: '🚀',
                title: 'High Growth Potential',
                description: 'Your budget allows for advanced solutions that could significantly accelerate your digital transformation.',
                priority: 'medium'
            });
        }

        return insights.slice(0, 5); // Limit to top 5 insights
    }

    getReadinessDescription(level, score) {
        const descriptions = {
            'high': `With a score of ${score}/100, you're well-positioned for digital success. Your business shows strong readiness across multiple dimensions.`,
            'medium-high': `Your score of ${score}/100 indicates good digital readiness. A few strategic improvements could unlock significant growth.`,
            'medium': `At ${score}/100, you're on the right track. Focus on strengthening key areas to accelerate your digital journey.`,
            'low-medium': `Your ${score}/100 score shows potential. With the right guidance, you can build a strong digital foundation.`,
            'low': `Starting at ${score}/100 is perfectly fine. Every successful business began somewhere, and you're taking the right first step.`
        };
        
        return descriptions[level] || descriptions['medium'];
    }

    getImprovementInsight(dimension, score, formData) {
        const insights = {
            goals: {
                icon: '🎯',
                title: 'Expand Your Vision',
                description: 'Consider additional goals like automation or branding to maximize your digital potential.',
                priority: 'medium'
            },
            digitalStatus: {
                icon: '🌐',
                title: 'Strengthen Online Presence',
                description: 'Building a more robust digital foundation will significantly improve your readiness score.',
                priority: 'high'
            },
            budget: {
                icon: '💰',
                title: 'Investment Planning',
                description: 'Consider allocating more resources to digital initiatives for better ROI.',
                priority: 'low'
            },
            challenge: {
                icon: '🔍',
                title: 'Problem Clarity',
                description: 'Identifying specific challenges helps us provide more targeted solutions.',
                priority: 'medium'
            }
        };

        return insights[dimension] || {
            icon: '💡',
            title: 'Improvement Opportunity',
            description: 'This area could benefit from focused attention.',
            priority: 'low'
        };
    }

    // Export scoring results for admin dashboard
    exportScoringData(formData) {
        const scoreData = this.calculateOverallScore(formData);
        const dimensionScores = this.calculateDimensionScores(formData);
        const insights = this.generateInsights(scoreData, formData);

        return {
            timestamp: new Date().toISOString(),
            sessionId: formData.sessionId,
            overall: scoreData,
            dimensions: dimensionScores,
            insights: insights,
            formData: {
                goals: formData.goals,
                digitalStatus: formData.digitalStatus,
                budget: formData.budget,
                challenge: formData.challenge
            }
        };
    }
}

// Global instance for use in main application
window.digitalReadinessScorer = new DigitalReadinessScorer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalReadinessScorer;
}