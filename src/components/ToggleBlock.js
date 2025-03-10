import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';

const ToggleBlock = ({
  id,
  content,
  children,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  isFocused
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const summaryEditorRef = useRef(null);
  const contentEditorRef = useRef(null);
  const [summaryContent, childContent] = splitToggleContent(content);
  const [isEditingContent, setIsEditingContent] = useState(false);
  
  console.log('ToggleBlock render:', { id, isFocused, isEditingContent, summaryContent, childContent });
  
  // Focus editor when isFocused changes to true
  useEffect(() => {
    if (isFocused) {
      console.log('Setting focus on toggle block', { isEditingContent });
      if (isEditingContent && contentEditorRef.current) {
        console.log('Focusing content editor');
        contentEditorRef.current.focus();
      } else if (summaryEditorRef.current) {
        console.log('Focusing summary editor');
        summaryEditorRef.current.focus();
      }
    }
  }, [isFocused, isEditingContent]);

  // Helper function to split toggle content into summary and children
  function splitToggleContent(content) {
    if (!content) return ['', ''];
    
    const lines = content.split('\n');
    if (lines.length <= 1) {
      return [content, ''];
    }
    
    const summary = lines[0];
    const childContent = lines.slice(1).join('\n').trim();
    return [summary, childContent];
  }

  // Helper function to combine summary and child content
  function combineContent(summary, child) {
    if (!child) return summary || '';
    if (!summary) return child;
    return `${summary}\n${child}`;
  }

  // Render markdown content
  const renderMarkdown = (markdownContent) => {
    if (!markdownContent || markdownContent.trim() === '') {
      return '<p class="empty-paragraph">&nbsp;</p>';
    }
    
    try {
      return `<div class="markdown-content">${marked(markdownContent)}</div>`;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return '<p class="error-message">Error parsing markdown.</p>';
    }
  };

  // Handle summary content change
  const handleSummaryChange = (e) => {
    const newSummary = e.target.value;
    console.log('Summary changed:', newSummary);
    const newCombinedContent = combineContent(newSummary, childContent);
    onChange(id, newCombinedContent);
  };

  // Handle child content change
  const handleContentChange = (e) => {
    const newChildContent = e.target.value;
    console.log('Content changed:', newChildContent);
    const newCombinedContent = combineContent(summaryContent, newChildContent);
    onChange(id, newCombinedContent);
  };

  // Handle key events in summary
  const handleSummaryKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      setIsEditingContent(true);
    } else {
      onKeyDown(id, e);
    }
  };

  // Handle key events in content
  const handleContentKeyDown = (e) => {
    // Don't create a new block on Enter; just add a newline in the content
    if (e.key === 'Enter' && !e.shiftKey) {
      e.stopPropagation(); // Prevent the default behavior of creating a new block
    } else if (e.key === 'Escape') {
      setIsEditingContent(false);
      onFocus(id); // Focus back to the summary
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      setIsEditingContent(false);
    } else {
      onKeyDown(id, e);
    }
  };

  // Handle toggling
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Handle focus on content area
  const handleContentClick = (e) => {
    e.stopPropagation();
    console.log('Content area clicked');
    setIsEditingContent(true);
    onFocus(id);
  };

  // Handle blur on content area
  const handleContentBlur = () => {
    setTimeout(() => {
      // Check if focus is still within the component before blurring
      if (document.activeElement !== contentEditorRef.current && 
          document.activeElement !== summaryEditorRef.current) {
        setIsEditingContent(false);
        onBlur(id);
      }
    }, 100);
  };

  return (
    <div className={`toggle-block markdown-block ${isFocused ? 'focused' : ''}`}>
      {/* Block controls */}
      <div className="block-controls">
        <div className="block-drag-handle" draggable={true}>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {/* Toggle header */}
      <div className="toggle-header" onClick={!isEditingContent ? handleToggle : undefined}>
        <div className={`toggle-icon ${isOpen ? 'open' : 'closed'}`} onClick={handleToggle}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={isOpen ? "M4 6l4 4 4-4" : "M6 4l4 4 -4 4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {isFocused && !isEditingContent ? (
          <textarea
            ref={summaryEditorRef}
            className="block-editor toggle-summary-editor"
            value={summaryContent}
            onChange={handleSummaryChange}
            onKeyDown={handleSummaryKeyDown}
            onFocus={() => setIsEditingContent(false)}
            onBlur={handleContentBlur}
            autoFocus
            placeholder=""
            data-testid="toggle-summary-editor"
          />
        ) : (
          <div 
            className="toggle-summary"
            onClick={(e) => {
              e.stopPropagation();
              onFocus(id);
              setIsEditingContent(false);
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(summaryContent) }}
          />
        )}
      </div>
      
      {/* Collapsible content */}
      {isOpen && (
        <div className="toggle-content" onClick={!isFocused || !isEditingContent ? handleContentClick : undefined}>
          {isFocused && isEditingContent ? (
            <textarea
              ref={contentEditorRef}
              className="block-editor toggle-content-editor"
              value={childContent}
              onChange={handleContentChange}
              onKeyDown={handleContentKeyDown}
              onFocus={() => setIsEditingContent(true)}
              onBlur={handleContentBlur}
              autoFocus
              placeholder=""
              data-testid="toggle-content-editor"
            />
          ) : (
            childContent ? (
              <div 
                className="toggle-content-view"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(childContent) }}
              />
            ) : (
              <div className="toggle-content-empty"></div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleBlock; 