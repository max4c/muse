import React, { useState, useEffect, useCallback, useRef } from 'react';
import MarkdownBlock from './MarkdownBlock';
import { useTheme } from '../ThemeContext';

const MainContent = ({ selectedFile }) => {
  const [blocks, setBlocks] = useState([{ id: 'block-0', content: '', focused: false }]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const { theme } = useTheme();
  
  // Ref for the save timer
  const saveTimerRef = useRef(null);
  
  // Track if content has changed since last save
  const [contentChanged, setContentChanged] = useState(false);
  
  // Load file content when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      loadFileContent();
      // Reset save status when changing files
      setSaveStatus('saved');
      setContentChanged(false);
    } else {
      // Reset to a single empty block when no file is selected
      setBlocks([{ id: 'block-0', content: '', focused: false }]);
      setFocusedBlockId(null);
    }
    
    // Clear any pending save timer when changing files
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
  }, [selectedFile]);
  
  // Auto-save effect that triggers when blocks change
  useEffect(() => {
    // Don't save if we're loading content or no file is selected
    if (isLoading || !selectedFile || !contentChanged) return;
    
    // Clear any existing save timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Set a new save timer (debounce for 1000ms)
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      saveFileContent();
      saveTimerRef.current = null;
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [blocks, contentChanged]);
  
  // Load file content from the file system
  const loadFileContent = async () => {
    if (!selectedFile || !selectedFile.path) return;
    
    try {
      setIsLoading(true);
      const fileContent = await window.api.files.readFile(selectedFile.path);
      
      if (fileContent !== null) {
        // Split content into blocks by double newline
        const contentBlocks = fileContent
          .split(/\n\n+/) // Split by at least one empty line
          .map((blockContent, index) => ({
            id: `block-${index}`,
            content: blockContent,
            focused: false
          }));
        
        // If we have content, set the blocks
        if (contentBlocks.length > 0) {
          setBlocks(contentBlocks);
        } else {
          // If no content, create a single empty block
          setBlocks([{ id: 'block-0', content: '', focused: false }]);
        }
      } else {
        // Error case - create a single block with error message
        setBlocks([{ 
          id: 'block-0', 
          content: 'Error: Could not read file.', 
          focused: false 
        }]);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setBlocks([{ 
        id: 'block-0', 
        content: 'Error: Could not read file.', 
        focused: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save file content to the file system
  const saveFileContent = async () => {
    if (!selectedFile || !selectedFile.path) return;
    
    try {
      setSaveStatus('saving');
      console.log('Auto-saving file:', selectedFile.path);
      
      // Combine all blocks into a single string with double newlines between blocks
      const combinedContent = blocks
        .map(block => block.content)
        .filter(content => content.trim() !== '') // Remove empty blocks when saving
        .join('\n\n');
      
      const success = await window.api.files.writeFile(selectedFile.path, combinedContent);
      
      if (success) {
        console.log('File saved successfully');
        setSaveStatus('saved');
        setContentChanged(false);
      } else {
        console.error('Failed to save file');
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus('error');
    }
  };
  
  // Handle block content change
  const handleBlockChange = (blockId, newContent) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === blockId ? { ...block, content: newContent } : block
    ));
    setContentChanged(true);
  };
  
  // Handle block focus
  const handleBlockFocus = (blockId) => {
    setFocusedBlockId(blockId);
    
    // Update blocks to reflect focus state
    setBlocks(prevBlocks => prevBlocks.map(block => ({
      ...block,
      focused: block.id === blockId
    })));
  };
  
  // Handle block blur
  const handleBlockBlur = useCallback(() => {
    // We don't immediately clear focused block ID here
    setTimeout(() => {
      // Only clear focus if we're not focusing another block
      const activeElement = document.activeElement;
      const isTextareaFocused = activeElement && activeElement.tagName === 'TEXTAREA';
      
      if (!isTextareaFocused) {
        setFocusedBlockId(null);
        
        // Clean up empty blocks ONLY when we're blurring all blocks
        setBlocks(prevBlocks => {
          const nonEmptyBlocks = prevBlocks.filter(block => block.content.trim() !== '');
          
          // Always ensure there's at least one block
          if (nonEmptyBlocks.length === 0) {
            return [{ id: 'block-0', content: '', focused: false }];
          }
          
          return nonEmptyBlocks.map(block => ({
            ...block, 
            focused: false
          }));
        });
      }
    }, 100);
  }, []);
  
  // Handle key presses in blocks (for creating new blocks)
  const handleBlockKeyDown = (blockId, event) => {
    // If Enter is pressed, create a new block
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      const currentBlockIndex = blocks.findIndex(block => block.id === blockId);
      if (currentBlockIndex === -1) return;
      
      const currentBlock = blocks[currentBlockIndex];
      
      // Get cursor position in the textarea
      const cursorPosition = event.target.selectionStart;
      
      // Split the content at cursor position
      const contentBeforeCursor = currentBlock.content.substring(0, cursorPosition);
      const contentAfterCursor = currentBlock.content.substring(cursorPosition);
      
      // Create a new block with the content after cursor
      const newBlockId = `block-${Date.now()}`;
      
      // Update the current block and insert the new one
      setBlocks(prevBlocks => {
        const updatedBlocks = [...prevBlocks];
        updatedBlocks[currentBlockIndex] = {
          ...currentBlock,
          content: contentBeforeCursor,
          focused: false
        };
        
        updatedBlocks.splice(currentBlockIndex + 1, 0, {
          id: newBlockId,
          content: contentAfterCursor,
          focused: true
        });
        
        return updatedBlocks;
      });
      
      setFocusedBlockId(newBlockId);
      setContentChanged(true);
    }
    
    // Handle backspace on empty block
    if (event.key === 'Backspace' && blocks[blocks.findIndex(block => block.id === blockId)]?.content === '') {
      event.preventDefault();
      
      // If this is the only block, don't delete it
      if (blocks.length <= 1) return;
      
      const currentBlockIndex = blocks.findIndex(block => block.id === blockId);
      if (currentBlockIndex <= 0) return; // Don't delete the first block with backspace
      
      // Focus the previous block
      const previousBlockId = blocks[currentBlockIndex - 1].id;
      const previousBlockContent = blocks[currentBlockIndex - 1].content;
      
      // Remove the current block and focus the previous one
      setBlocks(prevBlocks => 
        prevBlocks.filter(block => block.id !== blockId)
          .map(block => ({
            ...block,
            focused: block.id === previousBlockId
          }))
      );
      
      setFocusedBlockId(previousBlockId);
      setContentChanged(true);
      
      // Force focus to previous block (requires a slight delay)
      setTimeout(() => {
        const prevBlockElement = document.getElementById(previousBlockId);
        if (prevBlockElement) {
          const textareaElement = prevBlockElement.querySelector('textarea');
          if (textareaElement) {
            textareaElement.focus();
            // Set cursor to end of text
            const textLength = previousBlockContent.length;
            textareaElement.setSelectionRange(textLength, textLength);
          }
        }
      }, 0);
    }
  };
  
  // Get placeholder content when no file is selected
  const getPlaceholderContent = () => {
    return (
      <div className="text-center mt-24" style={{ color: 'var(--color-gray-500)' }}>
        <p className="text-lg mb-2">Select a file from the sidebar to edit</p>
        <p className="text-sm">or create a new file</p>
      </div>
    );
  };
  
  // Get save status text/color
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved':
        return <span style={{ color: 'var(--color-success)' }}>Saved</span>;
      case 'saving':
        return <span style={{ color: 'var(--color-info)' }}>Saving...</span>;
      case 'error':
        return <span style={{ color: 'var(--color-error)' }}>Error saving</span>;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="flex-1 h-full overflow-y-auto p-5 flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {selectedFile ? (
        <>
          <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-gray-200)' }}>
            <h2 className="text-xl font-medium truncate">
              {selectedFile.name}
            </h2>
            <div className="text-sm">{getSaveStatusText()}</div>
          </div>
          
          {isLoading ? (
            <p style={{ color: 'var(--color-gray-500)' }}>Loading content...</p>
          ) : (
            <div className="flex-1 max-w-3xl mx-auto w-full">
              <div className="prose-like-container">
                {blocks.map((block) => (
                  <MarkdownBlock
                    key={block.id}
                    id={block.id}
                    content={block.content}
                    focused={block.focused}
                    onChange={handleBlockChange}
                    onFocus={handleBlockFocus}
                    onBlur={handleBlockBlur}
                    onKeyDown={handleBlockKeyDown}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        getPlaceholderContent()
      )}
    </div>
  );
};

export default MainContent; 