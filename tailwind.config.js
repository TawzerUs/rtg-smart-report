/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                info: 'var(--info)',
                'bg-dark': 'var(--bg-dark)',
                'bg-card': 'var(--bg-card)',
                'bg-glass': 'var(--bg-glass)',
            },
        },
    },
    plugins: [],
}
