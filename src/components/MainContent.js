import React from 'react';

const MainContent = ({ selectedFile }) => {
  // In a real implementation, we would load the file contents from the file system
  // For now, we'll just show a placeholder
  
  const getPlaceholderContent = () => {
    if (!selectedFile) {
      return 'Select a file from the sidebar to view its contents.';
    }
    return `This is the content of ${selectedFile.name}. \n\nIn a real implementation, this would be loaded from the file system.`;
  };

  return (
    <div className="main-content">
      {selectedFile ? (
        <>
          <div className="toolbar">
            <h2>{selectedFile.name}</h2>
          </div>
          <div className="markdown-viewer">
            {getPlaceholderContent().split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </>
      ) : (
        <div className="markdown-viewer">
          <p>{getPlaceholderContent()}</p>
        </div>
      )}
    </div>
  );
};

export default MainContent; 