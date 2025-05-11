import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 日期格式
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 计算相对时间 (例如: "3小时前")
 * @param date 日期对象或字符串
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  return dayjs(date).fromNow();
}

/**
 * 计算两个日期之间的差值
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @param unit 计算单位 (day, hour, minute, second, month, year)
 */
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number = new Date(),
  unit: 'day' | 'hour' | 'minute' | 'second' | 'month' | 'year' = 'day'
): number {
  return dayjs(date2).diff(dayjs(date1), unit);
}

/**
 * 判断日期是否在某个范围内
 * @param date 要判断的日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function isDateInRange(
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean {
  const d = dayjs(date);
  return d.isAfter(dayjs(startDate)) && d.isBefore(dayjs(endDate));
}

/**
 * 获取日期的开始时间 (00:00:00)
 * @param date 日期对象或字符串
 */
export function startOfDay(date: Date | string | number = new Date()): Date {
  return dayjs(date).startOf('day').toDate();
}

/**
 * 获取日期的结束时间 (23:59:59)
 * @param date 日期对象或字符串
 */
export function endOfDay(date: Date | string | number = new Date()): Date {
  return dayjs(date).endOf('day').toDate();
}

/**
 * 判断两个日期是否是同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 */
export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day');
}

/**
 * 将日期字符串转换为ISO格式
 * @param date 日期字符串
 */
export function toISOString(date: Date | string | number): string {
  return dayjs(date).toISOString();
}
