const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // For sending messages to main process
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['request-files', 'save-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // For invoking methods on main process and getting a result
  invoke: async (channel, ...args) => {
    // Whitelist channels
    const validChannels = [
      'get-current-directory',
      'set-current-directory',
      'list-markdown-files',
      'read-file',
      'write-file',
      'create-file',
      'delete-file',
      'db-create',
      'db-read',
      'db-update',
      'db-delete'
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
  },
  
  // For receiving messages from the main process
  receive: (channel, func) => {
    // Whitelist channels
    const validChannels = ['file-update', 'db-update', 'error'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // File system operations
  files: {
    // Get current directory
    getCurrentDirectory: async () => {
      return await ipcRenderer.invoke('get-current-directory');
    },
    
    // Set current directory
    setCurrentDirectory: async (directoryPath) => {
      return await ipcRenderer.invoke('set-current-directory', directoryPath);
    },
    
    // List markdown files
    listMarkdownFiles: async () => {
      return await ipcRenderer.invoke('list-markdown-files');
    },
    
    // Read markdown file
    readFile: async (filePath) => {
      return await ipcRenderer.invoke('read-file', filePath);
    },
    
    // Write to markdown file
    writeFile: async (filePath, content) => {
      return await ipcRenderer.invoke('write-file', filePath, content);
    },
    
    // Create new markdown file
    createFile: async (fileName, content = '') => {
      return await ipcRenderer.invoke('create-file', fileName, content);
    },
    
    // Delete markdown file
    deleteFile: async (filePath) => {
      return await ipcRenderer.invoke('delete-file', filePath);
    }
  }
});
