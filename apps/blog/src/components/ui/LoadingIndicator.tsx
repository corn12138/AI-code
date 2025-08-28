'use client';

import { LoadingState } from '@corn12138/hooks';
import React from 'react';

interface LoadingIndicatorProps {
    loading: LoadingState;
    className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    loading,
    className = ''
}) => {
    if (!loading.isLoading) return null;

    const renderSpinner = () => (
        <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            {loading.message && (
                <span className="text-sm font-medium text-gray-900">
                    {loading.message}
                </span>
            )}
        </div>
    );

    const renderProgress = () => (
        <div className="flex flex-col space-y-2 min-w-[200px]">
            {loading.message && (
                <span className="text-sm font-medium text-gray-900">
                    {loading.message}
                </span>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loading.progress || 0}%` }}
                />
            </div>
            {loading.progress !== undefined && (
                <span className="text-xs text-gray-500 text-right">
                    {Math.round(loading.progress)}%
                </span>
            )}
        </div>
    );

    const renderSkeleton = () => (
        <div className="animate-pulse">
            <div className="flex space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );

    const renderPulse = () => (
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></div>
            {loading.message && (
                <span className="text-sm font-medium text-gray-900 ml-3">
                    {loading.message}
                </span>
            )}
        </div>
    );

    const renderContent = () => {
        switch (loading.type) {
            case 'progress':
                return renderProgress();
            case 'skeleton':
                return renderSkeleton();
            case 'pulse':
                return renderPulse();
            default:
                return renderSpinner();
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${className}`}
            role="status"
            aria-live="polite"
            aria-busy={loading.isLoading}
        >
            {renderContent()}
        </div>
    );
};
