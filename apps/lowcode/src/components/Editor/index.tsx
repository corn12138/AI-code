import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/store/editorStore';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentPanel from './ComponentPanel';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import Toolbar from './Toolbar';
import { lowcodeApi } from '@/services/api';
import { createEmptyPage } from '@/utils/components';
import { PageModel } from '@/types';
import { toast } from 'react-hot-toast';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { 
    currentPage, 
    initPage, 
    setPageName, 
    setPageDescription,
    mode
  } = useEditorStore();
  
  // 加载页面数据
  useEffect(() => {
    const loadPage = async () => {
      try {
        if (id === 'new') {
          // 创建新页面
          const emptyPage: PageModel = {
            id: 'temp-' + Date.now(),
            name: '新页面',
            description: '新建的低代码页面',
            components: createEmptyPage(),
            version: '1.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          initPage(emptyPage);
        } else if (id) {
          // 加载已有页面
          const page = await lowcodeApi.getPageById(id);
          initPage(page);
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        toast.error('加载页面失败');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPage();
  }, [id, initPage, navigate]);
  
  // 保存页面
  const handleSave = async () => {
    if (!currentPage) return;
    
    try {
      let savedPage;
      
      if (currentPage.id.startsWith('temp-')) {
        // 新页面，创建
        savedPage = await lowcodeApi.createPage({
          name: currentPage.name,
          description: currentPage.description,
          components: currentPage.components
        });
        
        // 更新URL，但不刷新页面
        navigate(`/editor/${savedPage.id}`, { replace: true });
      } else {
        // 已有页面，更新
        savedPage = await lowcodeApi.updatePage(currentPage.id, {
          name: currentPage.name,
          description: currentPage.description,
          components: currentPage.components
        });
      }
      
      initPage(savedPage);
      toast.success('保存成功');
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error('保存失败');
    }
  };
  
  // 发布页面
  const handlePublish = async () => {
    if (!currentPage || currentPage.id.startsWith('temp-')) {
      toast.error('请先保存页面');
      return;
    }
    
    try {
      const publishedPage = await lowcodeApi.publishPage(currentPage.id);
      initPage(publishedPage);
      toast.success('发布成功');
    } catch (error) {
      console.error('Failed to publish page:', error);
      toast.error('发布失败');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-editor-bg">
        {/* 顶部工具栏 */}
        <Toolbar 
          name={currentPage?.name || ''}
          mode={mode}
          onNameChange={setPageName}
          onSave={handleSave}
          onPublish={handlePublish}
        />
        
        {/* 主编辑区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧组件面板 */}
          {mode === 'edit' && (
            <div className="w-sidebar bg-editor-sidebar border-r border-editor-border">
              <ComponentPanel />
            </div>
          )}
          
          {/* 中间画布区域 */}
          <div className={`flex-1 ${mode === 'edit' ? 'px-4 py-4' : ''} overflow-auto`}>
            <Canvas />
          </div>
          
          {/* 右侧属性面板 */}
          {mode === 'edit' && (
            <div className="w-sidebar bg-editor-sidebar border-l border-editor-border">
              <PropertyPanel />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default Editor;
