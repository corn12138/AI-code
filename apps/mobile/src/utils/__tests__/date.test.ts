import { describe, expect, it } from 'vitest';
import { formatDate, formatRelativeTime } from '../date';

describe('utils/date', () => {
    describe('formatRelativeTime', () => {
        it('应该返回"刚刚"对于当前时间', () => {
            const now = new Date();
            expect(formatRelativeTime(now)).toBe('刚刚');
        });

        it('应该返回"刚刚"对于几秒前的时间', () => {
            const now = new Date();
            const fewSecondsAgo = new Date(now.getTime() - 30 * 1000);
            expect(formatRelativeTime(fewSecondsAgo)).toBe('刚刚');
        });

        it('应该返回分钟前的时间', () => {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 分钟前');
        });

        it('应该返回小时前的时间', () => {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            expect(formatRelativeTime(twoHoursAgo)).toBe('2 小时前');
        });

        it('应该返回天前的时间', () => {
            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            expect(formatRelativeTime(threeDaysAgo)).toBe('3 天前');
        });

        it('应该返回月前的时间', () => {
            const now = new Date();
            const twoMonthsAgo = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000);
            expect(formatRelativeTime(twoMonthsAgo)).toBe('2 个月前');
        });

        it('应该返回年前的时间', () => {
            const now = new Date();
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            expect(formatRelativeTime(oneYearAgo)).toBe('1 年前');
        });

        it('应该处理字符串日期', () => {
            const dateString = '2023-01-01T00:00:00.000Z';
            const result = formatRelativeTime(dateString);
            expect(typeof result).toBe('string');
            expect(result).toMatch(/\d+ (分钟前|小时前|天前|个月前|年前)/);
        });

        it('应该处理无效日期', () => {
            const invalidDate = 'invalid-date';
            const result = formatRelativeTime(invalidDate);
            expect(typeof result).toBe('string');
        });
    });

    describe('formatDate', () => {
        it('应该格式化日期为中文格式', () => {
            const date = new Date('2023-12-25T10:30:00.000Z');
            const result = formatDate(date);
            expect(result).toContain('2023');
            expect(result).toContain('12');
            expect(result).toContain('25');
        });

        it('应该处理字符串日期', () => {
            const dateString = '2023-06-15T14:20:00.000Z';
            const result = formatDate(dateString);
            expect(typeof result).toBe('string');
            expect(result).toContain('2023');
        });

        it('应该处理当前时间', () => {
            const now = new Date();
            const result = formatDate(now);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('应该处理无效日期', () => {
            const invalidDate = 'invalid-date';
            const result = formatDate(invalidDate);
            expect(typeof result).toBe('string');
        });
    });
});
