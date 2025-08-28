'use client';

import {
  CogIcon,
  SparklesIcon,
  XMarkIcon,
  SignalIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';
import { useChat } from '../context/ChatContext';

interface ChatHeaderProps {
  onToggleSettings: () => void;
  onClose: () => void;
  showMetrics?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSettings,
  onClose,
  showMetrics = false
}) => {
  const { state } = useChat();
  const { isConnected, settings, metrics } = state;

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`;
  };

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and status */}
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <SparklesIcon className="w-5 h-5 text-white" />
          </motion.div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h3>
            <div className="flex items-center space-x-3 text-xs">
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Current Model */}
              <div className="flex items-center space-x-1">
                <CpuChipIcon className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  {settings.selectedModel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Metrics (if enabled) */}
        {showMetrics && (
          <motion.div 
            className="hidden md:flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-1">
              <SignalIcon className="w-3 h-3" />
              <span>{metrics.totalMessages} msgs</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatTime(metrics.averageResponseTime)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>💰</span>
              <span>{formatCost(metrics.totalCost)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>{metrics.successRate.toFixed(1)}%</span>
            </div>
          </motion.div>
        )}

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onToggleSettings}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <CogIcon className="w-5 h-5 text-gray-500" />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </span>
            <button
              onClick={() => {
                // Clear error action would go here
              }}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
