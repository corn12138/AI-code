import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 检测是否在客户端环境
export const isClient = typeof window !== 'undefined';

/**
 * 格式化日期，转换为相对时间（例如：3小时前）
 */
export function formatRelativeDate(date: string | Date): string {
    return dayjs(date).fromNow();
}

/**
 * 标准日期格式化函数 - 替代clientUtils中的formatDate
 * 在服务端和客户端都可安全使用
 */
export function formatDate(dateString: string | Date | null | undefined): string {
    try {
        if (!dateString) {
            return '未知时间';
        }
        
        if (isClient) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '无效日期';
            }
            return new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        } else {
            // 服务端安全的日期格式化
            const formatted = dayjs(dateString);
            if (!formatted.isValid()) {
                return '无效日期';
            }
            return formatted.format('YYYY年MM月DD日');
        }
    } catch (e) {
        console.error('日期格式化错误:', e);
        return String(dateString || '未知时间');
    }
}

/**
 * 格式化日期为指定格式
 */
export function formatDateToPattern(date: string | Date, pattern: string = 'YYYY-MM-DD'): string {
    return dayjs(date).format(pattern);
}

/**
 * 计算两个日期之间的差值（天数）
 */
export function daysBetween(dateA: string | Date, dateB: string | Date): number {
    return dayjs(dateA).diff(dayjs(dateB), 'day');
}

/**
 * 格式化日期为用户友好格式
 */
export function formatDateLocale(dateString: string, locale: string = 'zh-CN'): string {
    try {
        const date = new Date(dateString);
        if (isClient) {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        } else {
            // 服务端安全的格式
            return dayjs(date).format('YYYY年MM月DD日');
        }
    } catch (e) {
        console.error('Error formatting date:', e);
        return String(dateString);
    }
}

/**
 * 计算相对时间（如：3小时前，2天前）
 */
export function getRelativeTimeString(dateString: string, locale: string = 'zh-CN'): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        return formatDateLocale(dateString, locale);
    } catch (e) {
        console.error('Error calculating relative time:', e);
        return formatDateLocale(dateString, locale);
    }
}

/**
 * 计算文章阅读时间
 */
export function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} 分钟阅读`;
}
