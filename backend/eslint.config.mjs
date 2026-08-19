import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

// The lint config this package has always been missing.
//
// package.json ran `eslint "{src,apps,libs,test}/**/*.ts"` with no config file
// here at all. ESLint walked up, found the Next.js flat config at the repo root,
// saw `backend/**` in its ignores, and reported that every file it had been
// asked to lint was ignored. `pnpm --filter erp-backend lint` has never linted a
// single line.
//
// Flat config, because finding the root's flat config is what put ESLint into
// flat mode in the first place — an .eslintrc here would be ignored outright.
export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Nest resolves dependencies from emitted constructor metadata, so return
      // types on providers are inferred and spelling them out adds nothing.
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]
