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
        ubuntu: ["Ubuntu", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          "dark-green": "hsl(var(--color-primary-dark-green))",
          "bush-green": "hsl(var(--color-primary-bush-green))",
          "solid-black": "hsl(var(--color-primary-solid-black))",
          "night-woods": "hsl(var(--color-primary-night-woods))",
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
          foreground: "hsl(var(--text-secondary))",
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
          "scale-100": "hsl(var(--color-gray-scale-100)) ",
          "scale-200": "hsl(var(--color-gray-scale-200)) ",
          "scale-300": "hsl(var(--color-gray-scale-300)) ",
          "scale-400": "hsl(var(--color-gray-scale-400)) ",
          "scale-500": "hsl(var(--color-gray-scale-500)) ",
          "scale-600": "hsl(var(--color-gray-scale-600)) ",
          "scale-700": "hsl(var(--color-gray-scale-700)) ",
        },
        red: {
          100: "hsl(var(--color-red-100))",
          400: "hsl(var(--color-red-400))",
          500: "hsl(var(--color-red-500))",
        },
        "blue-light": {
          100: "hsl(var(--color-blue-light-100))",
        },
        cloud: {
          "00": "hsl(var(--color-cloud-00))",
          100: "hsl(var(--color-cloud-100))",
          200: "hsl(var(--color-cloud-200))",
          300: "hsl(var(--color-cloud-300))",
          400: "hsl(var(--color-cloud-400))",
          500: "hsl(var(--color-cloud-500))",
        },
        cherry: {
          100: "hsl(var(--color-cherry-100))",
          400: "hsl(var(--color-cherry-400))",
        },
        mango: {
          100: "hsl(var(--color-mango-100))",
          200: "hsl(var(--color-mango-200))",
          300: "hsl(var(--color-mango-300))",
        },
        // New variables
        bg: {
          active: "hsl(var(--bg-active))",
          disabled: "hsl(var(--bg-disabled))",
          "disabled-subtle": "hsl(var(--bg-disabled-subtle))",
          primary: "hsl(var(--bg-primary))",
          "primary-hover": "hsl(var(--bg-primary-hover))",
          secondary: "hsl(var(--bg-secondary))",
          tertiary: "hsl(var(--bg-tertiary))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          brand: "hsl(var(--border-brand))",
          primary: "hsl(var(--border-primary))",
          secondary: "hsl(var(--border-secondary))",
          tertiary: "hsl(var(--border-tertiary))",
        },
        "nav-item-button": {
          "bg-active": "hsl(var(--nav-item-button-bg-active))",
          "icon-fg": "hsl(var(--nav-item-button-icon-fg))",
          "icon-fg-active": "hsl(var(--nav-item-button-icon-fg-active))",
          "icon-fg-hover": "hsl(var(--nav-item-button-icon-fg-hover))",
        },
        button: {
          primary: {
            bg: "hsl(var(--button-primary-bg))",
            "bg-hover": "hsl(var(--button-primary-bg-hover))",
            fg: "hsl(var(--button-primary-fg))",
            "fg-hover": "hsl(var(--button-primary-fg-hover))",
            fg_disabled: "hsl(var(--button-primary-fg_disabled))",
          },
          secondary: {
            bg: "hsl(var(--button-secondary-bg))",
            "bg-hover": "hsl(var(--button-secondary-bg-hover))",
            fg: "hsl(var(--button-secondary-fg))",
            "fg-hover": "hsl(var(--button-secondary-fg-hover))",
          },
          tertiary: {
            bg: "hsl(var(--button-tertiary-bg))",
            "bg-hover": "hsl(var(--button-tertiary-bg-hover))",
            fg: "hsl(var(--button-tertiary-fg))",
            "fg-hover": "hsl(var(--button-tertiary-fg-hover))",
          },
        },
        fg: {
          "disabled-subtle": "hsl(var(--fg-disabled-subtle))",
          primary: "hsl(var(--fg-primary))",
          quaternary: "hsl(var(--fg-quaternary))",
          secondary: "hsl(var(--fg-secondary))",
          tertiary: "hsl(var(--fg-tertiary))",
          "tertiary-hover": "hsl(var(--fg-tertiary-hover))",
        },
        text: {
          brand: "hsl(var(--text-brand))",
          disabled: "hsl(var(--text-disabled))",
          placeholder: "hsl(var(--text-placeholder))",
          primary: "hsl(var(--text-primary))",
          quaternary: "hsl(var(--text-quaternary))",
          secondary: "hsl(var(--text-secondary))",
          "secondary-hover": "hsl(var(--text-secondary-hover))",
          tertiary: "hsl(var(--text-tertiary))",
          "tertiary-hover": "hsl(var(--text-tertiary-hover))",
        },
      },
      maxWidth: {
        "8xl": "90rem",
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
      boxShadow: {
        error: "0px 0px 0px 16px rgba(56, 18, 18, 0.25)",
        success: "0 0 0 16px rgba(3, 34, 33, 0.25)",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(69.86% 175.89% at 51.06% 50%, #1C3A40 0%, #12272B 72.5%)",
        "level-chart":
          "linear-gradient(180deg, rgba(3, 98, 76, 0.00) 57.96%, rgba(3, 98, 76, 0.30) 99.5%)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config
