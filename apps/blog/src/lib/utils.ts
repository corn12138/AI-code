import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 用于合并tailwind类的工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 转换为秒数
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return '刚刚';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}小时前`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}天前`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}个月前`;
  }
  
  const years = Math.floor(months / 12);
  return `${years}年前`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
