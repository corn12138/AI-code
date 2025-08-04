'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import EnhancedEditor from '@/components/editor/EnhancedEditor';

export default function EditorPage() {
  return (
    <RequireAuth>
      <EnhancedEditor />
    </RequireAuth>
  );
}
