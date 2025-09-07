import { describe, expect, it } from 'vitest';
import { cn, formatRelativeTime, truncateText } from '../utils';



describe('utils', () => {
    describe('cn', () => {
        it('应该合并tailwind类名', () => {
            const result = cn('px-4 py-2', 'bg-blue-500', 'text-white')
            expect(result).toBe('px-4 py-2 bg-blue-500 text-white')
        })

        it('应该处理条件类名', () => {
            const isActive = true
            const result = cn('base-class', isActive && 'active-class')
            expect(result).toBe('base-class active-class')
        })

        it('应该处理数组类名', () => {
            const result = cn(['px-4', 'py-2'], 'bg-blue-500')
            expect(result).toBe('px-4 py-2 bg-blue-500')
        })
    })

    describe('formatRelativeTime', () => {
        it('应该格式化刚刚的时间', () => {
            const now = new Date()
            const result = formatRelativeTime(now.toISOString())
            expect(result).toBe('刚刚')
        })

        it('应该格式化分钟前的时间', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            const result = formatRelativeTime(fiveMinutesAgo.toISOString())
            expect(result).toBe('5分钟前')
        })

        it('应该格式化小时前的时间', () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
            const result = formatRelativeTime(twoHoursAgo.toISOString())
            expect(result).toBe('2小时前')
        })

        it('应该格式化天前的时间', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            const result = formatRelativeTime(threeDaysAgo.toISOString())
            expect(result).toBe('3天前')
        })

        it('应该处理null值', () => {
            const result = formatRelativeTime(null)
            expect(result).toBe('未知时间')
        })

        it('应该处理undefined值', () => {
            const result = formatRelativeTime(undefined)
            expect(result).toBe('未知时间')
        })

        it('应该处理无效日期', () => {
            const result = formatRelativeTime('invalid-date')
            expect(result).toBe('无效日期')
        })
    })

    describe('truncateText', () => {
        it('应该截断长文本', () => {
            const longText = '这是一段很长的文本，需要被截断'
            const truncated = truncateText(longText, 10)
            expect(truncated).toBe('这是一段很长的文本，...')
        })

        it('应该保持短文本不变', () => {
            const shortText = '短文本'
            const truncated = truncateText(shortText, 10)
            expect(truncated).toBe(shortText)
        })

        it('应该处理空字符串', () => {
            const result = truncateText('', 10)
            expect(result).toBe('')
        })

        it('应该处理边界长度', () => {
            const text = '1234567890'
            const result = truncateText(text, 10)
            expect(result).toBe(text)
        })
    })
})
