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
  invoke: async (channel, data) => {
    // Whitelist channels
    const validChannels = [
      'get-files', 
      'read-file', 
      'write-file',
      'db-create',
      'db-read',
      'db-update',
      'db-delete'
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
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
  }
});
