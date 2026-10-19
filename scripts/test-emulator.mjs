// Run only the isolated demo Firestore emulator, without Firebase CLI shutdown hooks.
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { existsSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const jar = process.env.FIRESTORE_EMULATOR_JAR;
if (!jar || !existsSync(jar)) throw new Error('Set FIRESTORE_EMULATOR_JAR to the official downloaded Firestore emulator JAR. Java 21+ is required.');
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
const port = 8088;
const reachable = () => new Promise(resolve => {
  const socket = createConnection({ host: '127.0.0.1', port });
  socket.setTimeout(300); socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => { socket.destroy(); resolve(false); });
  socket.once('timeout', () => { socket.destroy(); resolve(false); });
});
if (await reachable()) throw new Error('Port 8088 is occupied. No tests were run against an unowned emulator.');
mkdirSync(resolve(root, 'work'), { recursive: true });
const log = openSync(resolve(root, 'work/emulator-child.log'), 'w');
const emulator = spawn(java, ['-jar', jar, '--host', '127.0.0.1', '--port', String(port), '--project_id', 'demo-asbesoc-membership', '--rules', resolve(root, 'firestore.rules'), '--single_project_mode', 'true'], { cwd: root, windowsHide: true, stdio: ['ignore', log, log] });
let launchError;
emulator.on('error', error => { launchError = error; });
try {
  const deadline = Date.now() + 30000;
  while (!await reachable()) {
    if (launchError) throw launchError;
    if (emulator.exitCode !== null || Date.now() > deadline) throw new Error('Emulator did not start; inspect work/emulator-child.log.');
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  const code = await new Promise((resolveCode, reject) => {
    const tests = spawn(process.execPath, ['functions/test/run-all.js'], { cwd: root, windowsHide: true, stdio: 'inherit',
      env: { ...process.env, FIRESTORE_EMULATOR_HOST: `127.0.0.1:${port}`, GCLOUD_PROJECT: 'demo-asbesoc-membership', FIREBASE_CONFIG: '{"projectId":"demo-asbesoc-membership"}' } });
    tests.once('error', reject); tests.once('exit', code => resolveCode(code ?? 1));
  });
  process.exitCode = code;
} finally {
  if (emulator.exitCode === null) {
    const stopped = new Promise(resolve => emulator.once('exit', resolve));
    emulator.kill(); await stopped;
  }
  closeSync(log);
}
