import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@next/next/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react", "react-hooks"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    ignorePatterns: ["node_modules/", ".next/", "out/"],
  }
];
