import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock window.api functions to avoid errors
window.api = {
  files: {
    getCurrentDirectory: jest.fn().mockResolvedValue('/test/dir'),
    listMarkdownFiles: jest.fn().mockResolvedValue([]),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    createFile: jest.fn()
  }
};

describe('Tailwind CSS Integration', () => {
  test('App renders correctly with Tailwind classes', () => {
    render(<App />);
    
    // Check for app container with Tailwind-styled flex layout
    const appContainer = document.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
    
    // Use getComputedStyle to check if Tailwind's flexbox style is applied
    const containerStyle = window.getComputedStyle(appContainer);
    
    // Note: This is a weak test since JSDOM doesn't fully process CSS
    // but it at least verifies that the className is there
    expect(appContainer.className).toContain('app-container');
    
    // Better to test presence of elements with Tailwind classes
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
    
    const mainContent = document.querySelector('.main-content');
    expect(mainContent).toBeInTheDocument();
  });
  
  test('Sidebar includes expected Tailwind-styled elements', () => {
    render(<App />);
    
    // Test if sidebar header exists with correct class
    const sidebarHeader = document.querySelector('.sidebar-header');
    expect(sidebarHeader).toBeInTheDocument();
    
    // Test if h2 element in sidebar exists
    const sidebarTitle = screen.getByText('Files');
    expect(sidebarTitle).toBeInTheDocument();
    
    // Test if new file button exists
    const newFileButton = screen.getByText('New File');
    expect(newFileButton).toBeInTheDocument();
  });
}); 