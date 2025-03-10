import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

const Settings = ({ onClose }) => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  
  // Initialize the selected theme from the current theme
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);
  
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };
  
  return (
    <div className="h-full flex flex-col" style={{
      color: 'var(--color-foreground)',
      backgroundColor: 'var(--color-sidebar-bg)'
    }}>
      <div className="flex justify-between items-center py-3 px-2 mb-4" style={{
        borderBottom: '1px solid var(--color-sidebar-border)'
      }}>
        <h2 className="text-lg font-medium">Settings</h2>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-xl"
          style={{
            color: 'var(--color-gray-600)',
            ':hover': { backgroundColor: 'var(--color-gray-200)' }
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <section className="mb-6">
          <h3 className="text-sm uppercase tracking-wide font-medium mb-3" style={{
            color: 'var(--color-gray-500)'
          }}>Appearance</h3>
          
          <div className="mb-4">
            <label 
              htmlFor="theme-select" 
              className="block text-sm mb-1"
              style={{ color: 'var(--color-gray-700)' }}
            >
              Theme
            </label>
            <select 
              id="theme-select" 
              value={selectedTheme} 
              onChange={handleThemeChange}
              className="w-full p-2 rounded-md"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--color-gray-100)' : 'white',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-gray-300)'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Use System Setting</option>
            </select>
          </div>
        </section>
        
        <section className="mb-6">
          <h3 className="text-sm uppercase tracking-wide font-medium mb-3" style={{
            color: 'var(--color-gray-500)'
          }}>Editor</h3>
          <div className="mb-4">
            <label 
              htmlFor="font-size"
              className="block text-sm mb-1"
              style={{ color: 'var(--color-gray-700)' }}
            >
              Font Size
            </label>
            <select 
              id="font-size" 
              defaultValue="medium"
              className="w-full p-2 rounded-md"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--color-gray-100)' : 'white',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-gray-300)'
              }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </section>
        
        <section className="mb-6">
          <h3 className="text-sm uppercase tracking-wide font-medium mb-3" style={{
            color: 'var(--color-gray-500)'
          }}>About</h3>
          <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>Markdown Editor v1.0.0</p>
        </section>
      </div>
    </div>
  );
};

export default Settings; 