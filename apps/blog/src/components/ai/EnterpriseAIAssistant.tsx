'use client';

import { AnimatePresence } from 'framer-motion';
import React, { useState, useCallback, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import { ChatContainer } from './components/ChatContainer';
import { ChatToggleButton } from './components/ChatToggleButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LLMManager } from '../../services/llm/LLMManager';
import { ToolRegistry } from '../../services/tools/ToolRegistry';

interface EnterpriseAIAssistantProps {
  // Configuration
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enablePersistence?: boolean;
  enableMetrics?: boolean;
  enableVirtualization?: boolean;
  maxChatWidth?: string;
  maxChatHeight?: string;
  
  // Theming
  theme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  
  // API Configuration
  llmConfig?: {
    providers: Array<{
      name: string;
      apiKey: string;
      baseURL?: string;
      models: string[];
    }>;
    defaultModel?: string;
    routingStrategy?: 'priority' | 'round-robin' | 'cost-optimized';
  };
  
  // Features
  enabledFeatures?: {
    voice?: boolean;
    attachments?: boolean;
    tools?: boolean;
    streaming?: boolean;
    threads?: boolean;
  };
  
  // Callbacks
  onMessageSent?: (message: string) => void;
  onError?: (error: Error) => void;
  onMetricsUpdate?: (metrics: any) => void;
  
  // Custom components
  customMessageRenderer?: React.ComponentType<any>;
  customSettingsPanel?: React.ComponentType<any>;
}

export const EnterpriseAIAssistant: React.FC<EnterpriseAIAssistantProps> = ({
  position = 'bottom-right',
  enablePersistence = true,
  enableMetrics = true,
  enableVirtualization = true,
  maxChatWidth = '96',
  maxChatHeight = '600px',
  theme = 'auto',
  accentColor = 'blue',
  llmConfig,
  enabledFeatures = {
    voice: true,
    attachments: true,
    tools: true,
    streaming: true,
    threads: true
  },
  onMessageSent,
  onError,
  onMetricsUpdate,
  customMessageRenderer,
  customSettingsPanel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize services
  const [llmManager] = useState(() => {
    const manager = new LLMManager({
      routingStrategy: llmConfig?.routingStrategy || 'priority',
      costOptimization: {
        enabled: true,
        maxCostPerRequest: 1.0,
        dailyBudget: 10.0
      },
      monitoring: {
        enabled: enableMetrics,
        retentionDays: 7
      }
    });

    // Add configured providers
    llmConfig?.providers?.forEach(provider => {
      // This would be implemented based on your LLM manager's provider registration
      console.log('Adding provider:', provider.name);
    });

    return manager;
  });

  const [toolRegistry] = useState(() => new ToolRegistry());

  // Position classes
  const getPositionClasses = useCallback(() => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  }, [position]);

  // Handle theme
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsExpanded(prev => {
      const newExpanded = !prev;
      if (newExpanded) {
        setUnreadCount(0); // Clear unread count when opening
      }
      return newExpanded;
    });
  }, []);

  // Close chat
  const closeChat = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Handle errors
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Enterprise AI Assistant Error:', error, errorInfo);
    
    if (onError) {
      onError(error);
    }

    // Report to monitoring service
    // This would integrate with your error reporting service
  }, [onError]);

  // Handle message sent
  const handleMessageSent = useCallback((message: string) => {
    if (onMessageSent) {
      onMessageSent(message);
    }
  }, [onMessageSent]);

  return (
    <ErrorBoundary
      onError={handleError}
      resetKeys={[isExpanded]}
      maxRetries={3}
    >
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <ChatProvider 
          llmManager={llmManager}
          toolRegistry={toolRegistry}
        >
          {/* Main Chat Interface */}
          <AnimatePresence>
            {isExpanded && (
              <div className="mb-4">
                <ChatContainer
                  onClose={closeChat}
                  enableVirtualization={enableVirtualization}
                  enableMetrics={enableMetrics}
                  maxWidth={maxChatWidth}
                  maxHeight={maxChatHeight}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <ChatToggleButton
            isExpanded={isExpanded}
            isConnected={isConnected}
            unreadCount={unreadCount}
            isLoading={isLoading}
            onClick={toggleChat}
          />
        </ChatProvider>

        {/* Accessibility announcements */}
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {isExpanded ? 'AI Assistant opened' : 'AI Assistant closed'}
        </div>
      </div>
    </ErrorBoundary>
  );
};
