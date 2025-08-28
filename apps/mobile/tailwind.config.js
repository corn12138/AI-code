/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1677ff',
                secondary: '#52c41a',
                warning: '#faad14',
                error: '#ff4d4f',
                success: '#52c41a',
                info: '#1677ff',
            },
            screens: {
                'xs': '360px',
                'sm': '576px',
                'md': '768px',
                'lg': '992px',
                'xl': '1200px',
                'tablet': '768px',
                'mobile': { 'max': '767px' },
                'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            fontSize: {
                'xs': ['12px', '16px'],
                'sm': ['14px', '20px'],
                'base': ['16px', '24px'],
                'lg': ['18px', '26px'],
                'xl': ['20px', '28px'],
                '2xl': ['24px', '32px'],
            }
        },
    },
    plugins: [],
}
