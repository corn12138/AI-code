const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

const cookieRegexEscape = (value: string) => value.replace(/([\\.$?*|{}()\[\]\\/\+^])/g, '\\$1');

export const getCsrfHeaderName = () => CSRF_HEADER_NAME;
export const getCsrfCookieName = () => CSRF_COOKIE_NAME;

export const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${cookieRegexEscape(name)}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const ensureCsrfToken = async (): Promise<string | null> => {
    let token = readCookie(CSRF_COOKIE_NAME);
    if (token) return token;

    try {
        const response = await fetch('/api/auth/csrf', { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            token = data?.csrfToken || readCookie(CSRF_COOKIE_NAME);
            return token ?? null;
        }
    } catch (error) {
        console.warn('Unable to refresh CSRF token', error);
    }

    return null;
};
