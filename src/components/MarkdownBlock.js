import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { useTheme } from '../ThemeContext';

const MarkdownBlock = ({ 
  content, 
  onChange, 
  onFocus,
  onBlur,
  onKeyDown,
  focused,
  id
}) => {
  const editorRef = useRef(null);
  const { theme } = useTheme();
  
  // Focus editor when focused changes to true
  useEffect(() => {
    if (focused && editorRef.current) {
      editorRef.current.focus();
    }
  }, [focused]);

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
      return '<p class="empty-placeholder">&nbsp;</p>';
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

  return (
    <div id={id} className={`group relative ${focused ? 'z-10' : ''}`}>
      {/* Block controls (only visible on hover) */}
      <div 
        className={`absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 ${
          focused ? 'group-hover:opacity-100' : ''
        } transition-opacity flex items-center`}
      >
        <div className="flex space-x-0.5 px-1 cursor-move">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-gray-400)' }}></div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-gray-400)' }}></div>
        </div>
      </div>
      
      {focused ? (
        <textarea
          ref={editorRef}
          className="w-full px-3 py-0.5 focus:outline-none resize-none"
          style={{ 
            minHeight: content ? 'auto' : '1.5rem', 
            height: content ? `${Math.max(content.split('\n').length, 1) * 1.5}rem` : '1.5rem',
            backgroundColor: 'transparent',
            color: 'var(--color-foreground)',
          }}
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
          className={`px-3 py-0.5 cursor-text markdown-viewer ${
            !content || content.trim() === '' ? 'h-6 italic' : ''
          }`}
          style={{
            color: !content || content.trim() === '' ? 'var(--color-gray-400)' : 'var(--color-foreground)'
          }}
          onClick={handleFocus}
          dangerouslySetInnerHTML={{ 
            __html: !content || content.trim() === '' 
              ? 'Click to edit...' 
              : renderMarkdown(content) 
          }}
        />
      )}
    </div>
  );
};

export default MarkdownBlock; 