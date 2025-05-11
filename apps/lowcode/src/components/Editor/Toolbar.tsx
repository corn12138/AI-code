import React from 'react';
import { EditorMode } from '@/types';
import { useEditorStore } from '@/store/editorStore';

interface ToolbarProps {
  name: string;
  mode: EditorMode;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onPublish: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ name, mode, onNameChange, onSave, onPublish }) => {
  const { setMode, canvasScale, setCanvasScale, toggleGrid, showGrid } = useEditorStore();
  
  return (
    <div className="h-header bg-white border-b border-gray-300 flex justify-between items-center px-4">
      {/* 左侧页面名称和操作 */}
      <div className="flex items-center">
        <div className="font-bold text-xl text-primary-600 mr-4">低代码平台</div>
        
        {/* 页面名称输入框 */}
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="border border-gray-300 px-2 py-1 rounded text-sm mr-4"
          placeholder="页面名称"
        />
        
        {/* 保存和发布按钮 */}
        <div className="flex space-x-2">
          <button
            onClick={onSave}
            className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            保存
          </button>
          <button
            onClick={onPublish}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            发布
          </button>
        </div>
      </div>
      
      {/* 右侧工具 */}
      <div className="flex items-center space-x-4">
        {/* 编辑/预览切换 */}
        <div className="flex border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-sm ${
              mode === 'edit' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-sm ${
              mode === 'preview' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            预览
          </button>
        </div>
        
        {/* 缩放控制 */}
        {mode === 'edit' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={canvasScale <= 0.5}
            >
              <span className="text-lg">-</span>
            </button>
            <span className="text-sm">{Math.round(canvasScale * 100)}%</span>
            <button
              onClick={() => setCanvasScale(Math.min(2, canvasScale + 0.1))}
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={canvasScale >= 2}
            >
              <span className="text-lg">+</span>
            </button>
            <button
              onClick={() => setCanvasScale(1)}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              重置
            </button>
          </div>
        )}
        
        {/* 网格切换 */}
        {mode === 'edit' && (
          <button
            onClick={toggleGrid}
            className={`px-2 py-1 text-xs rounded ${
              showGrid ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showGrid ? '隐藏网格' : '显示网格'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
