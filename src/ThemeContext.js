import React, { createContext, useState, useEffect, useContext } from 'react';

// Create theme context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check local storage or system preference for theme
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('muse-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Default to light
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Update theme in local storage and DOM
  useEffect(() => {
    localStorage.setItem('muse-theme', theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Function to set theme explicitly
  const setThemeExplicitly = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      if (newTheme === 'system') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      } else {
        setTheme(newTheme);
      }
    }
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const savedTheme = localStorage.getItem('muse-theme');
      if (savedTheme === 'system') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeExplicitly }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 