import React, { useState, useRef, useEffect } from 'react';

const CodeBlock = ({
  id,
  content,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  isFocused
}) => {
  const editorRef = useRef(null);
  
  // Focus editor when isFocused changes to true
  useEffect(() => {
    if (isFocused && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isFocused]);

  // Handle content change
  const handleChange = (e) => {
    onChange(id, e.target.value);
  };

  // Handle key events in code block (prevent new block on Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.stopPropagation(); // Prevent the default behavior of creating a new block
    } else {
      onKeyDown(id, e);
    }
  };

  return (
    <div className={`code-block markdown-block ${isFocused ? 'focused' : ''}`}>
      {/* Block controls */}
      <div className="block-controls">
        <div className="block-drag-handle" draggable={true}>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {isFocused ? (
        <textarea
          ref={editorRef}
          className="block-editor code-editor"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus
          placeholder=""
          data-testid="code-editor"
        />
      ) : (
        <div 
          className="code-block-viewer"
          onClick={onFocus}
        >
          <pre><code>{content}</code></pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlock; 