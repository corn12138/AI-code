/**
 * 截断字符串
 * @param str 原始字符串
 * @param length 最大长度
 * @param suffix 后缀
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * 将字符串首字母大写
 * @param str 原始字符串
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 转换为驼峰命名
 * @param str 原始字符串
 */
export function camelCase(str: string): string {
  return str
    .replace(/[_-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (match) => match.toLowerCase());
}

/**
 * 转换为短横线命名
 * @param str 原始字符串
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 转换为下划线命名
 * @param str 原始字符串
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * 生成指定长度的随机字符串
 * @param length 字符串长度
 * @param charset 字符集
 */
export function randomString(
  length: number,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  const charactersLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * 从HTML字符串中提取纯文本
 * @param html HTML字符串
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 转义HTML特殊字符
 * @param str 原始字符串
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}

/**
 * 从URL中获取查询参数
 * @param url URL字符串
 * @param param 参数名
 */
export function getQueryParam(url: string, param: string): string | null {
  const searchParams = new URLSearchParams(new URL(url).search);
  return searchParams.get(param);
}

/**
 * 判断字符串是否为空
 * @param str 字符串
 */
export function isEmpty(str?: string | null): boolean {
  return !str || str.trim() === '';
}
