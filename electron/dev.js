const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const electronBinary = require('electron');

function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function waitForPort(port, host = 'localhost', timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const isOpen = await checkPort(port, host);
      if (isOpen) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Timeout esperando al puerto ${port}`));
      }
    }, 500);
  });
}

async function run() {
  const port = 4200;
  const isAlreadyRunning = await checkPort(port);
  let ngProcess = null;

  if (isAlreadyRunning) {
    console.log(`\x1b[32m✔ Servidor de Angular detectado en http://localhost:${port}.\x1b[0m`);
    console.log('\x1b[36m🚀 Abriendo Electron...\x1b[0m');
  } else {
    console.log(`\x1b[34mℹ Iniciando servidor de Angular (ng serve)...\x1b[0m`);
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    ngProcess = spawn(npmCmd, ['run', 'start'], {
      stdio: 'inherit',
      env: process.env,
    });

    console.log(`\x1b[33m⏳ Esperando a que el servidor esté listo en el puerto ${port}...\x1b[0m`);
    try {
      await waitForPort(port);
      console.log('\x1b[32m✔ Servidor listo. Abriendo Electron...\x1b[0m');
    } catch (err) {
      console.error('\x1b[31m✖ Error esperando el servidor de Angular:\x1b[0m', err.message);
      if (ngProcess) ngProcess.kill();
      process.exit(1);
    }
  }

  const appRoot = path.join(__dirname, '..');
  const electronProcess = spawn(electronBinary, [appRoot], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  electronProcess.on('close', (code) => {
    if (ngProcess) {
      console.log('\nCerrando servidor Angular...');
      ngProcess.kill();
    }
    process.exit(code || 0);
  });

  const cleanup = () => {
    if (ngProcess) ngProcess.kill();
    if (electronProcess) electronProcess.kill();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

run();
