import { useCallback, useState } from 'react';

export interface EditorComponent {
    id: string;
    type: string;
    props: Record<string, any>;
    children?: EditorComponent[];
    parentId?: string;
}

export interface EditorState {
    components: EditorComponent[];
    selectedComponentId: string | null;
    draggedComponent: EditorComponent | null;
    history: EditorComponent[][];
    historyIndex: number;
    mode: 'design' | 'preview';
}

/**
 * 编辑器状态管理Hook
 * 用于lowcode编辑器的组件管理
 */
export function useEditor(initialComponents: EditorComponent[] = []) {
    const [state, setState] = useState<EditorState>({
        components: initialComponents,
        selectedComponentId: null,
        draggedComponent: null,
        history: [initialComponents],
        historyIndex: 0,
        mode: 'design',
    });

    // 添加组件
    const addComponent = useCallback((component: EditorComponent, parentId?: string) => {
        setState(prev => {
            const newComponents = [...prev.components];

            if (parentId) {
                const parent = findComponentById(newComponents, parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push({ ...component, parentId });
                }
            } else {
                newComponents.push(component);
            }

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(newComponents);

            return {
                ...prev,
                components: newComponents,
                history: newHistory,
                historyIndex: newHistory.length - 1,
            };
        });
    }, []);

    // 删除组件
    const removeComponent = useCallback((componentId: string) => {
        setState(prev => {
            const newComponents = removeComponentById([...prev.components], componentId);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(newComponents);

            return {
                ...prev,
                components: newComponents,
                selectedComponentId: prev.selectedComponentId === componentId ? null : prev.selectedComponentId,
                history: newHistory,
                historyIndex: newHistory.length - 1,
            };
        });
    }, []);

    // 更新组件属性
    const updateComponent = useCallback((componentId: string, updates: Partial<EditorComponent>) => {
        setState(prev => {
            const newComponents = updateComponentById([...prev.components], componentId, updates);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(newComponents);

            return {
                ...prev,
                components: newComponents,
                history: newHistory,
                historyIndex: newHistory.length - 1,
            };
        });
    }, []);

    // 选择组件
    const selectComponent = useCallback((componentId: string | null) => {
        setState(prev => ({
            ...prev,
            selectedComponentId: componentId,
        }));
    }, []);

    // 撤销
    const undo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex > 0) {
                const newIndex = prev.historyIndex - 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex,
                };
            }
            return prev;
        });
    }, []);

    // 重做
    const redo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex < prev.history.length - 1) {
                const newIndex = prev.historyIndex + 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex,
                };
            }
            return prev;
        });
    }, []);

    // 切换模式
    const toggleMode = useCallback(() => {
        setState(prev => ({
            ...prev,
            mode: prev.mode === 'design' ? 'preview' : 'design',
        }));
    }, []);

    return {
        ...state,
        addComponent,
        removeComponent,
        updateComponent,
        selectComponent,
        undo,
        redo,
        toggleMode,
        canUndo: state.historyIndex > 0,
        canRedo: state.historyIndex < state.history.length - 1,
    };
}

// 辅助函数
function findComponentById(components: EditorComponent[], id: string): EditorComponent | null {
    for (const component of components) {
        if (component.id === id) return component;
        if (component.children) {
            const found = findComponentById(component.children, id);
            if (found) return found;
        }
    }
    return null;
}

function removeComponentById(components: EditorComponent[], id: string): EditorComponent[] {
    return components.filter(component => {
        if (component.id === id) return false;
        if (component.children) {
            component.children = removeComponentById(component.children, id);
        }
        return true;
    });
}

function updateComponentById(
    components: EditorComponent[],
    id: string,
    updates: Partial<EditorComponent>
): EditorComponent[] {
    return components.map(component => {
        if (component.id === id) {
            return { ...component, ...updates };
        }
        if (component.children) {
            return {
                ...component,
                children: updateComponentById(component.children, id, updates),
            };
        }
        return component;
    });
} 