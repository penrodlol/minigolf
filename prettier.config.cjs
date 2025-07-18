/** @type {import("prettier").Options} */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  printWidth: 120,
  tailwindFunctions: ['twMerge', 'twJoin'],
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
};
