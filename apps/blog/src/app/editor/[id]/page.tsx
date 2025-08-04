'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import EnhancedEditor from '@/components/editor/EnhancedEditor';
import { useParams } from 'next/navigation';

export default function EditDraftPage() {
    const params = useParams();
    const draftId = params.id as string;

    return (
        <RequireAuth>
            <EnhancedEditor draftId={draftId} />
        </RequireAuth>
    );
} 