const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
    ignores: ['dist/*', 'node_modules/*', 'ios/*', 'android/*', '.expo/*'],
  },
]);