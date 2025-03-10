import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainContent from '../MainContent';

// Mock the API functions
window.api = {
  files: {
    readFile: jest.fn().mockResolvedValue(''),
    writeFile: jest.fn().mockResolvedValue(true),
  }
};

describe('Block Conversion', () => {
  // Test that directly calls handleBlockConvert
  test('handleBlockConvert correctly converts block types', () => {
    // Create an instance of MainContent
    const { container } = render(<MainContent selectedFile={{ path: 'test.md', name: 'test.md' }} />);
    
    // Access the component instance
    const instance = container.__reactFiber$.child.stateNode;
    
    // Set up initial blocks
    const initialBlocks = [
      { id: 'block-1', content: 'Test content', focused: true, type: 'text' }
    ];
    
    // Set the blocks directly
    instance.setBlocks(initialBlocks);
    
    // Test each conversion type
    const conversions = [
      { type: 'heading1', expectedType: 'heading1' },
      { type: 'heading2', expectedType: 'heading2' },
      { type: 'heading3', expectedType: 'heading3' },
      { type: 'bulletList', expectedType: 'bulletList' },
      { type: 'numberedList', expectedType: 'numberedList' },
      { type: 'toggle', expectedType: 'toggle' },
      { type: 'quote', expectedType: 'quote' },
      { type: 'code', expectedType: 'code' },
    ];
    
    conversions.forEach(({ type, expectedType }) => {
      // Call handleBlockConvert directly
      instance.handleBlockConvert('block-1', type);
      
      // Get the updated blocks
      const updatedBlocks = instance.state.blocks;
      
      // Check if the block type was changed correctly
      expect(updatedBlocks.find(b => b.id === 'block-1').type).toBe(expectedType);
    });
  });
}); 