const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const devServerUrl = process.env.ELECTRON_START_URL || 'http://localhost:4200';

function detectRole() {
  // 1. Argumento CLI: --role=admin o --role=user
  const roleArg = process.argv.find((arg) => arg.startsWith('--role='));
  if (roleArg) {
    const r = roleArg.split('=')[1].toLowerCase();
    if (['admin', 'user'].includes(r)) return r;
  }

  // 2. Archivo role.json generado por el instalador en la carpeta del rol
  const searchPaths = [
    path.join(__dirname, 'role.json'),
    path.join(__dirname, '../role.json'),
    path.join(process.resourcesPath || '', 'role.json'),
    path.join(app.getAppPath(), 'role.json'),
    path.join(path.dirname(process.execPath), 'role.json'),
  ];
  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (parsed.role && ['admin', 'user'].includes(parsed.role.toLowerCase())) {
          return parsed.role.toLowerCase();
        }
      } catch (_) {}
    }
  }

  // 3. Fallback por nombre de ejecutable o ruta de instalación
  const execPath = process.execPath.toLowerCase();
  if (execPath.includes('admin')) return 'admin';
  if (execPath.includes('user')) return 'user';

  return 'user';
}

const currentRole = detectRole();
const roleTitle = currentRole === 'admin' ? 'Admin' : 'User';
const appTitle = `MiAplicacion ${roleTitle}`;

// Configurar userData aislado para que las dos instalaciones puedan ejecutarse simultáneamente
try {
  const baseUserData = app.getPath('appData');
  app.setPath('userData', path.join(baseUserData, `MiAplicacion-${currentRole}`));
  app.setName(appTitle);
} catch (err) {
  console.warn('No se pudo configurar userData personalizado:', err.message);
}

function getIndexPath() {
  // Check common Angular dist output paths
  const possiblePaths = [
    path.join(__dirname, '../dist/electron/browser/index.html'),
    path.join(__dirname, '../dist/electron/index.html'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return possiblePaths[0];
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: appTitle,
    width: 1040,
    height: 820,
    minWidth: 520,
    minHeight: 600,
    backgroundColor: '#020617', // Match slate-950 to avoid white flash
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.setTitle(appTitle);
    mainWindow.show();
    if (isDev) {
      // mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.warn(`Could not connect to dev server at ${devServerUrl}, falling back to built files...`, err.message);
      const indexPath = getIndexPath();
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      } else {
        console.error('Built index.html not found. Please run "npm run build:electron" first.');
      }
    });
  } else {
    const indexPath = getIndexPath();
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Error loading index.html:', err);
    });
  }
}

// IPC Handlers for desktop integration
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('app:platform', () => process.platform);
ipcMain.handle('app:role', () => currentRole);
ipcMain.handle('app:name', () => appTitle);

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
