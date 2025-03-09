import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock child components to isolate App component testing
jest.mock('../Sidebar', () => {
  return function MockSidebar({ files, selectedFile, onFileSelect }) {
    return <div data-testid="sidebar">Sidebar Component</div>;
  };
});

jest.mock('../MainContent', () => {
  return function MockMainContent({ selectedFile }) {
    return <div data-testid="main-content">Main Content Component</div>;
  };
});

describe('App Component', () => {
  test('renders sidebar and main content components', () => {
    render(<App />);
    
    const sidebarElement = screen.getByTestId('sidebar');
    const mainContentElement = screen.getByTestId('main-content');
    
    expect(sidebarElement).toBeInTheDocument();
    expect(mainContentElement).toBeInTheDocument();
  });
}); 