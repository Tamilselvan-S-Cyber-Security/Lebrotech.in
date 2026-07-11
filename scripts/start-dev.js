// Start CRA/craco on the first free port (3001+) — no interactive port prompt.
const net = require("net");
const { spawn } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PREFERRED = parseInt(process.env.PORT, 10) || 3001;
const MAX_TRIES = 20;

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen(port, "0.0.0.0", () => {
      server.close(() => resolve(true));
    });
  });
}

async function findPort(start) {
  for (let i = 0; i < MAX_TRIES; i += 1) {
    const port = start + i;
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found between ${start} and ${start + MAX_TRIES - 1}`);
}

(async () => {
  const port = await findPort(PREFERRED);
  console.log(`\nLERBO TECH dev server → http://localhost:${port}\n`);

  const cracoBin = path.join(__dirname, "..", "node_modules", "@craco", "craco", "dist", "bin", "craco.js");
  const child = spawn(process.execPath, [cracoBin, "start"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
  });

  child.on("exit", (code) => process.exit(code ?? 0));
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
