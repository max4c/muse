import React, { useState, useEffect } from 'react';
import FileNameDialog from './FileNameDialog';

const Sidebar = ({ selectedFile, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load files when component mounts
  useEffect(() => {
    loadFiles();
  }, []);
  
  // Load files from the file system
  const loadFiles = async () => {
    try {
      setIsLoading(true);
      
      // Get current directory
      const directory = await window.api.files.getCurrentDirectory();
      setCurrentDirectory(directory);
      
      // Get files from the current directory
      const markdownFiles = await window.api.files.listMarkdownFiles();
      setFiles(markdownFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open dialog for new file creation
  const openNewFileDialog = () => {
    console.log('Opening new file dialog');
    setIsDialogOpen(true);
  };
  
  // Handle dialog submission
  const handleDialogSubmit = async (fileName) => {
    console.log('Dialog submitted with filename:', fileName);
    
    if (!fileName) {
      console.log('No filename entered, returning');
      return;
    }
    
    try {
      console.log('Calling window.api.files.createFile with:', fileName);
      const filePath = await window.api.files.createFile(fileName);
      console.log('createFile result:', filePath);
      
      if (filePath) {
        console.log('File created successfully, reloading files');
        await loadFiles();
        
        // Find and select the newly created file (more safely)
        try {
          console.log('Finding newly created file');
          const newFiles = await window.api.files.listMarkdownFiles();
          console.log('Files after creation:', newFiles);
          const newFile = newFiles.find(f => f.path === filePath);
          console.log('Found new file?', newFile);
          
          if (newFile) {
            console.log('Selecting new file');
            onFileSelect(newFile);
          } else {
            console.log('New file not found in file list');
          }
        } catch (findError) {
          console.error('Error finding new file:', findError);
        }
      } else {
        console.log('File creation returned null, showing alert');
        alert('Failed to create file. It may already exist.');
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Error creating file: ' + (error.message || 'Unknown error'));
    } finally {
      // Close the dialog whether successful or not
      setIsDialogOpen(false);
    }
  };
  
  // Format date for last modified
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Files</h2>
        <button className="new-file-btn" onClick={openNewFileDialog}>New File</button>
      </div>
      
      <div className="current-directory">
        <p title={currentDirectory}>{currentDirectory}</p>
      </div>
      
      {isLoading ? (
        <p>Loading files...</p>
      ) : (
        <>
          {files.length === 0 ? (
            <p>No markdown files found.</p>
          ) : (
            <ul className="file-list">
              {files.map(file => (
                <li 
                  key={file.path} 
                  className={`file-item ${selectedFile?.path === file.path ? 'active' : ''}`}
                  onClick={() => onFileSelect(file)}
                >
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-date">{formatDate(file.lastModified)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      
      {/* File name dialog */}
      <FileNameDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSubmit={handleDialogSubmit} 
      />
    </div>
  );
};

export default Sidebar; 