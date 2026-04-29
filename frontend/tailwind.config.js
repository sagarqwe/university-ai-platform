/**
 * File: frontend/tailwind.config.js
 * Purpose: Tailwind CSS configuration for the React app.
 *
 * Key settings:
 *  - content: tells Tailwind which files to scan for class names
 *  - safelist: protects dynamically-constructed class names from purging
 *  - theme: extends with brand colors, custom fonts, shadow tokens
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all source files for Tailwind class usage
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],

  // Safelist: classes built with string interpolation (e.g. `bg-${color}-500/10`)
  // Without this, Tailwind's purger may remove them from the production build.
  safelist: [
    // MetricCard dynamic colors
    { pattern: /^(bg|border|text)-(indigo|emerald|amber|violet|rose)-/ },
    // Confidence badge colors
    { pattern: /^(bg|border|text)-(red|amber|emerald)-/ },
    // Grid columns
    { pattern: /^grid-cols-\d$/ },
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.1)',
        'glow-indigo':'0 0 20px 0 rgba(99,102,241,0.25)',
        'glow-emerald':'0 0 20px 0 rgba(16,185,129,0.25)',
      },
      animation: {
        'bounce-slow': 'bounce 1.2s infinite',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },

  plugins: [],
};
