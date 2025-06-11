'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProviderWrapper } from '../../../../shared/auth/src';

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProviderWrapper>
                {children}
            </AuthProviderWrapper>
        </QueryClientProvider>
    );
}
