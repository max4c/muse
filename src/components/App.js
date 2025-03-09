import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Demo files for initial testing
  const demoFiles = [
    { id: 1, name: 'Welcome.md', path: '/Welcome.md' },
    { id: 2, name: 'Getting Started.md', path: '/Getting Started.md' },
    { id: 3, name: 'Features.md', path: '/Features.md' },
  ];

  return (
    <div className="app-container">
      <Sidebar 
        files={demoFiles} 
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile} 
      />
      <MainContent selectedFile={selectedFile} />
    </div>
  );
};

export default App; 