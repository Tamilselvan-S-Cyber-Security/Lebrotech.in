/**
 * Production build with CRA ESLint disabled.
 * CRA's bundled eslint-plugin-react-hooks does not define React 19 rules
 * (set-state-in-effect, purity) referenced in eslint-disable comments.
 */
const { spawnSync } = require("child_process");

process.env.DISABLE_ESLINT_PLUGIN = "true";
process.env.CI = process.env.CI || "true";

const r = spawnSync("npx", ["craco", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(r.status || 0);
