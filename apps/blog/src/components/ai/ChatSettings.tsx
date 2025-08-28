'use client';

import {
    AdjustmentsHorizontalIcon,
    BoltIcon,
    ChartBarIcon,
    ClockIcon,
    CpuChipIcon,
    FireIcon,
    GlobeAltIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { ChatSettings as ChatSettingsType } from './context/ChatContext';

interface ModelCapability {
    name: string;
    maxTokens: number;
    multimodal: boolean;
    tools: boolean;
    streaming: boolean;
    languages: string[];
    costPerToken: number;
    speed: 'fast' | 'medium' | 'slow';
}

interface ChatSettingsProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
    availableModels: Record<string, ModelCapability>;
    modelCapabilities: Record<string, ModelCapability>;
    settings?: ChatSettingsType;
    onSettingsChange?: (settings: Partial<ChatSettingsType>) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
    selectedModel,
    onModelChange,
    availableModels,
    modelCapabilities,
    settings,
    onSettingsChange
}) => {
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1000);
    const [topP, setTopP] = useState(0.9);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [enableTools, setEnableTools] = useState(true);
    const [enableMemory, setEnableMemory] = useState(true);
    const [streamingMode, setStreamingMode] = useState(true);

    const currentModel = modelCapabilities[selectedModel];

    // 预设温度配置
    const temperaturePresets = [
        { name: 'Creative', value: 1.0, icon: FireIcon, description: 'More creative and diverse responses' },
        { name: 'Balanced', value: 0.7, icon: AdjustmentsHorizontalIcon, description: 'Good balance of creativity and focus' },
        { name: 'Focused', value: 0.3, icon: BoltIcon, description: 'More focused and deterministic responses' },
        { name: 'Precise', value: 0.1, icon: ShieldCheckIcon, description: 'Very focused and consistent responses' }
    ];

    const handlePresetSelect = useCallback((preset: number) => {
        setTemperature(preset);
    }, []);

    const getSpeedIcon = (speed: string) => {
        switch (speed) {
            case 'fast': return <BoltIcon className="w-4 h-4 text-green-500" />;
            case 'medium': return <ChartBarIcon className="w-4 h-4 text-yellow-500" />;
            case 'slow': return <ClockIcon className="w-4 h-4 text-red-500" />;
            default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatCost = (cost: number) => {
        if (cost < 0.001) return '<$0.001';
        return `$${cost.toFixed(3)}`;
    };

    return (
        <div className="p-4 space-y-6">
            {/* Model Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Model Selection
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(availableModels).map(([modelId, model]) => (
                        <motion.div
                            key={modelId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedModel === modelId
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => onModelChange(modelId)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                                        {getSpeedIcon(model.speed)}
                                        {model.multimodal && (
                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                                Vision
                                            </span>
                                        )}
                                        {model.tools && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                                Tools
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Max: {model.maxTokens.toLocaleString()} tokens</span>
                                        <span>Cost: {formatCost(model.costPerToken)}/token</span>
                                    </div>
                                </div>
                                <CpuChipIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Temperature Presets */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Response Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {temperaturePresets.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = Math.abs(temperature - preset.value) < 0.05;

                        return (
                            <motion.button
                                key={preset.name}
                                onClick={() => handlePresetSelect(preset.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center space-x-2">
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <span className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                                        {preset.name}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {preset.description}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced Settings */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Advanced Parameters
                </label>

                <div className="space-y-4">
                    {/* Temperature Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Temperature</label>
                            <span className="text-sm font-mono text-gray-900 dark:text-white">{temperature.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Focused</span>
                            <span>Creative</span>
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Max Tokens</label>
                            <span className="text-sm font-mono text-gray-900 dark:text-white">{maxTokens}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max={currentModel?.maxTokens || 4000}
                            step="100"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Top P */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Top P</label>
                            <span className="text-sm font-mono text-gray-900 dark:text-white">{topP.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Penalty Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-gray-600 dark:text-gray-400">Presence</label>
                                <span className="text-sm font-mono text-gray-900 dark:text-white">{presencePenalty.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={presencePenalty}
                                onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-gray-600 dark:text-gray-400">Frequency</label>
                                <span className="text-sm font-mono text-gray-900 dark:text-white">{frequencyPenalty.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={frequencyPenalty}
                                onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Toggles */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Features
                </label>
                <div className="space-y-3">
                    {currentModel?.tools && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CpuChipIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Tool Usage</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow AI to use external tools</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableTools}
                                    onChange={(e) => setEnableTools(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Conversation Memory</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Remember context across messages</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableMemory}
                                onChange={(e) => setEnableMemory(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {currentModel?.streaming && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BoltIcon className="w-5 h-5 text-gray-500" />
                                <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Streaming Response</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Show response as it's generated</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={streamingMode}
                                    onChange={(e) => setStreamingMode(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* System Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    System Prompt
                </label>
                <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter custom system instructions..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Custom instructions that will be included with every message
                </p>
            </div>

            {/* Cost Estimation */}
            {currentModel && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Estimated Cost per Message
                        </span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {formatCost(currentModel.costPerToken * maxTokens)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Based on {maxTokens} tokens at {formatCost(currentModel.costPerToken)} per token
                    </p>
                </div>
            )}
        </div>
    );
};
