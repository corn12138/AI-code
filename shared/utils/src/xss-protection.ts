import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';

// 创建DOMPurify的window对象(服务端环境)
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * 清理HTML内容，移除潜在的XSS攻击代码
 * @param html 原始HTML内容
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style', 'title',
      'rel', 'width', 'height'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true }
  });
}

/**
 * 将Markdown转换为安全的HTML
 * @param markdown Markdown文本
 */
export function markdownToSafeHtml(markdown: string): string {
  if (!markdown) return '';
  
  // 先转换markdown为HTML
  const html = marked(markdown);
  // 然后净化HTML
  return sanitizeHtml(html);
}

/**
 * 纯文本编码，防止HTML注入
 * @param text 纯文本
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 检查输入是否包含潜在的XSS攻击字符串
 * @param input 用户输入
 * @returns 是否包含可疑内容
 */
export function containsSuspiciousXss(input: string): boolean {
  if (!input) return false;
  
  const suspicious = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=/gi,
    /javascript:/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\(/gi,
    /url\(/gi,
    /document\.cookie/gi,
    /document\.domain/gi,
    /document\.write/gi,
    /window\.location/gi,
    /\.innerHTML/gi,
    /\.outerHTML/gi
  ];
  
  return suspicious.some(pattern => pattern.test(input));
}

/**
 * 验证用户输入并根据用途净化内容
 * @param input 用户输入
 * @param type 输入类型(text, html, url, email...)
 * @returns 处理后的安全内容
 */
export function validateAndSanitize(input: string, type: 'text' | 'html' | 'url' | 'email'): string {
  if (!input) return '';
  
  switch (type) {
    case 'text':
      return escapeHtml(input);
    case 'html':
      return sanitizeHtml(input);
    case 'url':
      // 验证并清理URL
      try {
        const url = new URL(input);
        return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
      } catch {
        return '';
      }
    case 'email':
      // 简单的邮箱验证
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? input : '';
    default:
      return escapeHtml(input);
  }
}
