# useEditor

编辑器状态管理 Hook，专为低代码编辑器设计，提供组件管理、历史记录、撤销重做等完整的编辑器功能。

## 基础用法

```javascript
import { useEditor } from '@ai-code/hooks';

function SimpleEditor() {
  const {
    components,
    selectedComponentId,
    mode,
    addComponent,
    removeComponent,
    selectComponent,
    toggleMode,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditor();

  const addButton = () => {
    addComponent({
      id: `button-${Date.now()}`,
      type: 'Button',
      props: {
        text: '新按钮',
        color: 'primary',
        size: 'medium'
      }
    });
  };

  const addText = () => {
    addComponent({
      id: `text-${Date.now()}`,
      type: 'Text',
      props: {
        content: '新文本',
        fontSize: 16,
        color: '#333'
      }
    });
  };

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* 工具栏 */}
      <div style={{ width: '200px', padding: '16px', borderRight: '1px solid #ddd' }}>
        <h3>组件库</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={addButton}>添加按钮</button>
          <button onClick={addText}>添加文本</button>
        </div>
        
        <hr style={{ margin: '16px 0' }} />
        
        <h3>操作</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={undo} disabled={!canUndo}>撤销</button>
          <button onClick={redo} disabled={!canRedo}>重做</button>
          <button onClick={toggleMode}>
            切换到{mode === 'design' ? '预览' : '设计'}模式
          </button>
        </div>
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, padding: '16px', backgroundColor: '#f5f5f5' }}>
        <h3>画布 ({mode === 'design' ? '设计模式' : '预览模式'})</h3>
        <div style={{ 
          minHeight: '400px', 
          backgroundColor: 'white', 
          padding: '16px',
          border: mode === 'design' ? '2px dashed #ccc' : '1px solid #ddd'
        }}>
          {components.map(component => (
            <div
              key={component.id}
              onClick={() => mode === 'design' && selectComponent(component.id)}
              style={{
                padding: '8px',
                margin: '8px 0',
                border: selectedComponentId === component.id ? '2px solid #007bff' : '1px solid #eee',
                cursor: mode === 'design' ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              {component.type === 'Button' && (
                <button style={{
                  backgroundColor: component.props.color === 'primary' ? '#007bff' : '#6c757d',
                  color: 'white',
                  padding: component.props.size === 'large' ? '12px 24px' : '8px 16px',
                  border: 'none',
                  borderRadius: '4px'
                }}>
                  {component.props.text}
                </button>
              )}
              
              {component.type === 'Text' && (
                <p style={{
                  fontSize: component.props.fontSize + 'px',
                  color: component.props.color,
                  margin: 0
                }}>
                  {component.props.content}
                </p>
              )}
              
              {mode === 'design' && selectedComponentId === component.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {components.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              paddingTop: '100px' 
            }}>
              从左侧添加组件开始设计
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 高级用法

### 属性编辑器

```javascript
import { useEditor } from '@ai-code/hooks';
import React, { useState, useEffect } from 'react';

