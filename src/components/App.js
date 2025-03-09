import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="app-container">
      <Sidebar 
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect} 
      />
      <MainContent selectedFile={selectedFile} />
    </div>
  );
};

export default App; 