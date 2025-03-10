import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles.css';
import './markdown.css';

// Create root and render App
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
