import React from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '@/store/editorStore';
import { ComponentModel } from '@/types';
import { useComponentsStore } from '@/store/componentsStore';
import { cloneComponent } from '@/utils/components';

const Canvas: React.FC = () => {
  const { 
    currentPage, 
    addComponent, 
    selectComponent, 
    hoverComponent, 
    hoveredId, 
    selectedId,
    mode,
    canvasScale,
    showGrid
  } = useEditorStore();
  
  // 处理拖放组件
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any, monitor) => {
      // 如果已经有父组件处理了该拖放，则不处理
      if (monitor.didDrop()) {
        return;
      }
      
      // 将组件添加到根组件
      const componentModel: ComponentModel = {
        id: item.id,
        type: item.type,
        name: item.component.name,
        props: item.props,
        style: item.style,
        children: item.component.initialChildren || []
      };
      
      addComponent(componentModel);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [addComponent]);
  
  if (!currentPage) {
    return <div className="h-full flex items-center justify-center text-gray-500">没有加载页面数据</div>;
  }
  
  // 创建根容器样式
  const rootStyle: React.CSSProperties = {
    width: '100%',
    minHeight: mode === 'edit' ? '100%' : 'auto',
    background: 'white',
    boxShadow: mode === 'edit' ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none',
    transform: `scale(${canvasScale})`,
    transformOrigin: 'top left',
    transition: 'transform 0.3s',
  };
  
  return (
    <div 
      ref={drop}
      className={`canvas-container ${isOver ? 'bg-blue-50' : ''} ${mode === 'edit' ? 'p-4' : ''}`}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div 
        className={`canvas ${showGrid && mode === 'edit' ? 'bg-grid' : ''}`}
        style={rootStyle}
      >
        <RenderComponent 
          component={currentPage.components} 
          parentId={null}
          isRoot={true}
          isEditing={mode === 'edit'}
          onSelect={selectComponent}
          onHover={hoverComponent}
          selectedId={selectedId}
          hoveredId={hoveredId}
        />
      </div>
    </div>
  );
};

interface RenderComponentProps {
  component: ComponentModel;
  parentId: string | null;
  isRoot?: boolean;
  isEditing: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  selectedId: string | null;
  hoveredId: string | null;
}

const RenderComponent: React.FC<RenderComponentProps> = ({ 
  component, 
  parentId,
  isRoot = false,
  isEditing,
  onSelect,
  onHover,
  selectedId,
  hoveredId
}) => {
  const { getComponentByType } = useComponentsStore();
  const { addComponent, deleteComponent } = useEditorStore();
  
  const { id, type, props, style, children } = component;
  const componentDef = getComponentByType(type);
  
  if (!componentDef) {
    return <div>未知组件: {type}</div>;
  }
  
  const Component = componentDef.Component;
  const allowChildren = componentDef.allowChildren;
  
  // 处理嵌套组件的拖放
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any, monitor) => {
      // 只有允许包含子组件的组件才能接收拖放
      if (!allowChildren) {
        return;
      }
      
      // 将组件添加到当前组件的子组件中
      const componentModel: ComponentModel = {
        id: item.id,
        type: item.type,
        name: item.component.name,
        props: item.props,
        style: item.style,
        children: item.component.initialChildren || [],
        parent: id
      };
      
      addComponent(componentModel, id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [id, allowChildren, addComponent]);
  
  // 创建组件样式
  const componentStyle: React.CSSProperties = {
    ...style,
    position: 'relative',
  };
  
  // 在编辑模式下添加额外的样式和事件处理
  if (isEditing) {
    const isSelected = selectedId === id;
    const isHovered = hoveredId === id && !isSelected;
    
    Object.assign(componentStyle, {
      outline: isSelected 
        ? '2px solid #2563eb' 
        : isHovered 
          ? '1px dashed #93c5fd'
          : 'none',
      cursor: 'pointer',
    });
  }
  
  // 渲染组件内容
  const renderContent = () => {
    // 根组件特殊处理
    if (isRoot) {
      return (
        <div 
          className="root-component"
          ref={isEditing && allowChildren ? drop : null}
          style={componentStyle}
        >
          {children?.map((child) => (
            <RenderComponent
              key={child.id}
              component={child}
              parentId={id}
              isEditing={isEditing}
              onSelect={onSelect}
              onHover={onHover}
              selectedId={selectedId}
              hoveredId={hoveredId}
            />
          ))}
        </div>
      );
    }
    
    // 普通组件
    return (
      <div
        className={`component ${isOver && allowChildren ? 'bg-blue-50' : ''}`}
        ref={isEditing && allowChildren ? drop : null}
        style={componentStyle}
        onClick={(e) => {
          if (isEditing) {
            e.stopPropagation();
            onSelect(id);
          }
        }}
        onMouseEnter={() => isEditing && onHover(id)}
        onMouseLeave={() => isEditing && onHover(null)}
      >
        {/* 渲染组件 */}
        <Component 
          {...props} 
          style={style}
        >
          {allowChildren && children?.map((child) => (
            <RenderComponent
              key={child.id}
              component={child}
              parentId={id}
              isEditing={isEditing}
              onSelect={onSelect}
              onHover={onHover}
              selectedId={selectedId}
              hoveredId={hoveredId}
            />
          ))}
        </Component>
        
        {/* 编辑模式下添加操作按钮 */}
        {isEditing && selectedId === id && (
          <div className="component-actions absolute top-0 right-0 bg-white border border-gray-200 rounded shadow-sm">
            <button
              className="p-1 text-xs text-red-500 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要删除此组件吗？')) {
                  deleteComponent(id);
                }
              }}
            >
              删除
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return renderContent();
};

export default Canvas;
