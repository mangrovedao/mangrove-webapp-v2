/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
  tailwindFunctions: ["clsx", "cn", "cva"],
  tabWidth: 2,
  semi: false,
}

export default config
