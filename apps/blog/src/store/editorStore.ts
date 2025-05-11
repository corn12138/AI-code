import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
    title: string;
    content: string;
    isDirty: boolean;
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    resetEditor: () => void;
    saveDraft: () => void;
    loadDraft: () => void;
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set, get) => ({
            title: '',
            content: '',
            isDirty: false,

            setTitle: (title) => set({
                title,
                isDirty: true
            }),

            setContent: (content) => set({
                content,
                isDirty: true
            }),

            resetEditor: () => {
                set({
                    title: '',
                    content: '',
                    isDirty: false
                });

                // 清除本地存储的草稿
                localStorage.removeItem('articleDraft');
            },

            saveDraft: () => {
                const { title, content } = get();
                if (title || content) {
                    const draft = { title, content, savedAt: new Date().toISOString() };
                    localStorage.setItem('articleDraft', JSON.stringify(draft));
                }
            },

            loadDraft: () => {
                const draftJson = localStorage.getItem('articleDraft');
                if (draftJson) {
                    try {
                        const draft = JSON.parse(draftJson);
                        set({
                            title: draft.title || '',
                            content: draft.content || '',
                            isDirty: false
                        });
                    } catch (error) {
                        console.error('Failed to parse draft:', error);
                    }
                }
            },
        }),
        {
            name: 'editor-storage',
            // 只持久化这些字段
            partialize: (state) => ({
                title: state.title,
                content: state.content
            })
        }
    )
);
