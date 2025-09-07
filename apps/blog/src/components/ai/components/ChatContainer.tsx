'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { ChatSettings } from '../ChatSettings';
import { useChat } from '../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ErrorBoundary } from './ErrorBoundary';
import { MessageList } from './MessageList';

interface ChatContainerProps {
  onClose: () => void;
  className?: string;
  enableVirtualization?: boolean;
  enableMetrics?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onClose,
  className = '',
  enableVirtualization = true,
  enableMetrics = true,
  maxWidth = '96',
  maxHeight = '600px'
}) => {
  const { state, actions } = useChat();
  const [showSettings, setShowSettings] = useState(false);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showSettings) {
        onClose();
      } else if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showSettings]);

  // Handle outside click to close settings
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && showSettings) {
      setShowSettings(false);
    }
  }, [showSettings]);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Chat container error:', error, errorInfo);
        // Report to monitoring service
      }}
      resetKeys={[state.selectedThread]}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={`w-${maxWidth} max-w-[calc(100vw-2rem)] bg-space-900/90 backdrop-blur-xl rounded-2xl shadow-cosmic border border-cosmic-500/20 flex flex-col overflow-hidden ${className}`}
        style={{ height: maxHeight }}
        onClick={handleBackdropClick}
      >
        {/* Header */}
        <ChatHeader
          onToggleSettings={toggleSettings}
          onClose={onClose}
          showMetrics={enableMetrics}
        />

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-cosmic-500/20 overflow-hidden"
            >
              <div className="p-4 bg-space-800/40 backdrop-blur-sm">
                <ErrorBoundary
                  fallback={
                    <div className="text-center py-4 text-red-400">
                      Settings panel failed to load
                    </div>
                  }
                >
                  <ChatSettings
                    selectedModel={state.settings.selectedModel}
                    onModelChange={(model) => actions.updateSettings({ selectedModel: model })}
                    availableModels={[
                      'gpt-4',
                      'gpt-4-turbo',
                      'gpt-3.5-turbo',
                      'claude-3-opus',
                      'claude-3-sonnet',
                      'claude-3-haiku'
                    ]}
                    modelCapabilities={{
                      'gpt-4': {
                        maxTokens: 8192,
                        supportsFunctions: true,
                        supportsVision: true,
                        costPer1kTokens: 0.03
                      },
                      'gpt-4-turbo': {
                        maxTokens: 128000,
                        supportsFunctions: true,
                        supportsVision: true,
                        costPer1kTokens: 0.01
                      },
                      'gpt-3.5-turbo': {
                        maxTokens: 4096,
                        supportsFunctions: true,
                        supportsVision: false,
                        costPer1kTokens: 0.002
                      },
                      'claude-3-opus': {
                        maxTokens: 200000,
                        supportsFunctions: true,
                        supportsVision: true,
                        costPer1kTokens: 0.015
                      },
                      'claude-3-sonnet': {
                        maxTokens: 200000,
                        supportsFunctions: true,
                        supportsVision: true,
                        costPer1kTokens: 0.003
                      },
                      'claude-3-haiku': {
                        maxTokens: 200000,
                        supportsFunctions: true,
                        supportsVision: false,
                        costPer1kTokens: 0.00025
                      }
                    }}
                    settings={state.settings}
                    onSettingsChange={actions.updateSettings}
                  />
                </ErrorBoundary>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Container */}
        <div className="flex-1 min-h-0 relative">
          <ErrorBoundary
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-space-200 mb-2">
                    Chat temporarily unavailable
                  </h3>
                  <p className="text-space-400">
                    Please refresh the page or try again later
                  </p>
                </div>
              </div>
            }
            resetKeys={[state.messages.length]}
          >
            <MessageList
              enableVirtualization={enableVirtualization}
              showTimestamps={true}
              groupMessages={true}
            />
          </ErrorBoundary>
        </div>

        {/* Input Area */}
        <ErrorBoundary
          fallback={
            <div className="p-4 border-t border-cosmic-500/20">
              <div className="text-center text-red-400">
                Input temporarily unavailable
              </div>
            </div>
          }
        >
          <ChatInput
            placeholder="Type your message..."
            maxLength={4000}
            enableAttachments={true}
            enableVoice={state.settings.enableSpeech}
          />
        </ErrorBoundary>
      </motion.div>
    </ErrorBoundary>
  );
};
