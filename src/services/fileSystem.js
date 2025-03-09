const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * File System Service - provides functions for file operations
 */
class FileSystemService {
  constructor() {
    // Default directory is the Documents folder
    this.defaultDirectory = path.join(app.getPath('documents'), 'Muse');
    
    // Create default directory if it doesn't exist
    if (!fs.existsSync(this.defaultDirectory)) {
      fs.mkdirSync(this.defaultDirectory, { recursive: true });
    }
    
    // Current working directory
    this.currentDirectory = this.defaultDirectory;
  }

  /**
   * Set the current working directory
   * @param {string} directoryPath - Path to set as current directory
   * @returns {boolean} - Success or failure
   */
  setCurrentDirectory(directoryPath) {
    try {
      if (fs.existsSync(directoryPath)) {
        const stats = fs.statSync(directoryPath);
        if (stats.isDirectory()) {
          this.currentDirectory = directoryPath;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error setting directory:', error);
      return false;
    }
  }

  /**
   * Get the current working directory
   * @returns {string} - Current directory path
   */
  getCurrentDirectory() {
    return this.currentDirectory;
  }

  /**
   * List all markdown files in the current directory
   * @returns {Array} - Array of file objects with name, path, and stats
   */
  listMarkdownFiles() {
    try {
      const files = fs.readdirSync(this.currentDirectory);
      
      // Filter only markdown files and get details
      return files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const filePath = path.join(this.currentDirectory, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            lastModified: stats.mtime
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error listing markdown files:', error);
      return [];
    }
  }

  /**
   * Read a markdown file
   * @param {string} filePath - Path to the file
   * @returns {string|null} - File content or null if error
   */
  readMarkdownFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  /**
   * Write content to a markdown file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   * @returns {boolean} - Success or failure
   */
  writeMarkdownFile(filePath, content) {
    try {
      // First check if file is writable
      try {
        fs.accessSync(filePath, fs.constants.W_OK);
      } catch (accessError) {
        console.error('Permission denied when writing to file:', accessError);
        
        // If the file exists but we can't write to it, try to change permissions
        if (fs.existsSync(filePath)) {
          try {
            // Make file writable - 0o666 is read/write for all users
            fs.chmodSync(filePath, 0o666);
            console.log('Changed file permissions to writable');
          } catch (chmodError) {
            console.error('Failed to change file permissions:', chmodError);
            return false;
          }
        } else {
          return false;
        }
      }
      
      // Now try to write the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully wrote to file:', filePath);
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }

  /**
   * Create a new markdown file
   * @param {string} fileName - Name of the file (without path)
   * @param {string} content - Initial content
   * @returns {string|null} - Path to the created file or null if error
   */
  createMarkdownFile(fileName, content = '') {
    try {
      // Ensure filename has .md extension
      const fileNameWithExt = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
      const filePath = path.join(this.currentDirectory, fileNameWithExt);
      
      // Don't overwrite existing files
      if (fs.existsSync(filePath)) {
        console.log('File already exists:', filePath);
        return null;
      }
      
      // Create the file with write permissions for all users
      fs.writeFileSync(filePath, content, {
        encoding: 'utf8',
        mode: 0o666 // Read/write for all users
      });
      
      console.log('Successfully created file:', filePath);
      return filePath;
    } catch (error) {
      console.error('Error creating file:', error);
      return null;
    }
  }

  /**
   * Delete a markdown file
   * @param {string} filePath - Path to the file
   * @returns {boolean} - Success or failure
   */
  deleteMarkdownFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

module.exports = new FileSystemService(); 