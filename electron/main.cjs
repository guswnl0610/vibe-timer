const {app, BrowserWindow, ipcMain, Notification} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;

function createWindow() {
  // Get absolute path to preload script
  const preloadPath = path.resolve(__dirname, 'preload.cjs');

  // Log to help debugging
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  // Load the app
  const startUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools if in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle notifications from renderer process
ipcMain.on('show-notification', (event, {title, body}) => {
  // Check if Notifications are supported
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      silent: true, // Don't play the default sound as we're using our own
    });

    notification.show();
  }
});

// Handle IPC messages from renderer
ipcMain.on('message-from-renderer', (event, arg) => {
  console.log(arg);
  event.reply('message-from-main', 'Hello from main process');
});
