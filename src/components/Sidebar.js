import React from 'react';

const Sidebar = ({ files, selectedFile, onFileSelect }) => {
  return (
    <div className="sidebar">
      <h2>Files</h2>
      <ul className="file-list">
        {files.map(file => (
          <li 
            key={file.id} 
            className={`file-item ${selectedFile?.id === file.id ? 'active' : ''}`}
            onClick={() => onFileSelect(file)}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar; 