/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
  // Safelist any classes that might be dynamically generated
  safelist: [
    {
      pattern: /^bg-(indigo|violet|green|pink|sky|slate)-(50|100|200|600|700|800|900|950)/,
    },
    {
      pattern: /^text-(white|gray)-(900|950)/,
    },
  ],
}