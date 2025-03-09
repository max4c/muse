const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const fileSystem = require('./services/fileSystem');
const createSampleFiles = require('./utils/createSampleFiles');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Open DevTools during development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Temporarily open DevTools for debugging
  mainWindow.webContents.openDevTools();
}

// Create window when app is ready
app.whenReady().then(() => {
  // Create sample files for testing
  const defaultDirectory = createSampleFiles();
  
  // Set the default directory in the file system service
  fileSystem.setCurrentDirectory(defaultDirectory);
  
  createWindow();
  setupIpcHandlers();

  app.on('activate', function () {
    // On macOS, recreate window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Set up IPC handlers for file operations
function setupIpcHandlers() {
  // Get current directory
  ipcMain.handle('get-current-directory', () => {
    return fileSystem.getCurrentDirectory();
  });
  
  // Set current directory
  ipcMain.handle('set-current-directory', (event, directoryPath) => {
    return fileSystem.setCurrentDirectory(directoryPath);
  });
  
  // List markdown files
  ipcMain.handle('list-markdown-files', () => {
    return fileSystem.listMarkdownFiles();
  });
  
  // Read a markdown file
  ipcMain.handle('read-file', (event, filePath) => {
    return fileSystem.readMarkdownFile(filePath);
  });
  
  // Write to a markdown file
  ipcMain.handle('write-file', (event, filePath, content) => {
    return fileSystem.writeMarkdownFile(filePath, content);
  });
  
  // Create a new markdown file
  ipcMain.handle('create-file', (event, fileName, content) => {
    return fileSystem.createMarkdownFile(fileName, content);
  });
  
  // Delete a markdown file
  ipcMain.handle('delete-file', (event, filePath) => {
    return fileSystem.deleteMarkdownFile(filePath);
  });
}

// Handle any IPC events here
// Example: ipcMain.handle('some-event', async (event, ...args) => {...})
