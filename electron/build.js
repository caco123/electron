const builder = require('electron-builder');
const path = require('node:path');
const fs = require('node:fs');
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
const outputDir = path.resolve(__dirname, `../release/${role}`);

console.log(`\x1b[36m[Builder]\x1b[0m Preparando instalador para el rol: \x1b[32m${role.toUpperCase()}\x1b[0m (${appName})...`);
console.log(`\x1b[36m[Builder]\x1b[0m Directorio de salida: ${outputDir}`);

// Intentar limpiar la carpeta de salida específica del rol si existe
if (fs.existsSync(outputDir)) {
  try {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log(`\x1b[33m[Builder]\x1b[0m Carpeta previa de "${role}" limpiada exitosamente.`);
  } catch (cleanErr) {
    console.warn(`\x1b[33m[Builder Advertencia]\x1b[0m No se pudo limpiar completamente la carpeta previa (puede haber archivos en uso):`, cleanErr.message);
  }
}

// Configuración adaptada por rol
const config = {
  ...baseConfig,
  productName: appName,
  appId: `com.tuapp.electron.${role}`,
  directories: {
    ...(baseConfig.directories || {}),
    output: `../release/${role}`
  },
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
    console.log(`\x1b[32m[Builder]\x1b[0m Instalador para rol [${role}] generado exitosamente en "release/${role}".`);
  })
  .catch((err) => {
    console.error('\x1b[31m[Builder Error]\x1b[0m', err);
    if (err.message && err.message.includes('EPERM')) {
      console.error('\n\x1b[33m[Sugerencia para EPERM]\x1b[0m Cierra cualquier proceso de la app o ventana del explorador abierta en la carpeta "release" y reintenta.');
    }
    process.exit(1);
  });
