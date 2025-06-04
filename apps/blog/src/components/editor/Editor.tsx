'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tab } from '@headlessui/react';
import { uploadImageService } from '@/lib/api-services';
import { cn } from '@/lib/utils';

// 动态导入避免SSR相关问题
const MarkdownPreview = dynamic(() => import('./MarkdownPreview'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-md"></div>
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Editor({ value, onChange, placeholder = '开始编写精彩的内容...' }: EditorProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理图像粘贴
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find(
        item => item.kind === 'file' && item.type.startsWith('image/')
      );

      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      try {
        setIsUploading(true);
        const imageUrl = await uploadImageService(file);
        
        // 在光标位置插入图片Markdown语法
        const textarea = textareaRef.current;
        if (textarea) {
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          const imageMarkdown = `![图片](${imageUrl})`;
          
          const newValue = 
            value.substring(0, startPos) + 
            imageMarkdown + 
            value.substring(endPos);
          
          onChange(newValue);
          
          // 更新光标位置
          setTimeout(() => {
            textarea.selectionStart = startPos + imageMarkdown.length;
            textarea.selectionEnd = startPos + imageMarkdown.length;
            textarea.focus();
          }, 0);
        }
      } catch (error) {
        console.error('上传图片失败:', error);
        alert('图片上传失败，请重试');
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange]
  );

  // 工具栏按钮点击处理
  const insertMarkdown = useCallback((syntax: string, placeholder?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    
    let newText;
    let newCursorPos;

    if (selected) {
      // 如果有选中的文本，在选中文本前后添加语法
      newText = 
        value.substring(0, start) +
        syntax.replace('$1', selected) +
        value.substring(end);
      
      newCursorPos = start + syntax.indexOf('$1') + selected.length +
        (syntax.length - syntax.indexOf('$1') - 2);
    } else if (placeholder) {
      // 如果没有选中文本但有占位符，插入带占位符的语法
      newText = 
        value.substring(0, start) +
        syntax.replace('$1', placeholder) +
        value.substring(end);
      
      newCursorPos = start + syntax.indexOf('$1');
    } else {
      // 否则，只插入语法
      newText = 
        value.substring(0, start) +
        syntax +
        value.substring(end);
      
      newCursorPos = start + syntax.length;
    }

    onChange(newText);

    // 更新光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = placeholder ? newCursorPos : newCursorPos;
      textarea.selectionEnd = placeholder ? newCursorPos + (placeholder?.length || 0) : newCursorPos;
    }, 0);
  }, [value, onChange]);

  // 处理Tab键
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = 
        value.substring(0, start) + 
        '  ' + 
        value.substring(end);
      
      onChange(newValue);
      
      // 更新光标位置
      setTimeout(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => insertMarkdown('# $1', '标题')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="标题 1"
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => insertMarkdown('## $1', '标题')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="标题 2"
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => insertMarkdown('### $1', '标题')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="标题 3"
          type="button"
        >
          H3
        </button>
        <span className="h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
        <button
          onClick={() => insertMarkdown('**$1**', '粗体文本')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded font-bold"
          title="粗体"
          type="button"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('*$1*', '斜体文本')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded italic"
          title="斜体"
          type="button"
        >
          I
        </button>
        <span className="h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
        <button
          onClick={() => insertMarkdown('[$1](url)', '链接文本')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="链接"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
        <button
          onClick={() => insertMarkdown('![图片描述]($1)', 'https://')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="图片"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <span className="h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
        <button
          onClick={() => insertMarkdown('- $1', '列表项')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="无序列表"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button
          onClick={() => insertMarkdown('1. $1', '列表项')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="有序列表"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
        <span className="h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
        <button
          onClick={() => insertMarkdown('> $1', '引用内容')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="引用"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        </button>
        <button
          onClick={() => insertMarkdown('```\n$1\n```', '代码')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          title="代码块"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
      </div>

      {/* 编辑/预览标签页 */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
          <Tab className={({ selected }) =>
            cn(
              'px-4 py-2 text-sm font-medium focus:outline-none',
              selected
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )
          }>
            编辑
          </Tab>
          <Tab className={({ selected }) =>
            cn(
              'px-4 py-2 text-sm font-medium focus:outline-none',
              selected
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )
          }>
            预览
          </Tab>
          <Tab className={({ selected }) =>
            cn(
              'px-4 py-2 text-sm font-medium focus:outline-none',
              selected
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )
          }>
            分屏
          </Tab>
        </Tab.List>

        <Tab.Panels className="relative">
          {/* 编辑模式 */}
          <Tab.Panel>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleTabKey}
              placeholder={placeholder}
              className="w-full h-[500px] p-4 resize-none focus:outline-none text-base dark:bg-gray-950 dark:text-gray-200 font-mono"
            />
          </Tab.Panel>

          {/* 预览模式 */}
          <Tab.Panel>
            <div className="p-4 h-[500px] overflow-auto prose prose-slate dark:prose-invert max-w-none">
              <MarkdownPreview content={value} />
            </div>
          </Tab.Panel>

          {/* 分屏模式 */}
          <Tab.Panel>
            <div className="flex h-[500px]">
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={handleTabKey}
                  placeholder={placeholder}
                  className="w-full h-full p-4 resize-none focus:outline-none text-base dark:bg-gray-950 dark:text-gray-200 font-mono"
                />
              </div>
              <div className="w-1/2 p-4 overflow-auto prose prose-slate dark:prose-invert max-w-none">
                <MarkdownPreview content={value} />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* 上传状态指示器 */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-[3px] border-gray-300 dark:border-gray-600 border-t-primary-600 rounded-full"></div>
            <span>正在上传图片...</span>
          </div>
        </div>
      )}

      {/* 字数统计 */}
      <div className="p-2 flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div>
          {selectedTab === 0 && '支持 Markdown 语法 | '}
          {selectedTab === 1 && '预览模式 | '}
          {selectedTab === 2 && '分屏模式 | '}
          按 Tab 键缩进
        </div>
        <div>
          {value.length} 字符 | {value.split(/\s+/).filter(Boolean).length} 单词
        </div>
      </div>
    </div>
  );
}
