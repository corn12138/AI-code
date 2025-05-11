import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useComponentsStore } from '@/store/componentsStore';
import { v4 as uuidv4 } from 'uuid';
import { ComponentRegistration } from '@/types';

const ComponentPanel: React.FC = () => {
  const { categories, getComponentsByCategory } = useComponentsStore();
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'basic');
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-editor-border">
        <h2 className="text-lg font-semibold">组件库</h2>
      </div>
      
      {/* 分类选项卡 */}
      <div className="flex border-b border-editor-border">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-2 text-sm ${activeCategory === category ? 'text-primary-600 border-b-2 border-primary-600 -mb-px' : 'text-gray-600'}`}
            onClick={() => setActiveCategory(category)}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>
      
      {/* 组件列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          {getComponentsByCategory(activeCategory).map((component) => (
            <ComponentItem key={component.type} component={component} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ComponentItem: React.FC<{ component: ComponentRegistration }> = ({ component }) => {
  const { type, name, icon, defaultProps, defaultStyle } = component;
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { 
      id: uuidv4(),
      type,
      component,
      props: { ...defaultProps },
      style: { ...defaultStyle },
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, defaultProps, defaultStyle]);
  
  return (
    <div
      ref={drag}
      className={`flex flex-col items-center justify-center p-2 border rounded cursor-grab bg-white hover:border-primary-500 hover:shadow-sm ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="w-8 h-8 mb-1 flex items-center justify-center text-gray-600">
        {getComponentIcon(icon)}
      </div>
      <span className="text-xs text-center">{name}</span>
    </div>
  );
};

// 获取分类名称
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'basic': '基础组件',
    'layout': '布局组件',
    'form': '表单组件',
    'chart': '图表组件',
    'advanced': '高级组件',
  };
  return categoryNames[category] || category;
}

// 获取组件图标
function getComponentIcon(icon: string): React.ReactNode {
  // 这里可以用字体图标或SVG图标替代
  const iconMap: Record<string, React.ReactNode> = {
    'text-icon': <span>T</span>,
    'button-icon': <span>Btn</span>,
    'image-icon': <span>Img</span>,
    'container-icon': <span>◰</span>,
    'divider-icon': <span>—</span>,
    'grid-icon': <span>⋯</span>,
    'row-icon': <span>≡</span>,
    'column-icon': <span>❘</span>,
    'form-icon': <span>□</span>,
    'input-icon': <span>⌨</span>,
    'select-icon': <span>▼</span>,
    'checkbox-icon': <span>☑</span>,
    'radio-icon': <span>◉</span>,
    'switch-icon': <span>⊙</span>,
  };
  return iconMap[icon] || '?';
}

export default ComponentPanel;
