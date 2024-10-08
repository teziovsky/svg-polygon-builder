import globals from "globals";
import pluginJs from "@eslint/js";
import * as tsEslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...pluginVue.configs["flat/strongly-recommended"],
  {
    files: ["*.vue", "**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsEslint.parser,
      },
    },
    rules: {
      "vue/define-emits-declaration": ["error", "type-based"],
    },
  },
  eslintConfigPrettier,
];
