// Flat ESLint config for editors / MCP (optional).
// CRA build uses DISABLE_ESLINT_PLUGIN=true — see scripts/craco-build.js.
module.exports = [
  {
    ignores: [
      "build/**",
      "node_modules/**",
      "src/components/ui/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
