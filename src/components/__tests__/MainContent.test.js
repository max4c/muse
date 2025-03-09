import React from 'react';
import { render, screen } from '@testing-library/react';
import MainContent from '../MainContent';

describe('MainContent Component', () => {
  const mockFile = { id: 1, name: 'Test File.md', path: '/Test File.md' };
  
  test('displays placeholder when no file is selected', () => {
    render(<MainContent selectedFile={null} />);
    
    // Check if placeholder text is displayed
    expect(screen.getByText('Select a file from the sidebar to view its contents.')).toBeInTheDocument();
  });
  
  test('displays file content when a file is selected', () => {
    render(<MainContent selectedFile={mockFile} />);
    
    // Check if file name is displayed in the toolbar
    expect(screen.getByText(mockFile.name)).toBeInTheDocument();
    
    // Check if placeholder content for the selected file is displayed
    expect(screen.getByText(`This is the content of ${mockFile.name}.`)).toBeInTheDocument();
    expect(screen.getByText('In a real implementation, this would be loaded from the file system.')).toBeInTheDocument();
  });
}); 