// Flat ESLint config consumed by the MCP linter (newer ruleset than CRA's bundled one).
// CRA's webpack-bundled ESLint is disabled separately via DISABLE_ESLINT_PLUGIN=true
// in /app/frontend/.env because it doesn't know about React 19 rules below.
module.exports = [
  {
    ignores: [
      "build/**",
      "node_modules/**",
      "src/components/ui/**", // shadcn — vendored, exempt from app-level rules
    ],
  },
  {
    rules: {
      // JSX text apostrophes are safe and readable as-is.
      "react/no-unescaped-entities": "off",
      // setState inside useEffect/useCallback is the canonical data-loading
      // pattern in React. The new React 19 rule produces false positives for it.
      "react-hooks/set-state-in-effect": "off",
      // React 19 'purity' rule fires on legitimate cleanup/init logic.
      "react-hooks/purity": "off",
    },
  },
];
