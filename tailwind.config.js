/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                snow: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                },
                winter: {
                    light: '#e0f2fe',
                    DEFAULT: '#0ea5e9',
                    dark: '#0369a1',
                },
            },
            animation: {
                'snowfall': 'snowfall 10s linear infinite',
            },
            keyframes: {
                snowfall: {
                    '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0.3' },
                },
            },
        },
    },
    plugins: [],
}
