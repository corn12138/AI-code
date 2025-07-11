"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[353],{28353:function(t,n,e){e.r(n),e.d(n,{texts:function(){return o}});const o=[{value:"\u7F16\u8F91\u5668\u72B6\u6001\u7BA1\u7406 Hook\uFF0C\u4E13\u4E3A\u4F4E\u4EE3\u7801\u7F16\u8F91\u5668\u8BBE\u8BA1\uFF0C\u63D0\u4F9B\u7EC4\u4EF6\u7BA1\u7406\u3001\u5386\u53F2\u8BB0\u5F55\u3001\u64A4\u9500\u91CD\u505A\u7B49\u5B8C\u6574\u7684\u7F16\u8F91\u5668\u529F\u80FD\u3002",paraId:0,tocIndex:0},{value:`import { useEditor } from '@ai-code/hooks';

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
      id: \`button-\${Date.now()}\`,
      type: 'Button',
      props: {
        text: '\u65B0\u6309\u94AE',
        color: 'primary',
        size: 'medium'
      }
    });
  };

  const addText = () => {
    addComponent({
      id: \`text-\${Date.now()}\`,
      type: 'Text',
      props: {
        content: '\u65B0\u6587\u672C',
        fontSize: 16,
        color: '#333'
      }
    });
  };

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* \u5DE5\u5177\u680F */}
      <div style={{ width: '200px', padding: '16px', borderRight: '1px solid #ddd' }}>
        <h3>\u7EC4\u4EF6\u5E93</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={addButton}>\u6DFB\u52A0\u6309\u94AE</button>
          <button onClick={addText}>\u6DFB\u52A0\u6587\u672C</button>
        </div>
        
        <hr style={{ margin: '16px 0' }} />
        
        <h3>\u64CD\u4F5C</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={undo} disabled={!canUndo}>\u64A4\u9500</button>
          <button onClick={redo} disabled={!canRedo}>\u91CD\u505A</button>
          <button onClick={toggleMode}>
            \u5207\u6362\u5230{mode === 'design' ? '\u9884\u89C8' : '\u8BBE\u8BA1'}\u6A21\u5F0F
          </button>
        </div>
      </div>

      {/* \u753B\u5E03\u533A\u57DF */}
      <div style={{ flex: 1, padding: '16px', backgroundColor: '#f5f5f5' }}>
        <h3>\u753B\u5E03 ({mode === 'design' ? '\u8BBE\u8BA1\u6A21\u5F0F' : '\u9884\u89C8\u6A21\u5F0F'})</h3>
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
                  \xD7
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
              \u4ECE\u5DE6\u4FA7\u6DFB\u52A0\u7EC4\u4EF6\u5F00\u59CB\u8BBE\u8BA1
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`,paraId:1,tocIndex:1},{value:`import { useEditor } from '@ai-code/hooks';
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
      id: \`container-\${Date.now()}\`,
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
      id: \`button-\${Date.now()}\`,
      type: 'Button',
      props: {
        text: '\u5BB9\u5668\u5185\u6309\u94AE',
        color: 'primary'
      }
    }, containerId);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 250px', height: '600px' }}>
      {/* \u7EC4\u4EF6\u5E93 */}
      <div style={{ padding: '16px', borderRight: '1px solid #ddd' }}>
        <h3>\u7EC4\u4EF6\u5E93</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => addComponent({
            id: \`button-\${Date.now()}\`,
            type: 'Button',
            props: { text: '\u6309\u94AE', color: 'primary', size: 'medium' }
          })}>
            \u6309\u94AE
          </button>
          
          <button onClick={() => addComponent({
            id: \`input-\${Date.now()}\`,
            type: 'Input',
            props: { placeholder: '\u8BF7\u8F93\u5165', type: 'text' }
          })}>
            \u8F93\u5165\u6846
          </button>
          
          <button onClick={addContainer}>
            \u5BB9\u5668
          </button>
        </div>
      </div>

      {/* \u753B\u5E03 */}
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

      {/* \u5C5E\u6027\u7F16\u8F91\u5668 */}
      <div style={{ padding: '16px', borderLeft: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
        <h3>\u5C5E\u6027\u7F16\u8F91\u5668</h3>
        
        {selectedComponent ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>\u7EC4\u4EF6\u7C7B\u578B:</strong> {selectedComponent.type}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>\u7EC4\u4EF6ID:</strong> {selectedComponent.id}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedComponent.type === 'Button' && (
                <>
                  <div>
                    <label>\u6309\u94AE\u6587\u672C:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.text || ''}
                      onChange={(e) => updateComponentProp('text', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>\u989C\u8272:</label>
                    <select
                      value={selectedComponent.props.color || 'primary'}
                      onChange={(e) => updateComponentProp('color', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="primary">\u4E3B\u8981</option>
                      <option value="secondary">\u6B21\u8981</option>
                      <option value="success">\u6210\u529F</option>
                      <option value="danger">\u5371\u9669</option>
                    </select>
                  </div>
                  
                  <div>
                    <label>\u5C3A\u5BF8:</label>
                    <select
                      value={selectedComponent.props.size || 'medium'}
                      onChange={(e) => updateComponentProp('size', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="small">\u5C0F</option>
                      <option value="medium">\u4E2D</option>
                      <option value="large">\u5927</option>
                    </select>
                  </div>
                </>
              )}

              {selectedComponent.type === 'Input' && (
                <>
                  <div>
                    <label>\u5360\u4F4D\u7B26:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.placeholder || ''}
                      onChange={(e) => updateComponentProp('placeholder', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>\u7C7B\u578B:</label>
                    <select
                      value={selectedComponent.props.type || 'text'}
                      onChange={(e) => updateComponentProp('type', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="text">\u6587\u672C</option>
                      <option value="password">\u5BC6\u7801</option>
                      <option value="email">\u90AE\u7BB1</option>
                      <option value="number">\u6570\u5B57</option>
                    </select>
                  </div>
                </>
              )}

              {selectedComponent.type === 'Container' && (
                <>
                  <div>
                    <label>\u80CC\u666F\u8272:</label>
                    <input
                      type="color"
                      value={selectedComponent.props.backgroundColor || '#f8f9fa'}
                      onChange={(e) => updateComponentProp('backgroundColor', e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label>\u5185\u8FB9\u8DDD:</label>
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
              \u5220\u9664\u7EC4\u4EF6
            </button>
          </div>
        ) : (
          <div style={{ color: '#666' }}>
            \u9009\u62E9\u4E00\u4E2A\u7EC4\u4EF6\u4EE5\u7F16\u8F91\u5176\u5C5E\u6027
          </div>
        )}
      </div>
    </div>
  );
}

// \u7EC4\u4EF6\u6E32\u67D3\u5668
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
                <p>\u7A7A\u5BB9\u5668</p>
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
                  \u6DFB\u52A0\u7EC4\u4EF6
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>\u672A\u77E5\u7EC4\u4EF6\u7C7B\u578B: {component.type}</div>;
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
`,paraId:2,tocIndex:3},{value:`import { useEditor } from '@ai-code/hooks';
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
    { type: 'Button', label: '\u6309\u94AE', icon: '\u{1F518}' },
    { type: 'Input', label: '\u8F93\u5165\u6846', icon: '\u{1F4DD}' },
    { type: 'Text', label: '\u6587\u672C', icon: '\u{1F4C4}' },
    { type: 'Image', label: '\u56FE\u7247', icon: '\u{1F5BC}\uFE0F' },
    { type: 'Container', label: '\u5BB9\u5668', icon: '\u{1F4E6}' }
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
          id: \`button-\${Date.now()}\`,
          type: 'Button',
          props: { 
            ...baseProps,
            text: '\u6309\u94AE', 
            color: 'primary' 
          }
        };
      case 'Input':
        return {
          id: \`input-\${Date.now()}\`,
          type: 'Input',
          props: { 
            ...baseProps,
            placeholder: '\u8BF7\u8F93\u5165' 
          }
        };
      case 'Text':
        return {
          id: \`text-\${Date.now()}\`,
          type: 'Text',
          props: { 
            ...baseProps,
            content: '\u6587\u672C\u5185\u5BB9' 
          }
        };
      case 'Image':
        return {
          id: \`image-\${Date.now()}\`,
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
          id: \`container-\${Date.now()}\`,
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
      {/* \u7EC4\u4EF6\u9762\u677F */}
      <div style={{ 
        width: '250px', 
        padding: '16px', 
        borderRight: '1px solid #ddd',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>\u7EC4\u4EF6\u5E93</h3>
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
          <h4>\u4F7F\u7528\u8BF4\u660E</h4>
          <p style={{ fontSize: '12px', color: '#666' }}>
            \u5C06\u7EC4\u4EF6\u62D6\u62FD\u5230\u53F3\u4FA7\u753B\u5E03\u4E2D\u5F00\u59CB\u8BBE\u8BA1
          </p>
        </div>
      </div>

      {/* \u753B\u5E03\u533A\u57DF */}
      <div style={{ flex: 1, padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3>\u8BBE\u8BA1\u753B\u5E03</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            \u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u533A\u57DF\uFF0C\u70B9\u51FB\u7EC4\u4EF6\u8FDB\u884C\u9009\u62E9\u548C\u5220\u9664
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
                  \xD7
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>\u{1F3A8}</div>
              <div>\u5C06\u7EC4\u4EF6\u62D6\u62FD\u5230\u8FD9\u91CC\u5F00\u59CB\u8BBE\u8BA1</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// \u7EC4\u4EF6\u663E\u793A\u7EC4\u4EF6
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
          alt="\u7EC4\u4EF6\u56FE\u7247"
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
            \u5BB9\u5668 ({component.children?.length || 0} \u4E2A\u5B50\u7EC4\u4EF6)
          </div>
        </div>
      );
      
    default:
      return <div>\u672A\u77E5\u7EC4\u4EF6</div>;
  }
}
`,paraId:3,tocIndex:4},{value:"\u53C2\u6570",paraId:4,tocIndex:6},{value:"\u7C7B\u578B",paraId:4,tocIndex:6},{value:"\u5FC5\u586B",paraId:4,tocIndex:6},{value:"\u63CF\u8FF0",paraId:4,tocIndex:6},{value:"initialComponents",paraId:4,tocIndex:6},{value:"EditorComponent[]",paraId:4,tocIndex:6},{value:"\u274C",paraId:4,tocIndex:6},{value:"\u521D\u59CB\u7EC4\u4EF6\u5217\u8868",paraId:4,tocIndex:6},{value:"\u5C5E\u6027",paraId:5,tocIndex:7},{value:"\u7C7B\u578B",paraId:5,tocIndex:7},{value:"\u5FC5\u586B",paraId:5,tocIndex:7},{value:"\u63CF\u8FF0",paraId:5,tocIndex:7},{value:"id",paraId:5,tocIndex:7},{value:"string",paraId:5,tocIndex:7},{value:"\u2705",paraId:5,tocIndex:7},{value:"\u7EC4\u4EF6\u552F\u4E00\u6807\u8BC6",paraId:5,tocIndex:7},{value:"type",paraId:5,tocIndex:7},{value:"string",paraId:5,tocIndex:7},{value:"\u2705",paraId:5,tocIndex:7},{value:"\u7EC4\u4EF6\u7C7B\u578B",paraId:5,tocIndex:7},{value:"props",paraId:5,tocIndex:7},{value:"Record<string, any>",paraId:5,tocIndex:7},{value:"\u2705",paraId:5,tocIndex:7},{value:"\u7EC4\u4EF6\u5C5E\u6027",paraId:5,tocIndex:7},{value:"children",paraId:5,tocIndex:7},{value:"EditorComponent[]",paraId:5,tocIndex:7},{value:"\u274C",paraId:5,tocIndex:7},{value:"\u5B50\u7EC4\u4EF6\u5217\u8868",paraId:5,tocIndex:7},{value:"parentId",paraId:5,tocIndex:7},{value:"string",paraId:5,tocIndex:7},{value:"\u274C",paraId:5,tocIndex:7},{value:"\u7236\u7EC4\u4EF6ID",paraId:5,tocIndex:7},{value:"\u5C5E\u6027",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"components",paraId:6,tocIndex:8},{value:"EditorComponent[]",paraId:6,tocIndex:8},{value:"\u7EC4\u4EF6\u5217\u8868",paraId:6,tocIndex:8},{value:"selectedComponentId",paraId:6,tocIndex:8},{value:"string | null",paraId:6,tocIndex:8},{value:"\u9009\u4E2D\u7684\u7EC4\u4EF6ID",paraId:6,tocIndex:8},{value:"mode",paraId:6,tocIndex:8},{value:"'design' | 'preview'",paraId:6,tocIndex:8},{value:"\u7F16\u8F91\u5668\u6A21\u5F0F",paraId:6,tocIndex:8},{value:"addComponent",paraId:6,tocIndex:8},{value:"(component: EditorComponent, parentId?: string) => void",paraId:6,tocIndex:8},{value:"\u6DFB\u52A0\u7EC4\u4EF6",paraId:6,tocIndex:8},{value:"removeComponent",paraId:6,tocIndex:8},{value:"(componentId: string) => void",paraId:6,tocIndex:8},{value:"\u5220\u9664\u7EC4\u4EF6",paraId:6,tocIndex:8},{value:"updateComponent",paraId:6,tocIndex:8},{value:"(componentId: string, updates: Partial<EditorComponent>) => void",paraId:6,tocIndex:8},{value:"\u66F4\u65B0\u7EC4\u4EF6",paraId:6,tocIndex:8},{value:"selectComponent",paraId:6,tocIndex:8},{value:"(componentId: string | null) => void",paraId:6,tocIndex:8},{value:"\u9009\u62E9\u7EC4\u4EF6",paraId:6,tocIndex:8},{value:"undo",paraId:6,tocIndex:8},{value:"() => void",paraId:6,tocIndex:8},{value:"\u64A4\u9500\u64CD\u4F5C",paraId:6,tocIndex:8},{value:"redo",paraId:6,tocIndex:8},{value:"() => void",paraId:6,tocIndex:8},{value:"\u91CD\u505A\u64CD\u4F5C",paraId:6,tocIndex:8},{value:"toggleMode",paraId:6,tocIndex:8},{value:"() => void",paraId:6,tocIndex:8},{value:"\u5207\u6362\u6A21\u5F0F",paraId:6,tocIndex:8},{value:"canUndo",paraId:6,tocIndex:8},{value:"boolean",paraId:6,tocIndex:8},{value:"\u662F\u5426\u53EF\u4EE5\u64A4\u9500",paraId:6,tocIndex:8},{value:"canRedo",paraId:6,tocIndex:8},{value:"boolean",paraId:6,tocIndex:8},{value:"\u662F\u5426\u53EF\u4EE5\u91CD\u505A",paraId:6,tocIndex:8},{value:`function PageBuilder() {
  const editor = useEditor();
  
  const exportPage = () => {
    const pageData = {
      components: editor.components,
      meta: {
        title: '\u9875\u9762\u6807\u9898',
        description: '\u9875\u9762\u63CF\u8FF0'
      }
    };
    
    console.log('\u5BFC\u51FA\u9875\u9762\u6570\u636E:', pageData);
    
    // \u53EF\u4EE5\u4FDD\u5B58\u5230\u670D\u52A1\u5668\u6216\u4E0B\u8F7D\u4E3AJSON\u6587\u4EF6
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
      {/* \u7F16\u8F91\u5668\u754C\u9762 */}
      <button onClick={exportPage}>\u5BFC\u51FA\u9875\u9762</button>
    </div>
  );
}
`,paraId:7,tocIndex:10},{value:`function FormDesigner() {
  const editor = useEditor();
  
  const formComponents = [
    { type: 'Input', label: '\u8F93\u5165\u6846' },
    { type: 'Select', label: '\u4E0B\u62C9\u6846' },
    { type: 'Checkbox', label: '\u590D\u9009\u6846' },
    { type: 'Radio', label: '\u5355\u9009\u6846' },
    { type: 'TextArea', label: '\u6587\u672C\u57DF' }
  ];

  const generateFormCode = () => {
    // \u6839\u636E\u7EC4\u4EF6\u751F\u6210\u8868\u5355\u4EE3\u7801
    const formHTML = editor.components.map(component => {
      switch (component.type) {
        case 'Input':
          return \`<input name="\${component.props.name}" placeholder="\${component.props.placeholder}" />\`;
        case 'Select':
          return \`<select name="\${component.props.name}">...</select>\`;
        // ... \u5176\u4ED6\u7EC4\u4EF6
        default:
          return '';
      }
    }).join('\\n');
    
    return formHTML;
  };

  return (
    <div>
      {/* \u8868\u5355\u8BBE\u8BA1\u5668\u754C\u9762 */}
    </div>
  );
}
`,paraId:8,tocIndex:11},{value:`function MobileDesigner() {
  const editor = useEditor();
  
  const mobileComponents = [
    { type: 'Header', label: '\u5934\u90E8' },
    { type: 'TabBar', label: '\u6807\u7B7E\u680F' },
    { type: 'List', label: '\u5217\u8868' },
    { type: 'Card', label: '\u5361\u7247' },
    { type: 'Button', label: '\u6309\u94AE' }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px' }}>
        {/* \u79FB\u52A8\u7AEF\u7EC4\u4EF6\u5E93 */}
      </div>
      
      <div style={{ 
        width: '375px', 
        height: '667px', 
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: 'white'
      }}>
        {/* \u79FB\u52A8\u7AEF\u9884\u89C8\u753B\u5E03 */}
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
`,paraId:9,tocIndex:12},{value:`// \u7EC4\u4EF6\u6CE8\u518C\u8868
const componentRegistry = {
  Button: {
    render: (props) => <button {...props}>{props.text}</button>,
    defaultProps: { text: '\u6309\u94AE', color: 'primary' },
    propTypes: {
      text: 'string',
      color: 'select',
      size: 'select'
    }
  },
  Input: {
    render: (props) => <input {...props} />,
    defaultProps: { placeholder: '\u8BF7\u8F93\u5165' },
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
      id: \`\${type.toLowerCase()}-\${Date.now()}\`,
      type,
      props: { ...config.defaultProps }
    };
  };

  return { componentRegistry, createComponent };
}
`,paraId:10,tocIndex:14},{value:`function useEditorShortcuts(editor) {
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
`,paraId:11,tocIndex:15},{value:`function useAutoSave(editor, saveInterval = 5000) {
  const [lastSaved, setLastSaved] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      // \u81EA\u52A8\u4FDD\u5B58\u5230 localStorage \u6216\u670D\u52A1\u5668
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
`,paraId:12,tocIndex:16},{value:"\u6027\u80FD\u4F18\u5316",paraId:13,tocIndex:17},{value:"\uFF1A\u5927\u91CF\u7EC4\u4EF6\u65F6\u5EFA\u8BAE\u4F7F\u7528\u865A\u62DF\u6EDA\u52A8\u6216\u5206\u9875",paraId:13,tocIndex:17},{value:"\u5185\u5B58\u7BA1\u7406",paraId:13,tocIndex:17},{value:"\uFF1A\u53CA\u65F6\u6E05\u7406\u4E0D\u518D\u4F7F\u7528\u7684\u7EC4\u4EF6\u5F15\u7528",paraId:13,tocIndex:17},{value:"\u5386\u53F2\u8BB0\u5F55",paraId:13,tocIndex:17},{value:"\uFF1A\u5386\u53F2\u8BB0\u5F55\u6570\u91CF\u5EFA\u8BAE\u8BBE\u7F6E\u4E0A\u9650\uFF0C\u907F\u514D\u5185\u5B58\u6EA2\u51FA",paraId:13,tocIndex:17},{value:"\u6570\u636E\u6301\u4E45\u5316",paraId:13,tocIndex:17},{value:"\uFF1A\u91CD\u8981\u6570\u636E\u53CA\u65F6\u4FDD\u5B58\u5230\u540E\u7AEF",paraId:13,tocIndex:17},{value:"\u7EC4\u4EF6\u5D4C\u5957",paraId:13,tocIndex:17},{value:"\uFF1A\u907F\u514D\u8FC7\u6DF1\u7684\u7EC4\u4EF6\u5D4C\u5957\u5C42\u7EA7\uFF0C\u5F71\u54CD\u6027\u80FD\u548C\u7528\u6237\u4F53\u9A8C",paraId:13,tocIndex:17}]}}]);
