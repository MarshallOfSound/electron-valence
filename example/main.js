const electron = require('electron');
const path = require('path');

let mainWindow;

electron.app.on('ready', () => {
  mainWindow = new electron.BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`file://${path.resolve(__dirname, 'index.html')}`);
  mainWindow.webContents.openDevTools();
});
