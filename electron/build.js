const builder = require('electron-builder');
const path = require('node:path');
const fs = require('node:fs');
const baseConfig = require('./electron-builder.win.json');

// Obtener rol opcional desde los argumentos: --role=admin o --role=user
const roleArg = process.argv.find(arg => arg.startsWith('--role='));
const role = roleArg ? roleArg.split('=')[1].toLowerCase() : null;

let config = { ...baseConfig };
let outputDir = path.resolve(__dirname, '../release');

if (role) {
  if (!['admin', 'user'].includes(role)) {
    console.error(`\x1b[31m[Error]\x1b[0m Rol "${role}" no válido. Opciones permitidas: admin, user.`);
    process.exit(1);
  }

  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
  const appName = `MiAplicacion ${roleTitle}`;
  outputDir = path.resolve(__dirname, `../release/${role}`);

  console.log(`\x1b[36m[Builder]\x1b[0m Generando instalador exclusivo para el rol: \x1b[32m${role.toUpperCase()}\x1b[0m (${appName})...`);
  config = {
    ...baseConfig,
    productName: appName,
    appId: `com.tuapp.electron.${role}`,
    directories: {
      ...(baseConfig.directories || {}),
      output: outputDir
    },
    extraMetadata: {
      userRole: role
    },
    nsis: {
      ...baseConfig.nsis,
      shortcutName: appName,
      include: undefined, // No usar script dual cuando se compila un rol único
      createDesktopShortcut: true,
      createStartMenuShortcut: true
    }
  };
} else {
  console.log(`\x1b[36m[Builder]\x1b[0m Generando instalador unificado con doble instalación en subcarpetas independientes (\x1b[32mAdmin\x1b[0m y \x1b[32mUser\x1b[0m)...`);
  config = {
    ...baseConfig,
    directories: {
      ...(baseConfig.directories || {}),
      output: outputDir
    },
    nsis: {
      ...baseConfig.nsis,
      include: path.resolve(__dirname, 'installer.nsh')
    }
  };
}

console.log(`\x1b[36m[Builder]\x1b[0m Directorio de salida: ${outputDir}`);

// Limpiar archivos previos si existe la carpeta de salida (preservando .gitignore)
if (fs.existsSync(outputDir)) {
  try {
    const entries = fs.readdirSync(outputDir);
    for (const entry of entries) {
      if (entry !== '.gitignore') {
        fs.rmSync(path.join(outputDir, entry), { recursive: true, force: true });
      }
    }
    console.log(`\x1b[33m[Builder]\x1b[0m Contenido previo de "${path.basename(outputDir)}" limpiado exitosamente.`);
  } catch (cleanErr) {
    console.warn(`\x1b[33m[Builder Advertencia]\x1b[0m No se pudo limpiar completamente la carpeta previa:`, cleanErr.message);
  }
}

builder
  .build({
    targets: builder.Platform.WINDOWS.createTarget(['nsis'], builder.Arch.x64),
    config: config
  })
  .then(() => {
    if (role) {
      console.log(`\x1b[32m[Builder]\x1b[0m Instalador para rol [${role}] generado exitosamente en "release/${role}".`);
    } else {
      console.log(`\x1b[32m[Builder]\x1b[0m Instalador unificado dual generado exitosamente en "release/".`);
      console.log(`\x1b[36m[Info]\x1b[0m Al ejecutarse en Windows, creará las dos instalaciones independientes:`);
      console.log(`       - Admin: %LOCALAPPDATA%\\Programs\\MiAplicacion\\Admin`);
      console.log(`       - User:  %LOCALAPPDATA%\\Programs\\MiAplicacion\\User`);
    }
  })
  .catch((err) => {
    console.error('\x1b[31m[Builder Error]\x1b[0m', err);
    if (err.message && err.message.includes('EPERM')) {
      console.error('\n\x1b[33m[Sugerencia para EPERM]\x1b[0m Cierra cualquier proceso de la app o ventana del explorador abierta en la carpeta "release" y reintenta.');
    }
    process.exit(1);
  });
