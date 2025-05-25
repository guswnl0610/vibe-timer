const {app, BrowserWindow, ipcMain, Notification} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.cjs'),
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
