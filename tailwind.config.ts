import { type Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        axiforma: ["Axiforma", ...defaultTheme.fontFamily.sans],
        roboto: ["RobotoMono", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          "dark-green": "hsl(var(--color-primary-dark-geen))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        green: {
          caribbean: "hsl(var(--color-green-caribbean))",
          bangladesh: "hsl(var(--color-green-bangladesh))",
        },
        black: {
          rich: " hsl(var(--color-black-rich)) ",
        },
        white: {
          DEFAULT: "hsl(var(--color-white-anti-flash)) ",
        },
        gray: {
          DEFAULT: "hsl(var(--color-gray))",
          "scale-200": "hsl(var(--color-gray-scale-200)) ",
          "scale-300": "hsl(var(--color-gray-scale-300)) ",
          "scale-400": "hsl(var(--color-gray-scale-400)) ",
          "scale-500": "hsl(var(--color-gray-scale-500)) ",
          "scale-600": "hsl(var(--color-gray-scale-600)) ",
        },
        red: {
          100: "hsl(var(--color-red-100))",
          400: "hsl(var(--color-red-400))",
          500: "hsl(var(--color-red-500))",
        },
        "blue-light": {
          100: "hsl(var(--color-blue-light-100))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config
