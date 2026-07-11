/**
 * Build + deploy to Cloudflare Pages and print how to verify the new version.
 * Requires: npx wrangler login  (or CLOUDFLARE_API_TOKEN)
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  if (r.status !== 0) process.exit(r.status || 1);
}

const root = path.join(__dirname, "..");
process.chdir(root);

console.log("\n[1/3] Writing build meta…");
run("node", ["scripts/write-build-meta.js"]);

console.log("\n[2/3] Building production bundle…");
run("npm", ["run", "build"], {
  env: { ...process.env, DISABLE_ESLINT_PLUGIN: "true", CI: "true" },
});

const versionPath = path.join(root, "build", "version.json");
if (!fs.existsSync(versionPath)) {
  console.error("Missing build/version.json — aborting deploy.");
  process.exit(1);
}
const version = JSON.parse(fs.readFileSync(versionPath, "utf8"));
console.log(`\nBuild ID: ${version.buildId}`);

console.log("\n[3/3] Deploying build/ → Cloudflare (lebrotechs)…");
run("npx", [
  "wrangler",
  "deploy",
]);

console.log(`
────────────────────────────────────────
Deploy finished. Verify the NEW version:

  1) Open:  https://YOUR_DOMAIN/version.json
     Expect buildId: ${version.buildId}

  2) Hard refresh: Ctrl+Shift+R (or clear cache)

  3) Cloudflare Dashboard → Caching → Configuration → Purge Everything
     (if custom domain still shows old UI)

  4) Workers & Pages → lebrotechs → Deployments → confirm latest is Active
────────────────────────────────────────
`);
