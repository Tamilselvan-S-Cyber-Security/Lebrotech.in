/**
 * Writes public/version.json so you can confirm Cloudflare is serving THIS build.
 * Open https://your-domain/version.json after deploy — buildId must match local build.
 */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "public", "version.json");
const payload = {
  name: "lerbo-tech",
  buildId: new Date().toISOString(),
  builtAt: Date.now(),
};

fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`[build-meta] wrote ${out} buildId=${payload.buildId}`);
