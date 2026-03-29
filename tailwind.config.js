/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
        },
        success: {
          500: 'rgb(var(--color-success-500) / <alpha-value>)',
        },
        warning: {
          500: 'rgb(var(--color-warning-500) / <alpha-value>)',
        },
        error: {
          500: 'rgb(var(--color-error-500) / <alpha-value>)',
        },
        neutral: {
          50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
        },
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],
        'sm': ['1rem', { lineHeight: '1.5' }],
        'base': ['1.125rem', { lineHeight: '1.5' }],
        'lg': ['1.25rem', { lineHeight: '1.5' }],
        'xl': ['1.5rem', { lineHeight: '1.5' }],
        '2xl': ['1.875rem', { lineHeight: '1.2' }],
        '3xl': ['2.25rem', { lineHeight: '1.2' }],
        '4xl': ['3rem', { lineHeight: '1.2' }],
        '5xl': ['3.75rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
