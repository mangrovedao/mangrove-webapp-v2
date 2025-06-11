/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "@tanstack/query"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:storybook/recommended",
  ],
  rules: {
    // These opinionated rules are enabled in stylistic-type-checked above.
    // Feel free to reconfigure them to your own preference.
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",

    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    semi: ["error", "never"],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-floating-promises": "off",
  },
  overrides: [
    {
      // Relax rules for trading-related files and @mangroveui/trade package usage
      files: [
        "app/trade/**/*",
        "app/earn/**/*", // Add earn-related files
        "app/swap/**/*", // Add swap-related files
        "hooks/**/*",
        "components/trading-view/**/*",
        "components/**/*", // Add all components
        "**/use-trade*",
        "**/trade-*",
        "**/vault*", // Add vault-related files
        "**/swap*", // Add swap-related files
        "app/api/**/*", // Add API routes
      ],
      rules: {
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        "@typescript-eslint/consistent-indexed-object-style": "off",
        "@typescript-eslint/no-unsafe-enum-comparison": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "@typescript-eslint/await-thenable": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-base-to-string": "off",
        "@typescript-eslint/non-nullable-type-assertion-style": "off",
        "@typescript-eslint/prefer-as-const": "off",
        "react/display-name": "off",
        "react/no-unescaped-entities": "off",
        "@next/next/no-img-element": "warn",
        "react-hooks/rules-of-hooks": "warn",
        "react-hooks/exhaustive-deps": "warn",
        "prefer-const": "warn",
      },
    },
    {
      // Exclude JS files from TypeScript-specific rules
      files: ["**/*.js"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
      },
    },
  ],
}

module.exports = config
