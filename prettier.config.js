// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
  // Sorts Tailwind classes in className and in tv() style definitions
  tailwindStylesheet: './packages/app-core/src/styles.css',
  tailwindFunctions: ['tv'],
  // trailingComma: "es5",
  // tabWidth: 4,
  // semi: false,
};

export default config;
