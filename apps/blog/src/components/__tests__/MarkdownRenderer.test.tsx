import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';


import MarkdownRenderer from '@/components/MarkdownRenderer'

describe('MarkdownRenderer 组件', () => {
    it('应该正确渲染基本的Markdown内容', () => {
        const markdown = '# 标题\n这是一段文本。'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('标题')).toBeInTheDocument()
        expect(screen.getByText('这是一段文本。')).toBeInTheDocument()
    })

    it('应该渲染标题元素', () => {
        const markdown = '# 一级标题\n## 二级标题\n### 三级标题'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('一级标题')).toBeInTheDocument()
        expect(screen.getByText('二级标题')).toBeInTheDocument()
        expect(screen.getByText('三级标题')).toBeInTheDocument()
    })

    it('应该渲染链接', () => {
        const markdown = '[链接文本](https://example.com)'
        render(<MarkdownRenderer content={markdown} />)

        const link = screen.getByText('链接文本')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com')
        expect(link).toHaveClass('text-cosmic-400', 'hover:text-cosmic-300')
    })

    it('应该渲染代码块', () => {
        const markdown = '```javascript\nconst x = 1;\nconsole.log(x);\n```'
        render(<MarkdownRenderer content={markdown} />)

        const container = screen.getByTestId('markdown-renderer')
        const codeBlock = container.querySelector('pre')
        expect(codeBlock).toBeTruthy()
        expect(codeBlock?.textContent).toContain('const x = 1;')
        expect(codeBlock?.tagName).toBe('PRE')
    })

    it('应该渲染内联代码', () => {
        const markdown = '这是 `内联代码` 示例'
        render(<MarkdownRenderer content={markdown} />)

        const inlineCode = screen.getByText('内联代码')
        expect(inlineCode).toBeInTheDocument()
        expect(inlineCode).toHaveClass('bg-space-800/60', 'text-stardust-300', 'px-2', 'py-1', 'rounded', 'border', 'border-cosmic-500/20')
    })

    it('应该渲染图片', () => {
        const markdown = '![图片描述](https://example.com/image.jpg)'
        render(<MarkdownRenderer content={markdown} />)

        const image = screen.getByAltText('图片描述')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('应该渲染列表', () => {
        const markdown = '- 项目1\n- 项目2\n- 项目3'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('项目1')).toBeInTheDocument()
        expect(screen.getByText('项目2')).toBeInTheDocument()
        expect(screen.getByText('项目3')).toBeInTheDocument()
    })

    it('应该渲染有序列表', () => {
        const markdown = '1. 第一项\n2. 第二项\n3. 第三项'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('第一项')).toBeInTheDocument()
        expect(screen.getByText('第二项')).toBeInTheDocument()
        expect(screen.getByText('第三项')).toBeInTheDocument()
    })

    it('应该渲染粗体文本', () => {
        const markdown = '这是**粗体文本**示例'
        render(<MarkdownRenderer content={markdown} />)

        const container = screen.getByTestId('markdown-renderer')
        const boldText = container.querySelector('strong')
        expect(boldText).toBeTruthy()
        expect(boldText?.textContent).toContain('粗体文本')
    })

    it('应该渲染斜体文本', () => {
        const markdown = '这是*斜体文本*示例'
        render(<MarkdownRenderer content={markdown} />)

        const italicText = screen.getByText('斜体文本')
        expect(italicText).toBeInTheDocument()
        expect(italicText.tagName).toBe('EM')
    })

    it('应该渲染引用块', () => {
        const markdown = '> 这是一个引用块\n> 包含多行内容'
        render(<MarkdownRenderer content={markdown} />)

        const blockquote = screen.getByText((value) => value.includes('这是一个引用块'))
        expect(blockquote.closest('blockquote')).toBeInTheDocument()
    })

    it('应该渲染表格', () => {
        const markdown = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
        `
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('列1')).toBeInTheDocument()
        expect(screen.getByText('列2')).toBeInTheDocument()
        expect(screen.getByText('列3')).toBeInTheDocument()
        expect(screen.getByText('数据1')).toBeInTheDocument()
        expect(screen.getByText('数据4')).toBeInTheDocument()
    })

    it('应该渲染水平分割线', () => {
        const markdown = '内容1\n\n---\n\n内容2'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('内容1')).toBeInTheDocument()
        expect(screen.getByText('内容2')).toBeInTheDocument()
        // 水平分割线通常渲染为hr元素
        const hr = document.querySelector('hr')
        expect(hr).toBeInTheDocument()
    })

    it('应该渲染任务列表', () => {
        const markdown = '- [x] 已完成任务\n- [ ] 未完成任务'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText('已完成任务')).toBeInTheDocument()
        expect(screen.getByText('未完成任务')).toBeInTheDocument()
    })

    it('应该渲染删除线文本', () => {
        const markdown = '这是~~删除线文本~~示例'
        render(<MarkdownRenderer content={markdown} />)

        const strikethroughText = screen.getByText('删除线文本')
        expect(strikethroughText).toBeInTheDocument()
        expect(strikethroughText.tagName).toBe('DEL')
    })

    it('应该渲染数学公式', () => {
        const markdown = '行内公式: $E = mc^2$\n\n块级公式:\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$'
        render(<MarkdownRenderer content={markdown} />)

        expect(screen.getByText((value) => value.includes('行内公式'))).toBeInTheDocument()
        expect(screen.getByText((value) => value.includes('块级公式'))).toBeInTheDocument()
    })

    it('应该处理空内容', () => {
        render(<MarkdownRenderer content="" />)
        
        const container = screen.getByTestId('markdown-renderer')
        expect(container).toBeInTheDocument()
    })

    it('应该处理null内容', () => {
        render(<MarkdownRenderer content={null as any} />)
        
        const container = screen.getByTestId('markdown-renderer')
        expect(container).toBeInTheDocument()
    })

    it('应该应用正确的容器样式', () => {
        const markdown = '# 测试标题'
        render(<MarkdownRenderer content={markdown} />)

        const container = screen.getByTestId('markdown-renderer')
        expect(container).toHaveClass(
            'prose',
            'prose-headings:text-space-200',
            'prose-p:text-space-400',
            'prose-strong:text-cosmic-300',
            'prose-a:text-cosmic-400',
            'prose-a:hover:text-cosmic-300',
            'prose-code:text-stardust-300',
            'prose-pre:bg-space-800/60',
            'prose-pre:border',
            'prose-pre:border-cosmic-500/20'
        )
    })
})
