import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainContent from '../MainContent';

// Mock the marked library
jest.mock('marked', () => ({
  marked: jest.fn().mockImplementation(text => `<p>${text}</p>`)
}));

// Mock the window.api.files functions
window.api = {
  files: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
};

describe('MainContent Component', () => {
  const mockFile = { id: 1, name: 'Test File.md', path: '/Test File.md' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn(); // Mock alert function
  });
  
  test('displays placeholder when no file is selected', () => {
    render(<MainContent selectedFile={null} />);
    
    // Check if placeholder text is displayed
    expect(screen.getByText('Select a file from the sidebar to view its contents.')).toBeInTheDocument();
  });
  
  test('displays file content when a file is selected', async () => {
    // Mock readFile to return some content
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    render(<MainContent selectedFile={mockFile} />);
    
    // Wait for the file content to be loaded
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Check if file name is displayed in the toolbar
    expect(screen.getByText(mockFile.name)).toBeInTheDocument();
  });
  
  test('toggles edit mode when Edit button is clicked', async () => {
    // Mock readFile to return some content
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    render(<MainContent selectedFile={mockFile} />);
    
    // Wait for the file content to be loaded
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Check if the textarea is now displayed
    expect(screen.getByPlaceholderText('Type markdown content here...')).toBeInTheDocument();
    
    // Check if the Save and Cancel buttons are now displayed
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('saves content when Save button is clicked', async () => {
    // Mock readFile to return some content
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    // Mock writeFile to succeed
    window.api.files.writeFile.mockResolvedValueOnce(true);
    
    render(<MainContent selectedFile={mockFile} />);
    
    // Wait for the file content to be loaded
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Edit the content
    const textarea = screen.getByPlaceholderText('Type markdown content here...');
    fireEvent.change(textarea, { target: { value: '# Updated Content' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if writeFile was called with the correct parameters
    await waitFor(() => {
      expect(window.api.files.writeFile).toHaveBeenCalledWith(mockFile.path, '# Updated Content');
    });
    
    // Check if the success message was shown
    expect(window.alert).toHaveBeenCalledWith('File saved successfully!');
    
    // Check if we've returned to view mode
    expect(screen.queryByPlaceholderText('Type markdown content here...')).not.toBeInTheDocument();
  });
  
  test('handles save errors properly', async () => {
    // Mock readFile to return some content
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    // Mock writeFile to fail
    window.api.files.writeFile.mockResolvedValueOnce(false);
    
    render(<MainContent selectedFile={mockFile} />);
    
    // Wait for the file content to be loaded
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Edit the content
    const textarea = screen.getByPlaceholderText('Type markdown content here...');
    fireEvent.change(textarea, { target: { value: '# Updated Content' } });
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if writeFile was called with the correct parameters
    await waitFor(() => {
      expect(window.api.files.writeFile).toHaveBeenCalledWith(mockFile.path, '# Updated Content');
    });
    
    // Check if the error message was shown
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Failed to save file/));
    
    // We should still be in edit mode
    expect(screen.getByPlaceholderText('Type markdown content here...')).toBeInTheDocument();
  });
  
  test('cancels editing when Cancel button is clicked', async () => {
    // Mock readFile to return some content
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    render(<MainContent selectedFile={mockFile} />);
    
    // Wait for the file content to be loaded
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Edit the content
    const textarea = screen.getByPlaceholderText('Type markdown content here...');
    fireEvent.change(textarea, { target: { value: '# Updated Content' } });
    
    // Reset the readFile mock to return the original content again
    window.api.files.readFile.mockReset();
    window.api.files.readFile.mockResolvedValueOnce('# Test Content');
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if readFile was called again to reload the content
    await waitFor(() => {
      expect(window.api.files.readFile).toHaveBeenCalledWith(mockFile.path);
    });
    
    // Check if we've returned to view mode
    expect(screen.queryByPlaceholderText('Type markdown content here...')).not.toBeInTheDocument();
  });
}); 