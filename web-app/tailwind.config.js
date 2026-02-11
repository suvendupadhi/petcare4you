/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea580c',
          foreground: '#ffffff',
        },
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        border: '#e2e8f0',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
      }
    },
  },
  plugins: [],
}
