import pluginVue from 'eslint-plugin-vue';
import unusedImports from 'eslint-plugin-unused-imports';

/** Minimal lint: unused imports only (no style or layout rules). */
export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,vue}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
];
