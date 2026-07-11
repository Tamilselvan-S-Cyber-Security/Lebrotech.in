/**
 * CI deploy: upload CRA build/ as Workers static assets (replaces Hello World Worker).
 * Dashboard Deploy command: npm run deploy
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

function run(args) {
  const r = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

const indexHtml = path.join(root, "build", "index.html");
if (!fs.existsSync(indexHtml)) {
  console.error("Missing build/index.html — run npm run build first.");
  process.exit(1);
}

const html = fs.readFileSync(indexHtml, "utf8");
if (!html.includes("Lerbo Tech") && !html.includes("root")) {
  console.error("build/index.html does not look like the CRA app — aborting.");
  process.exit(1);
}

console.log("Deploying build/ → Worker lebrotechs (static assets)…");
run(["deploy", "--commit-dirty=true"]);
console.log("Deploy finished. Open the workers.dev URL from the wrangler output.");
