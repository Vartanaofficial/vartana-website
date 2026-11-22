import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.cjs'],
    rules: {'@typescript-eslint/no-require-imports': 'off'},
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-netlify/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".qa-*/**",
    ".qa-*",
    ".netlify/**",
    "backup-*/**",
    "backups/**",
    "app/api copy/**",
    "**/*.backup*",
    "**/*.bak*",
  ]),
]);

export default eslintConfig;
