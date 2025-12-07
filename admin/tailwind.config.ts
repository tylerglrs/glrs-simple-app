import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // GLRS Teal Color System (from Index/index.html)
      colors: {
        // Primary - Recovery Teal
        primary: {
          DEFAULT: "#069494",
          50: "#E6F7F7",
          100: "#CCEFEF",
          200: "#99DFDF",
          300: "#66CFCF",
          400: "#40E0D0",
          500: "#069494",
          600: "#057A7A",
          700: "#057575",
          800: "#045A5A",
          900: "#034040",
          foreground: "#FFFFFF",
        },
        // Secondary
        secondary: {
          DEFAULT: "#5795A7",
          50: "#EDF3F5",
          100: "#DBE7EB",
          200: "#B7CFD7",
          300: "#89B8CA",
          400: "#5795A7",
          500: "#4A7E8E",
          600: "#3D6775",
          700: "#30505C",
          800: "#233A43",
          900: "#16242A",
          foreground: "#FFFFFF",
        },
        // Accent - Warm Coral
        accent: {
          DEFAULT: "#FF8559",
          50: "#FFF2EE",
          100: "#FFE5DD",
          200: "#FFCBBB",
          300: "#FFB399",
          400: "#FF8559",
          500: "#FF6B3D",
          600: "#E54D1F",
          700: "#B33D18",
          800: "#802C11",
          900: "#4D1A0A",
          foreground: "#FFFFFF",
        },
        // Status colors
        success: {
          DEFAULT: "#2ECC71",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F39C12",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#E74C3C",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#3498DB",
          foreground: "#FFFFFF",
        },
        // UI colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "sans-serif",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
