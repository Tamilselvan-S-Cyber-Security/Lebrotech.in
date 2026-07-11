/**
 * CI / local: deploy CRA `build/` as Workers static assets.
 * Cloudflare Deploy command must be: npm run deploy
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

function wranglerBin() {
  const local = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  if (fs.existsSync(local)) return { cmd: process.execPath, argsPrefix: [local] };
  return { cmd: "npx", argsPrefix: ["wrangler"] };
}

function runWrangler(args) {
  const { cmd, argsPrefix } = wranglerBin();
  const r = spawnSync(cmd, [...argsPrefix, ...args], {
    stdio: "inherit",
    shell: cmd === "npx",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

const buildDir = path.join(root, "build");
const indexHtml = path.join(buildDir, "index.html");
if (!fs.existsSync(indexHtml)) {
  console.error("Missing build/index.html — run npm run build first.");
  process.exit(1);
}

const html = fs.readFileSync(indexHtml, "utf8");
if (!html.includes('id="root"') && !html.includes("id='root'")) {
  console.error("build/index.html is not the CRA app (missing #root) — aborting.");
  process.exit(1);
}

const staticDir = path.join(buildDir, "static");
if (!fs.existsSync(staticDir)) {
  console.error("Missing build/static — CRA build looks incomplete — aborting.");
  process.exit(1);
}

// Workers + not_found_handling SPA: /* → /index.html in _redirects causes API error 100324
const redirectsPath = path.join(buildDir, "_redirects");
if (fs.existsSync(redirectsPath)) {
  fs.unlinkSync(redirectsPath);
  console.log("Removed build/_redirects (SPA handled by wrangler.toml).");
}

console.log("Deploying build/ → Worker lebrotechs (static assets)…");
runWrangler(["deploy"]);
console.log("Deploy finished.");
