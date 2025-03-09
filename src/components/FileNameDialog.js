import React, { useState, useEffect, useRef } from 'react';
import './FileNameDialog.css';

const FileNameDialog = ({ isOpen, onClose, onSubmit }) => {
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when dialog opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileName.trim()) {
      onSubmit(fileName.trim());
      setFileName(''); // Reset the input
    }
  };

  const handleCancel = () => {
    setFileName(''); // Reset the input
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="file-name-dialog-backdrop">
      <div className="file-name-dialog">
        <h3>Create New File</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fileName">File Name:</label>
            <input
              id="fileName"
              ref={inputRef}
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name (will be appended with .md if needed)"
            />
          </div>
          <div className="dialog-buttons">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={!fileName.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileNameDialog; 