const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const devServerUrl = process.env.ELECTRON_START_URL || 'http://localhost:4200';

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