function AdvancedEditor() {
  const {
    components,
    selectedComponentId,
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent
  } = useEditor();

  const [selectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
    if (selectedComponentId) {
      const component = findComponentById(components, selectedComponentId);
      setSelectedComponent(component);
    } else {
      setSelectedComponent(null);
    }
  }, [selectedComponentId, components]);

  const findComponentById = (components, id) => {
    for (const component of components) {
      if (component.id === id) return component;
      if (component.children) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateComponentProp = (key, value) => {
    if (selectedComponent) {
      updateComponent(selectedComponent.id, {
        props: { ...selectedComponent.props, [key]: value }
      });
    }
  };

  const addContainer = () => {
    addComponent({
      id: `container-${Date.now()}`,
      type: 'Container',
      props: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 4
      },
      children: []
    });
  };

  const addComponentToContainer = (containerId) => {
    addComponent({
      id: `button-${Date.now()}`,
      type: 'Button',
      props: {
        text: '容器内按钮',
        color: 'primary'
      }
    }, containerId);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 250px', height: '600px' }}>
      {/* 组件库 */}
      <div style={{ padding: '16px', borderRight: '1px solid #ddd' }}>
        <h3>组件库</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => addComponent({
            id: `button-${Date.now()}`,
            type: 'Button',
            props: { text: '按钮', color: 'primary', size: 'medium' }
          })}>
            按钮
          </button>
          
          <button onClick={() => addComponent({
            id: `input-${Date.now()}`,
            type: 'Input',
            props: { placeholder: '请输入', type: 'text' }
          })}>
            输入框
          </button>
          
          <button onClick={addContainer}>
            容器
          </button>
        </div>
      </div>

      {/* 画布 */}
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
        <div style={{ 
          minHeight: '500px', 
          backgroundColor: 'white', 
          padding: '16px',
          border: '2px dashed #ccc'
        }}>
          {components.map(component => (
            <ComponentRenderer
              key={component.id}
              component={component}
              selectedId={selectedComponentId}
              onSelect={selectComponent}
              onAddToContainer={addComponentToContainer}
            />
          ))}
        </div>
      </div>

      {/* 属性编辑器 */}
      <div style={{ padding: '16px', borderLeft: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
        <h3>属性编辑器</h3>
        
        {selectedComponent ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>组件类型:</strong> {selectedComponent.type}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>组件ID:</strong> {selectedComponent.id}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedComponent.type === 'Button' && (
                <>
                  <div>
                    <label>按钮文本:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.text || ''}
                      onChange={(e) => updateComponentProp('text', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>颜色:</label>
                    <select
                      value={selectedComponent.props.color || 'primary'}
                      onChange={(e) => updateComponentProp('color', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="primary">主要</option>
                      <option value="secondary">次要</option>
                      <option value="success">成功</option>
                      <option value="danger">危险</option>
                    </select>
                  </div>
                  
                  <div>
                    <label>尺寸:</label>
                    <select
                      value={selectedComponent.props.size || 'medium'}
                      onChange={(e) => updateComponentProp('size', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="small">小</option>
                      <option value="medium">中</option>
                      <option value="large">大</option>
                    </select>
                  </div>
                </>
              )}

              {selectedComponent.type === 'Input' && (
                <>
                  <div>
                    <label>占位符:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.placeholder || ''}
                      onChange={(e) => updateComponentProp('placeholder', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>类型:</label>
                    <select
                      value={selectedComponent.props.type || 'text'}
                      onChange={(e) => updateComponentProp('type', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="text">文本</option>
                      <option value="password">密码</option>
                      <option value="email">邮箱</option>
                      <option value="number">数字</option>
                    </select>
                  </div>
                </>
              )}

              {selectedComponent.type === 'Container' && (
                <>
                  <div>
                    <label>背景色:</label>
                    <input
                      type="color"
                      value={selectedComponent.props.backgroundColor || '#f8f9fa'}
                      onChange={(e) => updateComponentProp('backgroundColor', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>内边距:</label>
                    <input
                      type="number"
                      value={selectedComponent.props.padding || 16}
                      onChange={(e) => updateComponentProp('padding', parseInt(e.target.value))}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => removeComponent(selectedComponent.id)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              删除组件
            </button>
          </div>
        ) : (
          <div style={{ color: '#666' }}>
            选择一个组件以编辑其属性
          </div>
        )}
      </div>
    </div>
  );
}

// 组件渲染器
function ComponentRenderer({ component, selectedId, onSelect, onAddToContainer }) {
  const isSelected = selectedId === component.id;

  const renderComponent = () => {
    switch (component.type) {
      case 'Button':
        return (
          <button style={{
            backgroundColor: getColorValue(component.props.color),
            color: 'white',
            padding: getSizePadding(component.props.size),
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {component.props.text}
          </button>
        );
        
      case 'Input':
        return (
          <input
            type={component.props.type}
            placeholder={component.props.placeholder}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px'
            }}
          />
        );
        
      case 'Container':
        return (
          <div style={{
            backgroundColor: component.props.backgroundColor,
            padding: component.props.padding + 'px',
            borderRadius: component.props.borderRadius + 'px',
            border: '1px dashed #ccc',
            minHeight: '100px',
            position: 'relative'
          }}>
            {component.children && component.children.length > 0 ? (
              component.children.map(child => (
                <ComponentRenderer
                  key={child.id}
                  component={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onAddToContainer={onAddToContainer}
                />
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#999',
                padding: '20px'
              }}>
                <p>空容器</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToContainer(component.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px'
                  }}
                >
                  添加组件
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>未知组件类型: {component.type}</div>;
    }
  };

  const getColorValue = (color) => {
    const colors = {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545'
    };
    return colors[color] || colors.primary;
  };

  const getSizePadding = (size) => {
    const sizes = {
      small: '6px 12px',
      medium: '8px 16px',
      large: '12px 24px'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
      style={{
        margin: '8px 0',
        padding: '4px',
        border: isSelected ? '2px solid #007bff' : '1px solid transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {renderComponent()}
    </div>
  );
}
```

### 拖拽功能

```javascript
import { useEditor } from '@ai-code/hooks';
import { useState } from 'react';

function DragDropEditor() {
  const {
    components,
    selectedComponentId,
    addComponent,
    removeComponent,
    selectComponent
  } = useEditor();

  const [draggedItem, setDraggedItem] = useState(null);

  const componentTypes = [
    { type: 'Button', label: '按钮', icon: '🔘' },
    { type: 'Input', label: '输入框', icon: '📝' },
    { type: 'Text', label: '文本', icon: '📄' },
    { type: 'Image', label: '图片', icon: '🖼️' },
    { type: 'Container', label: '容器', icon: '📦' }
  ];

  const handleDragStart = (e, componentType) => {
    setDraggedItem(componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedItem) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newComponent = createComponent(draggedItem.type, { x, y });
      addComponent(newComponent);
      setDraggedItem(null);
    }
  };

  const createComponent = (type, position) => {
    const baseProps = {
      position: 'absolute',
      left: position.x,
      top: position.y
    };

    switch (type) {
      case 'Button':
        return {
          id: `button-${Date.now()}`,
          type: 'Button',
          props: { 
            ...baseProps,
            text: '按钮', 
            color: 'primary' 
          }
        };
      case 'Input':
        return {
          id: `input-${Date.now()}`,
          type: 'Input',
          props: { 
            ...baseProps,
            placeholder: '请输入' 
          }
        };
      case 'Text':
        return {
          id: `text-${Date.now()}`,
          type: 'Text',
          props: { 
            ...baseProps,
            content: '文本内容' 
          }
        };
      case 'Image':
        return {
          id: `image-${Date.now()}`,
          type: 'Image',
          props: { 
            ...baseProps,
            src: 'https://via.placeholder.com/150',
            width: 150,
            height: 100
          }
        };
      case 'Container':
        return {
          id: `container-${Date.now()}`,
          type: 'Container',
          props: { 
            ...baseProps,
            width: 200,
            height: 150,
            backgroundColor: '#f8f9fa',
            padding: 16
          },
          children: []
        };
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* 组件面板 */}
      <div style={{ 
        width: '250px', 
        padding: '16px', 
        borderRight: '1px solid #ddd',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>组件库</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {componentTypes.map(componentType => (
            <div
              key={componentType.type}
              draggable
              onDragStart={(e) => handleDragStart(e, componentType)}
              style={{
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'grab',
                textAlign: 'center',
                fontSize: '12px',
                userSelect: 'none'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {componentType.icon}
              </div>
              <div>{componentType.label}</div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <h4>使用说明</h4>
          <p style={{ fontSize: '12px', color: '#666' }}>
            将组件拖拽到右侧画布中开始设计
          </p>
        </div>
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3>设计画布</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            拖拽组件到此区域，点击组件进行选择和删除
          </p>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            width: '100%',
            height: '500px',
            backgroundColor: 'white',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {components.map(component => (
            <div
              key={component.id}
              onClick={() => selectComponent(component.id)}
              style={{
                position: 'absolute',
                left: component.props.left,
                top: component.props.top,
                border: selectedComponentId === component.id ? '2px solid #007bff' : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <ComponentDisplay component={component} />
              
              {selectedComponentId === component.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {components.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#999',
              fontSize: '18px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <div>将组件拖拽到这里开始设计</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 组件显示组件
function ComponentDisplay({ component }) {
  switch (component.type) {
    case 'Button':
      return (
        <button style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px'
        }}>
          {component.props.text}
        </button>
      );
      
    case 'Input':
      return (
        <input
          placeholder={component.props.placeholder}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '150px'
          }}
        />
      );
      
    case 'Text':
      return (
        <p style={{ margin: 0, padding: '8px' }}>
          {component.props.content}
        </p>
      );
      
    case 'Image':
      return (
        <img
          src={component.props.src}
          alt="组件图片"
          style={{
            width: component.props.width,
            height: component.props.height,
            objectFit: 'cover',
            border: '1px solid #ddd'
          }}
        />
      );
      
    case 'Container':
      return (
        <div style={{
          width: component.props.width,
          height: component.props.height,
          backgroundColor: component.props.backgroundColor,
          border: '1px dashed #999',
          padding: component.props.padding
        }}>
          <div style={{ color: '#666', fontSize: '12px' }}>
            容器 ({component.children?.length || 0} 个子组件)
          </div>
        </div>
      );
      
    default:
      return <div>未知组件</div>;
  }
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| initialComponents | `EditorComponent[]` | ❌ | 初始组件列表 |

### EditorComponent

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | `string` | ✅ | 组件唯一标识 |
| type | `string` | ✅ | 组件类型 |
| props | `Record<string, any>` | ✅ | 组件属性 |
| children | `EditorComponent[]` | ❌ | 子组件列表 |
| parentId | `string` | ❌ | 父组件ID |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| components | `EditorComponent[]` | 组件列表 |
| selectedComponentId | `string \| null` | 选中的组件ID |
| mode | `'design' \| 'preview'` | 编辑器模式 |
| addComponent | `(component: EditorComponent, parentId?: string) => void` | 添加组件 |
| removeComponent | `(componentId: string) => void` | 删除组件 |
| updateComponent | `(componentId: string, updates: Partial<EditorComponent>) => void` | 更新组件 |
| selectComponent | `(componentId: string \| null) => void` | 选择组件 |
| undo | `() => void` | 撤销操作 |
| redo | `() => void` | 重做操作 |
| toggleMode | `() => void` | 切换模式 |
| canUndo | `boolean` | 是否可以撤销 |
| canRedo | `boolean` | 是否可以重做 |

## 使用场景

### 1. 页面构建器

```javascript
function PageBuilder() {
  const editor = useEditor();
  
  const exportPage = () => {
    const pageData = {
      components: editor.components,
      meta: {
        title: '页面标题',
        description: '页面描述'
      }
    };
    
    console.log('导出页面数据:', pageData);
    
    // 可以保存到服务器或下载为JSON文件
    const blob = new Blob([JSON.stringify(pageData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.json';
    a.click();
  };

  return (
    <div>
      {/* 编辑器界面 */}
      <button onClick={exportPage}>导出页面</button>
    </div>
  );
}
```

### 2. 表单设计器

```javascript
function FormDesigner() {
  const editor = useEditor();
  
  const formComponents = [
    { type: 'Input', label: '输入框' },
    { type: 'Select', label: '下拉框' },
    { type: 'Checkbox', label: '复选框' },
    { type: 'Radio', label: '单选框' },
    { type: 'TextArea', label: '文本域' }
  ];

  const generateFormCode = () => {
    // 根据组件生成表单代码
    const formHTML = editor.components.map(component => {
      switch (component.type) {
        case 'Input':
          return `<input name="${component.props.name}" placeholder="${component.props.placeholder}" />`;
        case 'Select':
          return `<select name="${component.props.name}">...</select>`;
        // ... 其他组件
        default:
          return '';
      }
    }).join('\n');
    
    return formHTML;
  };

  return (
    <div>
      {/* 表单设计器界面 */}
    </div>
  );
}
```

### 3. 移动端UI设计

```javascript
function MobileDesigner() {
  const editor = useEditor();
  
  const mobileComponents = [
    { type: 'Header', label: '头部' },
    { type: 'TabBar', label: '标签栏' },
    { type: 'List', label: '列表' },
    { type: 'Card', label: '卡片' },
    { type: 'Button', label: '按钮' }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px' }}>
        {/* 移动端组件库 */}
      </div>
      
      <div style={{ 
        width: '375px', 
        height: '667px', 
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: 'white'
      }}>
        {/* 移动端预览画布 */}
        {editor.components.map(component => (
          <MobileComponentRenderer 
            key={component.id} 
            component={component} 
          />
        ))}
      </div>
    </div>
  );
}
```

## 最佳实践

### 1. 组件注册系统

```javascript
// 组件注册表
const componentRegistry = {
  Button: {
    render: (props) => <button {...props}>{props.text}</button>,
    defaultProps: { text: '按钮', color: 'primary' },
    propTypes: {
      text: 'string',
      color: 'select',
      size: 'select'
    }
  },
  Input: {
    render: (props) => <input {...props} />,
    defaultProps: { placeholder: '请输入' },
    propTypes: {
      placeholder: 'string',
      type: 'select'
    }
  }
};

function useComponentRegistry() {
  const createComponent = (type) => {
    const config = componentRegistry[type];
    return {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      props: { ...config.defaultProps }
    };
  };

  return { componentRegistry, createComponent };
}
```

### 2. 键盘快捷键

```javascript
function useEditorShortcuts(editor) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              editor.redo();
            } else {
              editor.undo();
            }
            break;
          case 'Delete':
          case 'Backspace':
            if (editor.selectedComponentId) {
              e.preventDefault();
              editor.removeComponent(editor.selectedComponentId);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);
}
```

### 3. 自动保存

```javascript
function useAutoSave(editor, saveInterval = 5000) {
  const [lastSaved, setLastSaved] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 自动保存到 localStorage 或服务器
      localStorage.setItem('editor-state', JSON.stringify({
        components: editor.components,
        timestamp: Date.now()
      }));
      setLastSaved(Date.now());
    }, saveInterval);

    return () => clearInterval(interval);
  }, [editor.components, saveInterval]);

  return { lastSaved };
}
```

## 注意事项

1. **性能优化**：大量组件时建议使用虚拟滚动或分页
2. **内存管理**：及时清理不再使用的组件引用
3. **历史记录**：历史记录数量建议设置上限，避免内存溢出
4. **数据持久化**：重要数据及时保存到后端
5. **组件嵌套**：避免过深的组件嵌套层级，影响性能和用户体验 