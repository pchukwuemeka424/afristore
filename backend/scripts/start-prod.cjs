/**
 * Production server entry: works in Docker (server.js next to this file's cwd)
 * and locally after `next build` (under .next/standalone/backend/server.js).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const port = process.env.PORT || '3001';
const here = process.cwd();

const candidates = [
  path.join(here, 'server.js'),
  path.join(here, '.next', 'standalone', 'backend', 'server.js'),
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
