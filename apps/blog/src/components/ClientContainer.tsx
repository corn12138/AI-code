'use client';

import React from 'react';

interface ClientContainerProps {
    children: React.ReactNode;
}

export default function ClientContainer({ children }: ClientContainerProps) {
    return <>{children}</>;
}
