/**
 * CI / dashboard deploy: ensure Pages project exists, then upload build/.
 * Cloudflare Deploy command should be: npm run deploy
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PROJECT = process.env.CF_PAGES_PROJECT || "lebrotechs";
const root = path.join(__dirname, "..");
process.chdir(root);

function run(args, { allowFail = false } = {}) {
  const r = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (r.status !== 0 && !allowFail) process.exit(r.status || 1);
  return r.status === 0;
}

const buildDir = path.join(root, "build");
if (!fs.existsSync(path.join(buildDir, "index.html"))) {
  console.error("Missing build/index.html — run npm run build first.");
  process.exit(1);
}

console.log(`Ensuring Cloudflare Pages project "${PROJECT}" exists…`);
run(["pages", "project", "create", PROJECT, "--production-branch=main"], {
  allowFail: true,
});

console.log(`Deploying build/ → ${PROJECT}…`);
run([
  "pages",
  "deploy",
  "build",
  `--project-name=${PROJECT}`,
  "--commit-dirty=true",
]);

console.log("Deploy finished.");
