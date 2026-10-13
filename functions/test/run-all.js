import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
for (const file of ['run-rules.js', 'run-server.js']) {
  const result = spawnSync(process.execPath, ['--test', fileURLToPath(new URL(file, import.meta.url))], {
    stdio: 'inherit', env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
