import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ThemeProvider from '../ThemeContext';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <ThemeProvider>
      <div className="flex w-full h-full">
        <Sidebar 
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect} 
        />
        <MainContent selectedFile={selectedFile} />
      </div>
    </ThemeProvider>
  );
};

export default App; 