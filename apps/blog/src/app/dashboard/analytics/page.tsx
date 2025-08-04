'use client';

import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import RequireAuth from '@/components/auth/RequireAuth';

export default function AnalyticsPage() {
    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <AdvancedAnalytics />
                </div>
            </div>
        </RequireAuth>
    );
} 