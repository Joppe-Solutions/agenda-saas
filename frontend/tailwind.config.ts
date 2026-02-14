import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        blue: {
          50: "hsl(var(--brand-blue-50))",
          100: "hsl(var(--brand-blue-100))",
          200: "hsl(var(--brand-blue-200))",
          300: "hsl(var(--brand-blue-300))",
          400: "hsl(var(--brand-blue-400))",
          500: "hsl(var(--brand-blue-500))",
          600: "hsl(var(--brand-blue-600))",
          700: "hsl(var(--brand-blue-700))",
          800: "hsl(var(--brand-blue-800))",
          900: "hsl(var(--brand-blue-900))",
          950: "hsl(var(--brand-blue-950))",
          deep: "hsl(var(--brand-blue-deep))",
        },
        cyan: {
          50: "hsl(var(--brand-cyan-50))",
          100: "hsl(var(--brand-cyan-100))",
          200: "hsl(var(--brand-cyan-200))",
          300: "hsl(var(--brand-cyan-300))",
          400: "hsl(var(--brand-cyan-400))",
          500: "hsl(var(--brand-cyan-500))",
          600: "hsl(var(--brand-cyan-600))",
          700: "hsl(var(--brand-cyan-700))",
          800: "hsl(var(--brand-cyan-800))",
          900: "hsl(var(--brand-cyan-900))",
          950: "hsl(var(--brand-cyan-950))",
        },
        yellow: {
          50: "hsl(var(--brand-yellow-50))",
          100: "hsl(var(--brand-yellow-100))",
          200: "hsl(var(--brand-yellow-200))",
          300: "hsl(var(--brand-yellow-300))",
          400: "hsl(var(--brand-yellow-400))",
          500: "hsl(var(--brand-yellow-500))",
          600: "hsl(var(--brand-yellow-600))",
          700: "hsl(var(--brand-yellow-700))",
          800: "hsl(var(--brand-yellow-800))",
          900: "hsl(var(--brand-yellow-900))",
          950: "hsl(var(--brand-yellow-950))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          bg: "hsl(var(--success-bg))",
          fg: "hsl(var(--success-fg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          bg: "hsl(var(--warning-bg))",
          fg: "hsl(var(--warning-fg))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          bg: "hsl(var(--danger-bg))",
          fg: "hsl(var(--danger-fg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          bg: "hsl(var(--info-bg))",
          fg: "hsl(var(--info-fg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "30px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "120": "30rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(2, 6, 23, 0.06)",
        md: "0 6px 18px rgba(2, 6, 23, 0.10)",
        lg: "0 14px 40px rgba(2, 6, 23, 0.14)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "240ms",
      },
      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-spring",
        "slide-up": "slide-up 0.3s ease-spring",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
