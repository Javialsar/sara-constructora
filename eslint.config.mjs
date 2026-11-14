import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "public/**",
    "docs/**",
    "next-env.d.ts",
    "scripts/**",
    "tests/**",
    "backend/**",
    "frontend/**",
    "db/**",
    "ECC/**",
    ".agent/**",
    ".agents/**",
    ".agentMemory/**",
    "scratch/**",
    "insumos_temp.tsx",
    "page_backup.tsx",
    "prev_page.tsx",
    "*.js",
    "*.mjs",
    "*.cjs",
    "*.py"
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",
      "react/no-unescaped-entities": "off",
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn"
    }
  }
]);

export default eslintConfig;
