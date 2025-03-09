import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Sidebar from '../Sidebar';

// Mock the FileNameDialog to simplify testing
jest.mock('../FileNameDialog', () => {
  return function MockFileNameDialog({ isOpen, onSubmit, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="file-name-dialog">
        <input 
          data-testid="filename-input" 
          onChange={(e) => e.target.value}
        />
        <button 
          data-testid="submit-dialog" 
          onClick={() => onSubmit('New Test File')}
        >
          Create
        </button>
        <button 
          data-testid="cancel-dialog" 
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    );
  };
});

// Mock window.api.files functions
window.api = {
  files: {
    getCurrentDirectory: jest.fn(),
    listMarkdownFiles: jest.fn(),
    createFile: jest.fn()
  }
};

describe('Sidebar Component', () => {
  const mockFiles = [
    { name: 'Test File 1.md', path: '/Test File 1.md', lastModified: new Date('2023-01-01') },
    { name: 'Test File 2.md', path: '/Test File 2.md', lastModified: new Date('2023-01-02') },
  ];
  
  const mockOnFileSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    window.api.files.getCurrentDirectory.mockResolvedValue('/mock/directory');
    window.api.files.listMarkdownFiles.mockResolvedValue(mockFiles);
    window.alert = jest.fn();
  });
  
  test('renders loading state initially', () => {
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Check if loading state is shown
    expect(screen.getByText('Loading files...')).toBeInTheDocument();
  });
  
  test('renders file list after loading', async () => {
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for the files to be loaded
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalled();
    });
    
    // Check if all file names are rendered
    mockFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
    
    // Check if the current directory is displayed
    expect(screen.getByText('/mock/directory')).toBeInTheDocument();
  });
  
  test('highlights selected file', async () => {
    const selectedFile = mockFiles[0];
    
    render(
      <Sidebar 
        selectedFile={selectedFile} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for the files to be loaded
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalled();
    });
    
    // Get the selected file element
    const selectedFileElement = screen.getByText(selectedFile.name);
    
    // Check if the selected file has the 'active' class
    expect(selectedFileElement.closest('.file-item')).toHaveClass('active');
  });
  
  test('calls onFileSelect when file is clicked', async () => {
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for the files to be loaded
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalled();
    });
    
    // Click on the first file
    fireEvent.click(screen.getByText(mockFiles[0].name));
    
    // Check if onFileSelect was called with the correct file
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFiles[0]);
  });
  
  test('creates a new file when dialog is submitted', async () => {
    // Mock createFile to succeed
    window.api.files.createFile.mockResolvedValueOnce('/mock/directory/New Test File.md');
    
    // Mock listMarkdownFiles to return the updated list
    const updatedFiles = [
      ...mockFiles,
      { name: 'New Test File.md', path: '/mock/directory/New Test File.md', lastModified: new Date() }
    ];
    
    // Clear previous calls and set up new mock responses
    window.api.files.listMarkdownFiles.mockReset();
    
    // Set up mock implementation to handle multiple calls
    window.api.files.listMarkdownFiles
      .mockResolvedValueOnce(mockFiles)       // First call: Initial load
      .mockResolvedValueOnce(updatedFiles)    // Second call: After file creation in loadFiles
      .mockResolvedValueOnce(updatedFiles);   // Third call: When finding the new file
    
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading files...')).not.toBeInTheDocument();
    });
    
    // Verify the first call has been made
    expect(window.api.files.listMarkdownFiles).toHaveBeenCalledTimes(1);
    
    // Click the New File button
    fireEvent.click(screen.getByText('New File'));
    
    // Dialog should be visible
    expect(screen.getByTestId('file-name-dialog')).toBeInTheDocument();
    
    // Submit the dialog
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-dialog'));
    });
    
    // Check if createFile was called with the correct name
    expect(window.api.files.createFile).toHaveBeenCalledWith('New Test File');
    
    // Verify all three calls to listMarkdownFiles were made
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalledTimes(3);
    });
    
    // Verify the new file appears in the UI
    expect(screen.getByText('New Test File.md')).toBeInTheDocument();
  });
  
  test('handles file creation failure', async () => {
    // Mock createFile to fail by returning null
    window.api.files.createFile.mockResolvedValueOnce(null);
    
    // Reset the mock and set up responses
    window.api.files.listMarkdownFiles.mockReset();
    window.api.files.listMarkdownFiles.mockResolvedValue(mockFiles);
    
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading files...')).not.toBeInTheDocument();
    });
    
    // Click the New File button
    fireEvent.click(screen.getByText('New File'));
    
    // Dialog should be visible
    expect(screen.getByTestId('file-name-dialog')).toBeInTheDocument();
    
    // Submit the dialog and wait for the async operations
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-dialog'));
      // Wait for the createFile promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if createFile was called with the correct name
    expect(window.api.files.createFile).toHaveBeenCalledWith('New Test File');
    
    // Check if the error message was shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create file. It may already exist.');
    });
    
    // Check that dialog is closed after failure
    expect(screen.queryByTestId('file-name-dialog')).not.toBeInTheDocument();
  });
  
  test('closes dialog when cancel button is clicked', async () => {
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for the files to be loaded
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalled();
    });
    
    // Click the New File button
    fireEvent.click(screen.getByText('New File'));
    
    // Dialog should be visible
    expect(screen.getByTestId('file-name-dialog')).toBeInTheDocument();
    
    // Click the cancel button
    fireEvent.click(screen.getByTestId('cancel-dialog'));
    
    // Dialog should be closed
    expect(screen.queryByTestId('file-name-dialog')).not.toBeInTheDocument();
    
    // Check that createFile was not called
    expect(window.api.files.createFile).not.toHaveBeenCalled();
  });
  
  test('displays empty state when no files are found', async () => {
    // Mock listMarkdownFiles to return empty array
    window.api.files.listMarkdownFiles.mockResolvedValueOnce([]);
    
    render(
      <Sidebar 
        selectedFile={null} 
        onFileSelect={mockOnFileSelect} 
      />
    );
    
    // Wait for the files to be loaded
    await waitFor(() => {
      expect(window.api.files.listMarkdownFiles).toHaveBeenCalled();
    });
    
    // Check if empty state message is shown
    expect(screen.getByText('No markdown files found.')).toBeInTheDocument();
  });
}); 