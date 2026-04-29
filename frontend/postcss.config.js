/**
 * File: frontend/postcss.config.js
 * Purpose: Tells CRA how to process CSS — runs Tailwind and Autoprefixer.
 * Without this file, @tailwind directives in index.css will NOT compile.
 * This runs automatically when you do `npm start` or `npm run build`.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
