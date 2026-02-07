import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "node_modules/**",
      "assets/**",
      "data/**",
      "*.config.js"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
  },
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly"
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off" // Can enable later when adding PropTypes
    }
  }
];
