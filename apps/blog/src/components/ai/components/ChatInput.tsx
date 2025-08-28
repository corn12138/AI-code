'use client';

import {
  ArrowPathIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

interface ChatInputProps {
  placeholder?: string;
  maxLength?: number;
  enableAttachments?: boolean;
  enableVoice?: boolean;
  onSend?: (content: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = 'Type your message...',
  maxLength = 4000,
  enableAttachments = true,
  enableVoice = true,
  onSend
}) => {
  const { state, actions } = useChat();
  const { attachments, isLoading, settings } = state;
  const { addAttachment, removeAttachment, sendMessage } = actions;

  const [inputValue, setInputValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech recognition
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported
  } = useSpeechRecognition();

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
    }
  }, [inputValue]);

  // Handle speech recognition
  useEffect(() => {
    if (transcript) {
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const content = inputValue.trim();
    const messageAttachments = [...attachments];

    // Clear input and attachments
    setInputValue('');
    actions.setAttachments([]);

    try {
      if (onSend) {
        onSend(content);
      } else {
        await sendMessage(content, messageAttachments);
      }
    } catch (error) {
      // Restore input on error
      setInputValue(content);
      messageAttachments.forEach(att => addAttachment(att));
    }
  }, [inputValue, attachments, isLoading, onSend, sendMessage, actions, addAttachment]);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (max 10MB)`);
        return;
      }

      const attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') 
          ? 'image' as const
          : file.type.startsWith('audio/')
          ? 'audio' as const
          : file.type.startsWith('video/')
          ? 'video' as const
          : file.type.includes('pdf') || file.type.includes('document')
          ? 'document' as const
          : 'code' as const,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type
      };

      addAttachment(attachment);
    });
  }, [addAttachment]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  }, [handleFileUpload]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape' && isListening) {
      stopListening();
    }
  }, [handleSendMessage, isListening, stopListening]);

  // Toggle voice input
  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const canSend = (inputValue.trim() || attachments.length > 0) && !isLoading;
  const charCount = inputValue.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  {attachment.type === 'image' ? (
                    <PhotoIcon className="w-4 h-4 text-blue-500" />
                  ) : (
                    <DocumentTextIcon className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]" title={attachment.name}>
                    {attachment.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(attachment.size / 1024).toFixed(1)}KB
                  </span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    title="Remove attachment"
                  >
                    <XMarkIcon className="w-3 h-3 text-gray-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div 
        className={`relative ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening...' : placeholder}
              disabled={isLoading || isListening}
              className={`w-full resize-none rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 pr-20 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                isOverLimit
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : isListening
                  ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
              } ${isLoading ? 'opacity-50' : ''}`}
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '128px'
              }}
              maxLength={maxLength}
            />

            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {enableAttachments && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md,.json,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title="Attach file"
                    disabled={isLoading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </>
              )}

              {enableVoice && speechSupported && settings.enableSpeech && (
                <motion.button
                  onClick={toggleVoiceInput}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                  disabled={isLoading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isListening ? (
                    <StopIcon className="w-4 h-4" />
                  ) : (
                    <MicrophoneIcon className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSendMessage}
            disabled={!canSend || isOverLimit}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            title={isLoading ? 'Sending...' : 'Send message'}
            whileHover={canSend && !isOverLimit ? { scale: 1.05 } : {}}
            whileTap={canSend && !isOverLimit ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Character count and model info */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Model: {settings.selectedModel}</span>
          <span className={charCount > maxLength * 0.9 ? 'text-orange-500' : ''}>
            {charCount}{maxLength ? `/${maxLength}` : ''} chars
          </span>
        </div>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Drop files here to attach
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
