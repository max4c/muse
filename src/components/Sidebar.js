import React, { useState, useEffect } from 'react';
import FileNameDialog from './FileNameDialog';
import Settings from './Settings';
import { useTheme } from '../ThemeContext';

const Sidebar = ({ selectedFile, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme } = useTheme();
  
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

  // Toggle settings panel
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div 
      className="w-64 h-full overflow-y-auto p-3 flex flex-col" 
      style={{ 
        backgroundColor: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-sidebar-border)'
      }}
    >
      {isSettingsOpen ? (
        <Settings onClose={() => setIsSettingsOpen(false)} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Files</h2>
            <button 
              className="py-1 px-3 text-white text-sm rounded transition-colors"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                ':hover': { backgroundColor: 'var(--color-primary-hover)' }
              }}
              onClick={openNewFileDialog}
            >
              New File
            </button>
          </div>
          
          <div className="text-xs mb-3 p-2 rounded break-all" style={{ 
            backgroundColor: 'var(--color-gray-100)', 
            color: 'var(--color-gray-600)'
          }}>
            <p title={currentDirectory}>{currentDirectory}</p>
          </div>
          
          {isLoading ? (
            <p style={{ color: 'var(--color-gray-500)' }}>Loading files...</p>
          ) : (
            <>
              {files.length === 0 ? (
                <p style={{ color: 'var(--color-gray-500)' }}>No markdown files found.</p>
              ) : (
                <ul className="list-none overflow-y-auto flex-1">
                  {files.map(file => (
                    <li 
                      key={file.path} 
                      className="p-2 mb-0.5 cursor-pointer rounded flex flex-col" 
                      style={{
                        backgroundColor: selectedFile?.path === file.path 
                          ? 'var(--color-sidebar-item-active)' 
                          : 'transparent',
                        ':hover': { backgroundColor: 'var(--color-sidebar-item-hover)' }
                      }}
                      onClick={() => onFileSelect(file)}
                    >
                      <div className={`break-all ${selectedFile?.path === file.path ? 'font-medium' : 'font-normal'}`}>
                        {file.name}
                      </div>
                      <div className="text-xs italic" style={{ color: 'var(--color-gray-500)' }}>
                        {formatDate(file.lastModified)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          
          {/* Add settings button at the bottom */}
          <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
            <button 
              className="w-full py-2 text-sm rounded transition-colors"
              style={{ 
                color: 'var(--color-gray-700)',
                ':hover': { backgroundColor: 'var(--color-sidebar-item-hover)' }
              }}
              onClick={toggleSettings}
            >
              Settings
            </button>
          </div>
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