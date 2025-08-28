'use client';

// Export main enterprise AI system
export { EnterpriseAISystem } from './EnterpriseAISystem';
export type {
    EnterpriseAIConfig,
    SystemStatus
} from './EnterpriseAISystem';

// Export examples and configurations
export {
    EnterpriseAISystemExample, developmentConfig,
    productionConfig, quickStartExample, runEnterpriseAIExample
} from './examples/CompleteSystemExample';

// Re-export all service modules for convenience
export * from '../langchain/index';
export * from '../llm/index';
export * from '../monitoring/index';
export * from '../realtime/index';
export * from '../tensorflow/index';
export * from '../tools/index';

// Enterprise AI System Builder
export class EnterpriseAIBuilder {
    static createDevelopmentSystem() {
        return new EnterpriseAISystem({
            environment: 'development',
            features: {
                aiChat: true,
                toolExecution: true,
                realtimeUpdates: true,
                performanceMonitoring: true,
                aiModels: true,
                voiceInteraction: false,
                multimodalSupport: false
            },
            security: {
                enableRateLimit: false,
                enableContentFilter: true,
                enableAuditLog: true,
                maxRequestsPerMinute: 1000
            }
        });
    }

    static createProductionSystem() {
        return new EnterpriseAISystem({
            environment: 'production',
            features: {
                aiChat: true,
                toolExecution: true,
                realtimeUpdates: true,
                performanceMonitoring: true,
                aiModels: true,
                voiceInteraction: true,
                multimodalSupport: true
            },
            security: {
                enableRateLimit: true,
                enableContentFilter: true,
                enableAuditLog: true,
                maxRequestsPerMinute: 100
            }
        });
    }

    static createMinimalSystem() {
        return new EnterpriseAISystem({
            environment: 'development',
            features: {
                aiChat: true,
                toolExecution: false,
                realtimeUpdates: false,
                performanceMonitoring: false,
                aiModels: false,
                voiceInteraction: false,
                multimodalSupport: false
            },
            llm: {
                providers: [
                    {
                        id: 'openai-minimal',
                        type: 'openai',
                        apiKey: process.env.OPENAI_API_KEY || '',
                        models: ['gpt-3.5-turbo'],
                        priority: 1
                    }
                ]
            },
            realtime: { enabled: false, url: '', preset: 'DEVELOPMENT' },
            langchain: { enabled: false, preset: 'SIMPLE_QA' },
            monitoring: { enabled: false, preset: 'MINIMAL' },
            tensorflow: { enabled: false, preset: 'MINIMAL' }
        });
    }

    static createCustomSystem(config: Partial<EnterpriseAIConfig>) {
        return new EnterpriseAISystem(config);
    }
}

// Enterprise AI presets for different use cases
export const ENTERPRISE_PRESETS = {
    // Customer service chatbot
    CUSTOMER_SERVICE: {
        environment: 'production' as const,
        features: {
            aiChat: true,
            toolExecution: true,
            realtimeUpdates: true,
            performanceMonitoring: true,
            aiModels: true,
            voiceInteraction: false,
            multimodalSupport: false
        },
        langchain: { enabled: true, preset: 'CONVERSATIONAL_TOOL_AGENT' as const },
        tensorflow: { enabled: true, preset: 'NLP_ADVANCED' as const },
        monitoring: { enabled: true, preset: 'PRODUCTION' as const }
    },

    // Content moderation system
    CONTENT_MODERATION: {
        environment: 'production' as const,
        features: {
            aiChat: false,
            toolExecution: true,
            realtimeUpdates: false,
            performanceMonitoring: true,
            aiModels: true,
            voiceInteraction: false,
            multimodalSupport: true
        },
        tensorflow: { enabled: true, preset: 'FULL_AI' as const },
        monitoring: { enabled: true, preset: 'PRODUCTION' as const }
    },

    // Research and development
    RESEARCH_DEVELOPMENT: {
        environment: 'development' as const,
        features: {
            aiChat: true,
            toolExecution: true,
            realtimeUpdates: true,
            performanceMonitoring: true,
            aiModels: true,
            voiceInteraction: true,
            multimodalSupport: true
        },
        langchain: { enabled: true, preset: 'CONVERSATIONAL_TOOL_AGENT' as const },
        tensorflow: { enabled: true, preset: 'FULL_AI' as const },
        monitoring: { enabled: true, preset: 'DEVELOPMENT' as const }
    },

    // Educational platform
    EDUCATION: {
        environment: 'production' as const,
        features: {
            aiChat: true,
            toolExecution: true,
            realtimeUpdates: true,
            performanceMonitoring: true,
            aiModels: true,
            voiceInteraction: true,
            multimodalSupport: true
        },
        security: {
            enableRateLimit: true,
            enableContentFilter: true,
            enableAuditLog: true,
            maxRequestsPerMinute: 50 // Lower rate limit for educational use
        }
    }
};

// Utility functions
export const EnterpriseUtils = {
    // Create system from preset
    fromPreset: (preset: keyof typeof ENTERPRISE_PRESETS) => {
        const config = ENTERPRISE_PRESETS[preset];
        return new EnterpriseAISystem(config);
    },

    // Validate system configuration
    validateConfig: (config: Partial<EnterpriseAIConfig>): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (config.features?.aiChat && !config.llm?.providers?.length) {
            errors.push('AI Chat enabled but no LLM providers configured');
        }

        if (config.features?.realtimeUpdates && !config.realtime?.enabled) {
            errors.push('Real-time updates enabled but realtime service disabled');
        }

        if (config.features?.aiModels && !config.tensorflow?.enabled) {
            errors.push('AI Models enabled but TensorFlow service disabled');
        }

        if (config.environment === 'production' && !config.monitoring?.enabled) {
            errors.push('Production environment should have monitoring enabled');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Get recommended configuration for use case
    getRecommendedConfig: (useCase: 'chatbot' | 'content-moderation' | 'research' | 'education') => {
        switch (useCase) {
            case 'chatbot':
                return ENTERPRISE_PRESETS.CUSTOMER_SERVICE;
            case 'content-moderation':
                return ENTERPRISE_PRESETS.CONTENT_MODERATION;
            case 'research':
                return ENTERPRISE_PRESETS.RESEARCH_DEVELOPMENT;
            case 'education':
                return ENTERPRISE_PRESETS.EDUCATION;
            default:
                return ENTERPRISE_PRESETS.CUSTOMER_SERVICE;
        }
    }
};
