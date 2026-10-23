const builder = require('electron-builder');
const path = require('node:path');
const baseConfig = require('./electron-builder.win.json');

// Obtener el rol desde los argumentos: --role=admin o --role=user (por defecto 'user')
const roleArg = process.argv.find(arg => arg.startsWith('--role='));
const role = roleArg ? roleArg.split('=')[1].toLowerCase() : 'user';

if (!['admin', 'user'].includes(role)) {
  console.error(`\x1b[31m[Error]\x1b[0m Rol "${role}" no válido. Opciones permitidas: admin, user.`);
  process.exit(1);
}

const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
const appName = `MiAplicacion ${roleTitle}`;

console.log(`\x1b[36m[Builder]\x1b[0m Preparando instalador para el rol: \x1b[32m${role.toUpperCase()}\x1b[0m (${appName})...`);

// Sobrescribir dinámicamente según el rol
const config = {
  ...baseConfig,
  productName: appName,
  appId: `com.tuapp.electron.${role}`,
  extraMetadata: {
    userRole: role
  },
  nsis: {
    ...(baseConfig.nsis || {}),
    shortcutName: appName
  }
};

builder
  .build({
    targets: builder.Platform.WINDOWS.createTarget(['nsis'], builder.Arch.x64),
    config: config
  })
  .then(() => {
    console.log(`\x1b[32m[Builder]\x1b[0m Instalador para rol [${role}] generado exitosamente en ${baseConfig.directories?.output || 'release'}.`);
  })
  .catch((err) => {
    console.error('\x1b[31m[Builder Error]\x1b[0m', err);
    process.exit(1);
  });
