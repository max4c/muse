import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

const FileNameDialog = ({ isOpen, onClose, onSubmit }) => {
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);
  const { theme } = useTheme();

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
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className="rounded-lg p-6 w-96 max-w-full shadow-xl" style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        border: '1px solid var(--color-gray-300)'
      }}>
        <h3 className="text-xl font-semibold mb-4">Create New File</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fileName" className="block text-sm font-medium mb-1" style={{
              color: 'var(--color-gray-600)'
            }}>
              File Name:
            </label>
            <input
              id="fileName"
              ref={inputRef}
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--color-gray-50)' : 'white',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-gray-300)'
              }}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--color-gray-200)',
                color: 'var(--color-gray-800)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileNameDialog; 