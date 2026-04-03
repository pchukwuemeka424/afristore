/**
 * Production server entry: works in Docker (server.js next to this file's cwd)
 * and locally after `next build` (under .next/standalone/backend/server.js).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const port = process.env.PORT || '3001';
// Resolve from this file (…/backend/scripts/), not process.cwd() — Coolify/Docker may run
// `node scripts/start-prod.cjs` with a cwd that is not the app root.
const backendRoot = path.join(__dirname, '..');

const candidates = [
  path.join(backendRoot, 'server.js'),
  path.join(backendRoot, '.next', 'standalone', 'backend', 'server.js'),
];

for (const main of candidates) {
  if (!fs.existsSync(main)) continue;
  const appDir = path.dirname(main);
  const r = spawnSync(process.execPath, [main], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(port) },
    cwd: appDir,
  });
  process.exit(r.status !== null && r.status !== undefined ? r.status : 1);
}

console.error('No production server found. Run `npm run build` first.');
process.exit(1);
