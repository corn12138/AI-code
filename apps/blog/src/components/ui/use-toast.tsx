'use client';

import { useToast as useToastContext } from './toast';

// 统一的toast接口，同时支持react-hot-toast和自定义toast
export const toast = (options: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
} | string) => {
  if (typeof window === "undefined") return;

  // 尝试使用自定义toast
  try {
    const { addToast } = useToastContext();
    if (typeof options === 'string') {
      addToast({ description: options, variant: 'default' });
    } else {
      addToast(options);
    }
    return;
  } catch (error) {
    // 如果自定义toast不可用，回退到简单实现
    const message = typeof options === 'string' ? options : options.description || options.title || '';
    const variant = typeof options === 'object' ? options.variant : 'default';
    
    if (variant === 'destructive') {
      console.error("Error:", message);
      alert("错误: " + message);
    } else if (variant === 'success') {
      console.log("Success:", message);
      alert("成功: " + message);
    } else {
      console.log("Info:", message);
      alert(message);
    }
  }
};

// 便捷方法
toast.success = (message: string) => toast({ description: message, variant: 'success' });
toast.error = (message: string) => toast({ description: message, variant: 'destructive' });

// 导出useToast hook
export { useToast } from './toast';
