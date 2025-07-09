import React, { useCallback, useState } from 'react';

// 组件类型定义
interface Component {
    id: string;
    type: 'button' | 'input' | 'text' | 'div' | 'image';
    props: Record<string, any>;
    style: Record<string, any>;
    children?: Component[];
    parent?: string;
}

// 编辑器状态类型
interface EditorState {
    components: Component[];
    selectedId: string | null;
    history: Component[][];
    historyIndex: number;
    isDragging: boolean;
    dragTarget: string | null;
}

// 简化的 useEditor 实现
function useSimpleEditor() {
    const [state, setState] = useState<EditorState>({
        components: [],
        selectedId: null,
        history: [[]],
        historyIndex: 0,
        isDragging: false,
        dragTarget: null
    });

    // 添加组件
    const addComponent = useCallback((type: Component['type'], parentId?: string) => {
        const newComponent: Component = {
            id: `${type}_${Date.now()}`,
            type,
            props: getDefaultProps(type),
            style: getDefaultStyle(type),
            children: [],
            parent: parentId
        };

        setState(prev => {
            const newComponents = [...prev.components];

            if (parentId) {
                const parent = findComponentById(newComponents, parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(newComponent);
                }
            } else {
                newComponents.push(newComponent);
            }

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(newComponents);

            return {
                ...prev,
                components: newComponents,
                selectedId: newComponent.id,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // 删除组件
    const deleteComponent = useCallback((id: string) => {
        setState(prev => {
            const newComponents = prev.components.filter(comp => comp.id !== id);

            // 递归删除子组件
            const removeFromChildren = (components: Component[]): Component[] => {
                return components.map(comp => ({
                    ...comp,
                    children: comp.children ? removeFromChildren(comp.children.filter(child => child.id !== id)) : []
                }));
            };

            const finalComponents = removeFromChildren(newComponents);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(finalComponents);

            return {
                ...prev,
                components: finalComponents,
                selectedId: prev.selectedId === id ? null : prev.selectedId,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // 更新组件属性
    const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
        setState(prev => {
            const newComponents = [...prev.components];
            const updateComponentRecursive = (components: Component[]): Component[] => {
                return components.map(comp => {
                    if (comp.id === id) {
                        return { ...comp, ...updates };
                    }
                    if (comp.children) {
                        return { ...comp, children: updateComponentRecursive(comp.children) };
                    }
                    return comp;
                });
            };

            const updatedComponents = updateComponentRecursive(newComponents);

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push(updatedComponents);

            return {
                ...prev,
                components: updatedComponents,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    // 选择组件
    const selectComponent = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, selectedId: id }));
    }, []);

    // 撤销/重做
    const undo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex > 0) {
                const newIndex = prev.historyIndex - 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex
                };
            }
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setState(prev => {
            if (prev.historyIndex < prev.history.length - 1) {
                const newIndex = prev.historyIndex + 1;
                return {
                    ...prev,
                    components: prev.history[newIndex],
                    historyIndex: newIndex
                };
            }
            return prev;
        });
    }, []);

    // 清空画布
    const clearCanvas = useCallback(() => {
        setState(prev => {
            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([]);

            return {
                ...prev,
                components: [],
                selectedId: null,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    return {
        ...state,
        addComponent,
        deleteComponent,
        updateComponent,
        selectComponent,
        undo,
        redo,
        clearCanvas,
        canUndo: state.historyIndex > 0,
        canRedo: state.historyIndex < state.history.length - 1
    };
}

// 工具函数
function getDefaultProps(type: Component['type']): Record<string, any> {
    switch (type) {
        case 'button':
            return { children: '按钮', onClick: 'console.log("clicked")' };
        case 'input':
            return { placeholder: '请输入内容', type: 'text' };
        case 'text':
            return { children: '文本内容' };
        case 'div':
            return { children: '容器' };
        case 'image':
            return { src: 'https://via.placeholder.com/150x100', alt: '图片' };
        default:
            return {};
    }
}

function getDefaultStyle(type: Component['type']): Record<string, any> {
    const baseStyle = {
        margin: '8px',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    };

    switch (type) {
        case 'button':
            return { ...baseStyle, background: '#1890ff', color: 'white', cursor: 'pointer' };
        case 'input':
            return { ...baseStyle, width: '200px' };
        case 'text':
            return { ...baseStyle, border: 'none', background: 'transparent' };
        case 'div':
            return { ...baseStyle, minHeight: '100px', background: '#f5f5f5' };
        case 'image':
            return { ...baseStyle, maxWidth: '150px', height: 'auto' };
        default:
            return baseStyle;
    }
}

function findComponentById(components: Component[], id: string): Component | null {
    for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
            const found = findComponentById(comp.children, id);
            if (found) return found;
        }
    }
    return null;
}

// 组件渲染器
function ComponentRenderer({
    component,
    isSelected,
    onSelect,
    onDelete
}: {
    component: Component;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(component.id);
    };

    const renderElement = () => {
        const style = {
            ...component.style,
            position: 'relative' as const,
            outline: isSelected ? '2px solid #1890ff' : 'none',
            cursor: 'pointer'
        };

        switch (component.type) {
            case 'button':
                return (
                    <button style={style} onClick={handleClick}>
                        {component.props.children}
                    </button>
                );
            case 'input':
                return (
                    <input
                        style={style}
                        placeholder={component.props.placeholder}
                        type={component.props.type}
                        onClick={handleClick}
                        readOnly
                    />
                );
            case 'text':
                return (
                    <span style={style} onClick={handleClick}>
                        {component.props.children}
                    </span>
                );
            case 'div':
                return (
                    <div style={style} onClick={handleClick}>
                        {component.props.children}
                        {component.children?.map(child => (
                            <ComponentRenderer
                                key={child.id}
                                component={child}
                                isSelected={false}
                                onSelect={onSelect}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                );
            case 'image':
                return (
                    <img
                        style={style}
                        src={component.props.src}
                        alt={component.props.alt}
                        onClick={handleClick}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {renderElement()}
            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(component.id);
                    }}
                    style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '20px',
                        height: '20px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}

// 属性编辑器
function PropertyEditor({
    component,
    onUpdate
}: {
    component: Component | null;
    onUpdate: (id: string, updates: Partial<Component>) => void;
}) {
    if (!component) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                请选择一个组件进行编辑
            </div>
        );
    }

    const handlePropChange = (key: string, value: any) => {
        onUpdate(component.id, {
            props: { ...component.props, [key]: value }
        });
    };

    const handleStyleChange = (key: string, value: any) => {
        onUpdate(component.id, {
            style: { ...component.style, [key]: value }
        });
    };

    return (
        <div style={{ padding: '16px' }}>
            <h6 style={{ margin: '0 0 12px 0' }}>属性编辑</h6>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>组件信息</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div>ID: {component.id}</div>
                    <div>类型: {component.type}</div>
                </div>
            </div>

            {/* 属性编辑 */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>属性</div>

                {component.type === 'button' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            按钮文字
                        </label>
                        <input
                            type="text"
                            value={component.props.children || ''}
                            onChange={(e) => handlePropChange('children', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'input' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            占位符
                        </label>
                        <input
                            type="text"
                            value={component.props.placeholder || ''}
                            onChange={(e) => handlePropChange('placeholder', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'text' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            文本内容
                        </label>
                        <input
                            type="text"
                            value={component.props.children || ''}
                            onChange={(e) => handlePropChange('children', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}

                {component.type === 'image' && (
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            图片地址
                        </label>
                        <input
                            type="text"
                            value={component.props.src || ''}
                            onChange={(e) => handlePropChange('src', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* 样式编辑 */}
            <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>样式</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            背景色
                        </label>
                        <input
                            type="color"
                            value={component.style.background || '#ffffff'}
                            onChange={(e) => handleStyleChange('background', e.target.value)}
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            文字色
                        </label>
                        <input
                            type="color"
                            value={component.style.color || '#000000'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            内边距
                        </label>
                        <input
                            type="text"
                            value={component.style.padding || ''}
                            onChange={(e) => handleStyleChange('padding', e.target.value)}
                            placeholder="8px"
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                            圆角
                        </label>
                        <input
                            type="text"
                            value={component.style.borderRadius || ''}
                            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                            placeholder="4px"
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EditorDemo() {
    const editor = useSimpleEditor();
    const [draggedType, setDraggedType] = useState<Component['type'] | null>(null);

    const componentTypes: Array<{ type: Component['type']; label: string; icon: string }> = [
        { type: 'button', label: '按钮', icon: '🔘' },
        { type: 'input', label: '输入框', icon: '📝' },
        { type: 'text', label: '文本', icon: '📄' },
        { type: 'div', label: '容器', icon: '📦' },
        { type: 'image', label: '图片', icon: '🖼️' }
    ];

    const handleDragStart = (type: Component['type']) => {
        setDraggedType(type);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedType) {
            editor.addComponent(draggedType);
            setDraggedType(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const selectedComponent = editor.components.find(comp => comp.id === editor.selectedId) || null;

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>🎨 低代码编辑器演示</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 250px', gap: '16px', height: '500px' }}>
                {/* 组件库 */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f9f9f9'
                }}>
                    <h6 style={{ margin: '0 0 12px 0' }}>组件库</h6>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {componentTypes.map((type) => (
                            <div
                                key={type.type}
                                draggable
                                onDragStart={() => handleDragStart(type.type)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'grab',
                                    fontSize: '12px'
                                }}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h6 style={{ margin: '0 0 12px 0' }}>操作</h6>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={editor.undo}
                                disabled={!editor.canUndo}
                                style={{
                                    padding: '6px',
                                    background: editor.canUndo ? '#1890ff' : '#f5f5f5',
                                    color: editor.canUndo ? 'white' : '#999',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: editor.canUndo ? 'pointer' : 'not-allowed',
                                    fontSize: '12px'
                                }}
                            >
                                ↶ 撤销
                            </button>

                            <button
                                onClick={editor.redo}
                                disabled={!editor.canRedo}
                                style={{
                                    padding: '6px',
                                    background: editor.canRedo ? '#1890ff' : '#f5f5f5',
                                    color: editor.canRedo ? 'white' : '#999',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: editor.canRedo ? 'pointer' : 'not-allowed',
                                    fontSize: '12px'
                                }}
                            >
                                ↷ 重做
                            </button>

                            <button
                                onClick={editor.clearCanvas}
                                style={{
                                    padding: '6px',
                                    background: '#ff4d4f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                🗑️ 清空
                            </button>
                        </div>
                    </div>
                </div>

                {/* 画布区域 */}
                <div
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        background: 'white',
                        minHeight: '400px',
                        position: 'relative'
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => editor.selectComponent(null)}
                >
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '12px',
                        color: '#999'
                    }}>
                        画布 ({editor.components.length} 个组件)
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        {editor.components.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '200px',
                                color: '#999',
                                fontSize: '14px',
                                border: '2px dashed #ddd',
                                borderRadius: '8px'
                            }}>
                                拖拽组件到这里开始设计
                            </div>
                        ) : (
                            editor.components.map(component => (
                                <ComponentRenderer
                                    key={component.id}
                                    component={component}
                                    isSelected={component.id === editor.selectedId}
                                    onSelect={editor.selectComponent}
                                    onDelete={editor.deleteComponent}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* 属性面板 */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px',
                        background: '#1890ff',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        属性面板
                    </div>

                    <PropertyEditor
                        component={selectedComponent}
                        onUpdate={editor.updateComponent}
                    />
                </div>
            </div>

            {/* 编辑器状态 */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f0f2f5',
                borderRadius: '6px'
            }}>
                <h6 style={{ margin: '0 0 8px 0' }}>编辑器状态：</h6>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div><strong>组件数量:</strong> {editor.components.length}</div>
                    <div><strong>选中组件:</strong> {editor.selectedId || '无'}</div>
                    <div><strong>历史记录:</strong> {editor.historyIndex + 1} / {editor.history.length}</div>
                    <div><strong>可撤销:</strong> {editor.canUndo ? '是' : '否'}</div>
                    <div><strong>可重做:</strong> {editor.canRedo ? '是' : '否'}</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                💡 提示：从左侧组件库拖拽组件到画布，点击组件进行选择，在右侧属性面板中编辑组件属性！
            </div>
        </div>
    );
} 