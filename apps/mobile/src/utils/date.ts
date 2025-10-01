// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} 小时前`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} 天前`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} 个月前`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} 年前`;
}

// 格式化为标准日期
export function formatDate(date: string | Date): string {
  const inputDate = new Date(date);
  return inputDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
