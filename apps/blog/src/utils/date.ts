import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

// 配置dayjs
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

/**
 * 格式化日期为友好的显示方式
 * @param date 日期字符串
 * @param format 自定义格式化模式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format?: string): string {
    if (!date) return '';

    const dateObj = dayjs(date);

    // 如果是今天，返回相对时间 (例如: 3小时前)
    if (dateObj.isAfter(dayjs().subtract(1, 'day'))) {
        return dateObj.fromNow();
    }

    // 如果是今年，显示月日和时间
    if (dateObj.year() === dayjs().year()) {
        return format ? dateObj.format(format) : dateObj.format('MM-DD HH:mm');
    }

    // 否则显示完整日期
    return format ? dateObj.format(format) : dateObj.format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化日期为 ISO 格式
 */
export function formatISO(date: Date | string): string {
    return dayjs(date).toISOString();
}

/**
 * 计算两个日期之间的差距（天数）
 */
export function daysBetween(dateFrom: Date | string, dateTo: Date | string): number {
    const from = dayjs(dateFrom);
    const to = dayjs(dateTo);
    return to.diff(from, 'day');
}

/**
 * 检查日期是否在指定天数内
 */
export function isWithinDays(date: Date | string, days: number): boolean {
    const targetDate = dayjs(date);
    const daysAgo = dayjs().subtract(days, 'day');
    return targetDate.isAfter(daysAgo);
}
