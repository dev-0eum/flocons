// flocons ESLint (flat config) — eslint-config-expo
// `npm run lint` == `expo lint`
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'node_modules.nosync/*', '.expo/*'],
  },
]);
