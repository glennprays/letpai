/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          hover: '#EE5A5A',
          contrast: '#CC4444',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          hover: '#10A392',
        },
        accent: {
          purple: '#8B5CF6',
          yellow: '#F59E0B',
        },
        status: {
          pending: '#F59E0B',
          submitted: '#3B82F6',
          paid: '#10B981',
          rejected: '#EF4444',
        },
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        bold: '4px 4px 0 0 rgba(0, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
