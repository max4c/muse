import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar Component', () => {
  const mockFiles = [
    { id: 1, name: 'Test File 1.md', path: '/Test File 1.md' },
    { id: 2, name: 'Test File 2.md', path: '/Test File 2.md' },
  ];
  
  const mockOnFileSelect = jest.fn();
  
  test('renders file list correctly', () => {
    render(
      <Sidebar 
        files={mockFiles} 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Check if component renders "Files" heading
    expect(screen.getByText('Files')).toBeInTheDocument();
    
    // Check if all file names are rendered
    mockFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
  });
  
  test('highlights selected file', () => {
    const selectedFile = mockFiles[0];
    
    render(
      <Sidebar 
        files={mockFiles} 
        selectedFile={selectedFile} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Get the selected file element
    const selectedFileElement = screen.getByText(selectedFile.name);
    
    // Check if the selected file has the 'active' class
    expect(selectedFileElement.closest('.file-item')).toHaveClass('active');
  });
  
  test('calls onFileSelect when file is clicked', () => {
    render(
      <Sidebar 
        files={mockFiles} 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Click on the first file
    fireEvent.click(screen.getByText(mockFiles[0].name));
    
    // Check if onFileSelect was called with the correct file
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFiles[0]);
  });
}); 