'use client';

import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface ChatToggleButtonProps {
  isExpanded: boolean;
  isConnected: boolean;
  unreadCount?: number;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
}

export const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({
  isExpanded,
  isConnected,
  unreadCount = 0,
  isLoading = false,
  onClick,
  className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isExpanded ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <SparklesIcon className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection indicator */}
      <motion.div 
        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
        animate={isConnected ? {} : { scale: [1, 1.2, 1] }}
        transition={isConnected ? {} : { duration: 2, repeat: Infinity }}
      />

      {/* Unread message indicator */}
      <AnimatePresence>
        {unreadCount > 0 && !isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
