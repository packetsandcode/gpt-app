/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',  // ✅ if using /app directory
        './components/**/*.{js,ts,jsx,tsx}',  // ✅ adjust if needed
        './pages/**/*.{js,ts,jsx,tsx}', // ✅ if you're using /pages
    ],
    darkMode: 'class', // ✅ Important for dark mode toggle
    theme: {
        extend: {
            boxShadow: {
                'custom': '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
        },
    },
    plugins: [],
}
