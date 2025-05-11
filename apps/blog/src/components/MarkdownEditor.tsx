import { uploadImage } from '@/services/api';
import { Tab } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';

// 动态导入避免SSR问题
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
    ssr: false,
});

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    const [selectedTab, setSelectedTab] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // 处理图片粘贴上传
    const handlePaste = useCallback(
        async (e: React.ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageItem = Array.from(items).find(
                (item) => item.kind === 'file' && item.type.startsWith('image/')
            );

            if (!imageItem) return;

            e.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return;

            setIsUploading(true);
            try {
                const imageUrl = await uploadImage(file);

                // 在光标位置插入图片Markdown
                const textarea = textareaRef.current;
                if (textarea) {
                    const startPos = textarea.selectionStart;
                    const endPos = textarea.selectionEnd;
                    const imageMarkdown = `![图片](${imageUrl})`;

                    const newText =
                        value.substring(0, startPos) +
                        imageMarkdown +
                        value.substring(endPos);

                    onChange(newText);

                    // 重新设置光标位置
                    setTimeout(() => {
                        textarea.selectionStart = startPos + imageMarkdown.length;
                        textarea.selectionEnd = startPos + imageMarkdown.length;
                        textarea.focus();
                    }, 0);
                }
            } catch (error) {
                console.error('Failed to upload image:', error);
                alert('图片上传失败，请重试');
            } finally {
                setIsUploading(false);
            }
        },
        [value, onChange]
    );

    // 工具栏按钮点击处理
    const handleToolbarClick = (markdownSyntax: string, placeholder?: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = value.substring(startPos, endPos);

        let newText;
        let newCursorPos;

        if (selectedText) {
            // 如果有选中的文本，在选中文本前后添加语法
            newText =
                value.substring(0, startPos) +
                markdownSyntax.replace('$1', selectedText) +
                value.substring(endPos);
            newCursorPos = startPos + markdownSyntax.indexOf('$1') + selectedText.length +
                (markdownSyntax.length - markdownSyntax.indexOf('$1') - 2);
        } else if (placeholder) {
            // 如果没有选中文本但有占位符，插入带占位符的语法
            newText =
                value.substring(0, startPos) +
                markdownSyntax.replace('$1', placeholder) +
                value.substring(endPos);
            newCursorPos = startPos + markdownSyntax.indexOf('$1');
        } else {
            // 否则，只插入语法
            newText =
                value.substring(0, startPos) +
                markdownSyntax +
                value.substring(endPos);
            newCursorPos = startPos + markdownSyntax.length;
        }

        onChange(newText);

        // 设置新的光标位置
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = placeholder ? newCursorPos : newCursorPos;
            textarea.selectionEnd = placeholder ? newCursorPos + placeholder.length : newCursorPos;
        }, 0);
    };

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* 工具栏 */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-300 bg-gray-50">
                <button
                    onClick={() => handleToolbarClick('**$1**', '粗体文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="粗体"
                >
                    <span className="font-bold">B</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('*$1*', '斜体文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="斜体"
                >
                    <span className="italic">I</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('[链接文本]($1)', 'https://')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="链接"
                >
                    <span>🔗</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('![图片描述]($1)', 'https://')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="图片"
                >
                    <span>🖼️</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('```\n$1\n```', '代码')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="代码块"
                >
                    <span>{'</>'}</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('> $1', '引用内容')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="引用"
                >
                    <span>❝</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('- $1', '列表项')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="无序列表"
                >
                    <span>•</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('1. $1', '列表项')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="有序列表"
                >
                    <span>1.</span>
                </button>
                <button
                    onClick={() => handleToolbarClick('### $1', '标题')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="标题"
                >
                    <span>H</span>
                </button>
            </div>

            {/* 编辑/预览标签页 */}
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex border-b border-gray-300">
                    <Tab className={({ selected }) =>
                        `px-4 py-2 focus:outline-none ${selected
                            ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`
                    }>
                        编辑
                    </Tab>
                    <Tab className={({ selected }) =>
                        `px-4 py-2 focus:outline-none ${selected
                            ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`
                    }>
                        预览
                    </Tab>
                    <Tab className={({ selected }) =>
                        `px-4 py-2 focus:outline-none ${selected
                            ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`
                    }>
                        分屏
                    </Tab>
                </Tab.List>

                <Tab.Panels className="relative">
                    {/* 编辑模式 */}
                    <Tab.Panel className="h-full">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onPaste={handlePaste}
                            className="w-full h-[500px] p-4 resize-none focus:outline-none"
                            placeholder="输入Markdown内容，支持粘贴图片..."
                        />
                    </Tab.Panel>

                    {/* 预览模式 */}
                    <Tab.Panel className="h-full">
                        <div className="p-4 h-[500px] overflow-auto prose prose-slate max-w-none">
                            <MarkdownRenderer content={value} />
                        </div>
                    </Tab.Panel>

                    {/* 分屏模式 */}
                    <Tab.Panel className="h-full">
                        <div className="flex h-[500px]">
                            <div className="w-1/2 border-r border-gray-300">
                                <textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    onPaste={handlePaste}
                                    className="w-full h-full p-4 resize-none focus:outline-none"
                                    placeholder="输入Markdown内容，支持粘贴图片..."
                                />
                            </div>
                            <div className="w-1/2 p-4 overflow-auto prose prose-slate max-w-none">
                                <MarkdownRenderer content={value} />
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {/* 上传指示器 */}
            {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span>正在上传图片...</span>
                    </div>
                </div>
            )}

            {/* 字数统计 */}
            <div className="p-2 text-right text-sm text-gray-500 border-t border-gray-300">
                {`${value.length} 字符 | ${value.split(/\s+/).filter(Boolean).length} 单词`}
            </div>
        </div>
    );
}
