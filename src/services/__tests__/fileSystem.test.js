// Mock the fs, path, and electron modules
const fs = require('fs');
const path = require('path');
const electron = require('electron');

jest.mock('fs');
jest.mock('path');
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/documents')
  }
}));

// Import the file system service
const fileSystem = require('../fileSystem');

describe('FileSystemService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    path.join.mockImplementation((...args) => args.join('/'));
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({
      isDirectory: jest.fn().mockReturnValue(true),
      size: 1024,
      mtime: new Date()
    });
  });
  
  describe('getCurrentDirectory', () => {
    it('should return the current directory', () => {
      // Mock the default directory
      fileSystem.currentDirectory = '/mock/documents/Muse';
      
      // Call the method
      const result = fileSystem.getCurrentDirectory();
      
      // Assert the result
      expect(result).toBe('/mock/documents/Muse');
    });
  });
  
  describe('setCurrentDirectory', () => {
    it('should set the current directory if valid', () => {
      // Call the method
      const result = fileSystem.setCurrentDirectory('/valid/directory');
      
      // Assert the result
      expect(result).toBe(true);
      expect(fileSystem.currentDirectory).toBe('/valid/directory');
    });
    
    it('should not set the current directory if it does not exist', () => {
      // Mock existsSync to return false
      fs.existsSync.mockReturnValueOnce(false);
      
      // Set initial directory
      fileSystem.currentDirectory = '/initial/directory';
      
      // Call the method
      const result = fileSystem.setCurrentDirectory('/invalid/directory');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fileSystem.currentDirectory).toBe('/initial/directory');
    });
    
    it('should not set the current directory if it is not a directory', () => {
      // Mock statSync to simulate a file
      fs.statSync.mockReturnValueOnce({
        isDirectory: jest.fn().mockReturnValue(false)
      });
      
      // Set initial directory
      fileSystem.currentDirectory = '/initial/directory';
      
      // Call the method
      const result = fileSystem.setCurrentDirectory('/not/a/directory');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fileSystem.currentDirectory).toBe('/initial/directory');
    });
    
    it('should handle errors', () => {
      // Mock existsSync to throw an error
      fs.existsSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Set initial directory
      fileSystem.currentDirectory = '/initial/directory';
      
      // Call the method
      const result = fileSystem.setCurrentDirectory('/error/directory');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fileSystem.currentDirectory).toBe('/initial/directory');
    });
  });
  
  describe('listMarkdownFiles', () => {
    it('should return a list of markdown files', () => {
      // Mock readdirSync to return some files
      fs.readdirSync.mockReturnValueOnce(['file1.md', 'file2.md', 'file3.txt']);
      
      // Call the method
      const result = fileSystem.listMarkdownFiles();
      
      // Assert the result
      expect(result).toHaveLength(2); // Only 2 .md files
      expect(result[0].name).toBe('file1.md');
      expect(result[1].name).toBe('file2.md');
    });
    
    it('should handle errors', () => {
      // Mock readdirSync to throw an error
      fs.readdirSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Call the method
      const result = fileSystem.listMarkdownFiles();
      
      // Assert the result
      expect(result).toEqual([]);
    });
  });
  
  describe('readMarkdownFile', () => {
    it('should read a markdown file', () => {
      // Mock readFileSync to return some content
      fs.readFileSync.mockReturnValueOnce('# Markdown Content');
      
      // Call the method
      const result = fileSystem.readMarkdownFile('/path/to/file.md');
      
      // Assert the result
      expect(result).toBe('# Markdown Content');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/file.md', 'utf8');
    });
    
    it('should handle errors', () => {
      // Mock readFileSync to throw an error
      fs.readFileSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Call the method
      const result = fileSystem.readMarkdownFile('/path/to/file.md');
      
      // Assert the result
      expect(result).toBeNull();
    });
  });
  
  describe('writeMarkdownFile', () => {
    beforeEach(() => {
      // Mock accessSync to succeed (file is writable)
      fs.accessSync = jest.fn();
    });
    
    it('should write content to a markdown file', () => {
      // Call the method
      const result = fileSystem.writeMarkdownFile('/path/to/file.md', '# New Content');
      
      // Assert the result
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/file.md', '# New Content', 'utf8');
    });
    
    it('should handle permission issues and try to change permissions', () => {
      // Mock accessSync to fail with permission error
      fs.accessSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      // Mock fs.existsSync to return true (file exists)
      fs.existsSync.mockReturnValueOnce(true);
      
      // Mock chmod to succeed
      fs.chmodSync = jest.fn();
      
      // Call the method
      const result = fileSystem.writeMarkdownFile('/path/to/file.md', '# New Content');
      
      // Assert the result
      expect(result).toBe(true);
      expect(fs.chmodSync).toHaveBeenCalledWith('/path/to/file.md', 0o666);
      expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/file.md', '# New Content', 'utf8');
    });
    
    it('should handle chmod errors', () => {
      // Mock accessSync to fail with permission error
      fs.accessSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      // Mock fs.existsSync to return true (file exists)
      fs.existsSync.mockReturnValueOnce(true);
      
      // Mock chmod to fail
      fs.chmodSync = jest.fn().mockImplementationOnce(() => {
        throw new Error('Failed to change permissions');
      });
      
      // Call the method
      const result = fileSystem.writeMarkdownFile('/path/to/file.md', '# New Content');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fs.chmodSync).toHaveBeenCalledWith('/path/to/file.md', 0o666);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should handle permission errors for non-existent files', () => {
      // Mock accessSync to fail with permission error
      fs.accessSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      // Mock fs.existsSync to return false (file doesn't exist)
      fs.existsSync.mockReturnValueOnce(false);
      
      // Call the method
      const result = fileSystem.writeMarkdownFile('/path/to/file.md', '# New Content');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should handle general errors', () => {
      // Mock writeFileSync to throw an error
      fs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Call the method
      const result = fileSystem.writeMarkdownFile('/path/to/file.md', '# New Content');
      
      // Assert the result
      expect(result).toBe(false);
    });
  });
  
  describe('createMarkdownFile', () => {
    beforeEach(() => {
      // Set the current directory to be consistent with the tests
      fileSystem.currentDirectory = '/mock/documents/Muse';
    });
    
    it('should create a new markdown file with proper permissions', () => {
      // Mock existsSync for a file that doesn't exist
      fs.existsSync.mockReturnValueOnce(false);
      
      // Call the method
      const result = fileSystem.createMarkdownFile('newfile', '# New File');
      
      // Assert the result
      expect(result).toBe('/mock/documents/Muse/newfile.md');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock/documents/Muse/newfile.md', 
        '# New File', 
        expect.objectContaining({
          encoding: 'utf8',
          mode: 0o666
        })
      );
    });
    
    it('should add .md extension if not provided', () => {
      // Mock existsSync for a file that doesn't exist
      fs.existsSync.mockReturnValueOnce(false);
      
      // Call the method
      const result = fileSystem.createMarkdownFile('newfile.md', '# New File');
      
      // Assert the result
      expect(result).toBe('/mock/documents/Muse/newfile.md');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock/documents/Muse/newfile.md', 
        '# New File', 
        expect.objectContaining({
          encoding: 'utf8',
          mode: 0o666
        })
      );
    });
    
    it('should not overwrite existing files', () => {
      // Mock existsSync for a file that already exists
      fs.existsSync.mockReturnValueOnce(true);
      
      // Call the method
      const result = fileSystem.createMarkdownFile('existingfile.md', '# New Content');
      
      // Assert the result
      expect(result).toBeNull();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should handle errors', () => {
      // Mock writeFileSync to throw an error
      fs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Mock existsSync for a file that doesn't exist
      fs.existsSync.mockReturnValueOnce(false);
      
      // Call the method
      const result = fileSystem.createMarkdownFile('errorfile.md', '# Error Content');
      
      // Assert the result
      expect(result).toBeNull();
    });
  });
  
  describe('deleteMarkdownFile', () => {
    it('should delete a markdown file', () => {
      // Call the method
      const result = fileSystem.deleteMarkdownFile('/path/to/file.md');
      
      // Assert the result
      expect(result).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/file.md');
    });
    
    it('should return false if file does not exist', () => {
      // Mock existsSync for a file that doesn't exist
      fs.existsSync.mockReturnValueOnce(false);
      
      // Call the method
      const result = fileSystem.deleteMarkdownFile('/path/to/nonexistent.md');
      
      // Assert the result
      expect(result).toBe(false);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
    
    it('should handle errors', () => {
      // Mock unlinkSync to throw an error
      fs.unlinkSync.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      // Call the method
      const result = fileSystem.deleteMarkdownFile('/path/to/file.md');
      
      // Assert the result
      expect(result).toBe(false);
    });
  });
}); 