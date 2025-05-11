import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { lowcodeApi } from '@/services/api';
import { PageModel } from '@/types';
import { Canvas } from '@/components/Editor/Canvas';
import { useEditorStore } from '@/store/editorStore';
import { toast } from 'react-hot-toast';

const Preview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const { initPage, setMode } = useEditorStore();
  
  useEffect(() => {
    // 设置为预览模式
    setMode('preview');
    
    const loadPage = async () => {
      if (!id) return;
      
      try {
        const page = await lowcodeApi.getPageById(id);
        initPage(page);
      } catch (error) {
        console.error('Failed to load page:', error);
        toast.error('加载页面失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPage();
  }, [id, initPage, setMode]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Canvas />
    </div>
  );
};

export default Preview;
