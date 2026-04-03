/**
 * Production server entry.
 *
 * Standalone output location depends on how the image was built:
 *  - backend-only context (Coolify base=backend):  .next/standalone/server.js
 *  - monorepo context (Coolify base=/):            .next/standalone/backend/server.js
 *  - Docker image (server.js next to this script)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const port = process.env.PORT || '3001';
// Resolve from this file's directory, never from process.cwd().
const scriptDir = __dirname;               // …/scripts
const appRoot   = path.join(scriptDir, '..'); // one level up = backend root in image

const candidates = [
  // Docker image: server.js lives in same dir as .next/ (WORKDIR = /app in runner)
  path.join(appRoot, 'server.js'),
  // backend-only build: standalone at .next/standalone/
  path.join(appRoot, '.next', 'standalone', 'server.js'),
  // monorepo build: standalone at .next/standalone/backend/
  path.join(appRoot, '.next', 'standalone', 'backend', 'server.js'),
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
