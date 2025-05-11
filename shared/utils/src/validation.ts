/**
 * 邮箱验证
 * @param email 邮箱地址
 */
export function isEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * 手机号验证 (中国大陆手机号)
 * @param phone 手机号
 */
export function isChinesePhoneNumber(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phone);
}

/**
 * URL验证
 * @param url URL地址
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * IP地址验证 (IPv4)
 * @param ip IP地址
 */
export function isIpv4(ip: string): boolean {
  const pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!pattern.test(ip)) return false;
  
  const parts = ip.split('.').map(Number);
  return parts.every(part => part >= 0 && part <= 255);
}

/**
 * 身份证号验证 (中国大陆身份证)
 * @param idCard 身份证号
 */
export function isChineseIdCard(idCard: string): boolean {
  const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return pattern.test(idCard);
}

/**
 * 字符串长度验证
 * @param str 字符串
 * @param min 最小长度
 * @param max 最大长度
 */
export function isLengthInRange(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 强密码验证 (至少包含大小写字母、数字和特殊字符)
 * @param password 密码
 */
export function isStrongPassword(password: string): boolean {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return pattern.test(password);
}

/**
 * 数字验证
 * @param value 要验证的值
 */
export function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * 整数验证
 * @param value 要验证的值
 */
export function isInteger(value: any): boolean {
  return Number.isInteger(Number(value));
}

/**
 * 日期验证
 * @param dateStr 日期字符串
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * 是否为空值
 * @param value 要验证的值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 是否包含特殊字符
 * @param str 字符串
 */
export function hasSpecialChars(str: string): boolean {
  const pattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  return pattern.test(str);
}
