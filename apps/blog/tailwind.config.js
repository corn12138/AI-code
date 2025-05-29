/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/layouts/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                accent: {
                    light: '#f59e0b',
                    DEFAULT: '#d97706',
                    dark: '#b45309',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'Georgia', 'serif'],
                mono: ['Fira Code', 'monospace'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        'code::before': { content: '""' },
                        'code::after': { content: '""' },
                        'blockquote p:first-of-type::before': { content: '""' },
                        'blockquote p:last-of-type::after': { content: '""' },
                        maxWidth: '100%',
                        a: {
                            color: '#0ea5e9',
                            '&:hover': {
                                color: '#0284c7',
                            },
                        },
                        img: {
                            borderRadius: '0.375rem',
                        },
                    },
                },
            },
            boxShadow: {
                'card': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/line-clamp'),
    ],
};
