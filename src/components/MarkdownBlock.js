import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import './MarkdownBlock.css';

const MarkdownBlock = ({ 
  content, 
  onChange, 
  onFocus,
  onBlur,
  onKeyDown,
  isFocused,
  id
}) => {
  const editorRef = useRef(null);
  
  // Focus editor when isFocused changes to true
  useEffect(() => {
    if (isFocused && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isFocused]);

  // Configure marked options for better markdown rendering
  useEffect(() => {
    marked.setOptions({
      breaks: true,        // Convert line breaks to <br>
      gfm: true,           // Use GitHub Flavored Markdown
      headerIds: true,     // Add IDs to headings
      mangle: false,       // Don't escape HTML
      sanitize: false      // Don't sanitize HTML
    });
  }, []);

  // Render markdown content
  const renderMarkdown = (markdownContent) => {
    // Handle empty or undefined content
    if (!markdownContent || markdownContent.trim() === '') {
      return '<p class="empty-paragraph">&nbsp;</p>';
    }
    
    try {
      // Add a simple wrapper to ensure consistent styling
      return `<div class="markdown-content">${marked(markdownContent)}</div>`;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return '<p class="error-message">Error parsing markdown.</p>';
    }
  };

  // Handle content change
  const handleChange = (e) => {
    onChange(id, e.target.value);
  };

  // Handle key events (e.g., Enter to create new block)
  const handleKeyDown = (e) => {
    onKeyDown(id, e);
  };

  // Handle focus event
  const handleFocus = () => {
    onFocus(id);
  };

  // Handle blur event
  const handleBlur = () => {
    onBlur(id);
  };

  // Debug rendering
  console.log(`Rendering block ${id}, content: "${content}", isFocused: ${isFocused}`);

  return (
    <div className={`markdown-block ${isFocused ? 'focused' : ''}`}>
      {/* Block controls (visible on hover) */}
      <div className="block-controls">
        <div className="block-drag-handle" draggable={true}>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {isFocused ? (
        <textarea
          ref={editorRef}
          className="block-editor"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus
          placeholder="Type '/' for commands..."
        />
      ) : (
        <div 
          className="block-viewer"
          onClick={handleFocus}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  );
};

export default MarkdownBlock; 