export function requireEnv(key: string, errorMessage?: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(errorMessage || `Environment variable ${key} is not configured`);
    }
    return value;
}
