export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    roles?: string[];
    fullName?: string;
    createdAt?: string;
    updatedAt?: string;
}

const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_ENDPOINT = '/api/auth/csrf';
const SESSION_ENDPOINT = '/api/auth/session';
const SESSION_STORAGE_KEY = 'auth_session_cache_v1';
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type CachedSession = {
    user: AuthUser;
    expiresAt: number;
};

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

const inMemorySessionCache: {
    user: AuthUser | null;
    expiresAt: number;
} = {
    user: null,
    expiresAt: 0,
};

function readSessionStorage(): CachedSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedSession;
        return parsed;
    } catch (error) {
        console.warn('Failed to read session cache from storage', error);
        return null;
    }
}

function writeSessionStorage(cache: CachedSession | null) {
    if (typeof window === 'undefined') return;
    try {
        if (!cache) {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.warn('Failed to persist session cache', error);
    }
}

async function requestCsrfToken(): Promise<string> {
    const response = await fetch(CSRF_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to obtain CSRF token');
    }

    const data = await response.json();
    if (!data?.csrfToken) {
        throw new Error('CSRF token not present in response');
    }

    return data.csrfToken as string;
}

export async function getCsrfToken(forceRefresh: boolean = false): Promise<string> {
    if (!forceRefresh && csrfTokenCache) {
        return csrfTokenCache;
    }

    if (!csrfTokenPromise) {
        csrfTokenPromise = requestCsrfToken()
            .then(token => {
                csrfTokenCache = token;
                return token;
            })
            .finally(() => {
                csrfTokenPromise = null;
            });
    }

    return csrfTokenPromise;
}

export function invalidateCsrfToken(): void {
    csrfTokenCache = null;
}

export async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}, forceRefreshToken = false): Promise<Response> {
    const csrfToken = await getCsrfToken(forceRefreshToken);
    const headers = new Headers(init.headers || {});

    if (!headers.has(CSRF_HEADER)) {
        headers.set(CSRF_HEADER, csrfToken);
    }

    return fetch(input, {
        credentials: 'include',
        ...init,
        headers,
    });
}

export const sessionCache = {
    get(): AuthUser | null {
        const now = Date.now();

        if (inMemorySessionCache.user && inMemorySessionCache.expiresAt > now) {
            return inMemorySessionCache.user;
        }

        const stored = readSessionStorage();
        if (stored && stored.expiresAt > now) {
            inMemorySessionCache.user = stored.user;
            inMemorySessionCache.expiresAt = stored.expiresAt;
            return stored.user;
        }

        this.clear();
        return null;
    },
    set(user: AuthUser): void {
        const expiresAt = Date.now() + SESSION_CACHE_TTL;
        inMemorySessionCache.user = user;
        inMemorySessionCache.expiresAt = expiresAt;
        writeSessionStorage({ user, expiresAt });
    },
    clear(): void {
        inMemorySessionCache.user = null;
        inMemorySessionCache.expiresAt = 0;
        writeSessionStorage(null);
    },
};

export async function loadSessionFromServer(): Promise<AuthUser | null> {
    try {
        const response = await fetch(SESSION_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                sessionCache.clear();
            }
            return null;
        }

        const data = await response.json();
        if (data?.user) {
            sessionCache.set(data.user as AuthUser);
            return data.user as AuthUser;
        }

        return null;
    } catch (error) {
        console.warn('Failed to load auth session', error);
        return null;
    }
}

export async function refreshSessionCache(): Promise<AuthUser | null> {
    sessionCache.clear();
    return loadSessionFromServer();
}

export function getCsrfHeaderName(): string {
    return CSRF_HEADER;
}
