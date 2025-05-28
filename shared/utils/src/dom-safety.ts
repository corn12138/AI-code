import DOMPurify from 'dompurify';

/**
 * 安全地设置元素的HTML内容
 * @param element DOM元素
 * @param html HTML字符串
 */
export function setInnerHTML(element: HTMLElement, html: string): void {
  if (!element) return;
  
  const sanitized = DOMPurify.sanitize(html);
  element.innerHTML = sanitized;
}

/**
 * 安全地创建HTML元素
 * @param tag 标签名
 * @param attributes 属性对象
 * @param content 内部内容
 */
export function createElement(tag: string, attributes: Record<string, string> = {}, content?: string): HTMLElement {
  const element = document.createElement(tag);
  
  // 过滤和设置属性
  Object.keys(attributes).forEach(key => {
    // 避免危险属性
    if (!key.startsWith('on') && !['innerHTML', 'outerHTML'].includes(key)) {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  if (content) {
    element.textContent = content;
  }
  
  return element;
}

/**
 * 安全地解析URL参数
 * @param url URL字符串
 */
export function safeParseUrl(url: string): URLSearchParams {
  try {
    // 创建URL对象
    const urlObj = new URL(url, window.location.origin);
    // 返回只读的URLSearchParams对象
    return urlObj.searchParams;
  } catch (e) {
    return new URLSearchParams();
  }
}
