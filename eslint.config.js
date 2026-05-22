import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import babelParser from "@babel/eslint-parser";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "backend"]),
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ["@babel/plugin-syntax-jsx"],
        },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^(motion|[A-Z_])",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
