/**
 * 从页面获取CSRF令牌
 * @returns CSRF令牌字符串或undefined
 */
export function getCsrfToken(): string | undefined {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || undefined;
}

/**
 * 将CSRF令牌添加到请求头
 * @param headers 现有请求头对象
 * @returns 添加了CSRF令牌的请求头对象
 */
export function addCsrfHeader(headers: Record<string, string> = {}): Record<string, string> {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
        return {
            ...headers,
            'X-CSRF-Token': csrfToken
        };
    }

    return headers;
}
