import React, { useState, useEffect, useRef } from 'react';

// Group commands by category
const COMMANDS = [
  {
    id: 'text',
    name: 'Text',
    description: 'Just start writing with plain text',
    icon: 'T',
    action: 'text',
    category: 'basic'
  },
  {
    id: 'heading1',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    action: 'heading1',
    category: 'basic'
  },
  {
    id: 'heading2',
    name: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    action: 'heading2',
    category: 'basic'
  },
  {
    id: 'heading3',
    name: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    action: 'heading3',
    category: 'basic'
  },
  {
    id: 'bulletList',
    name: 'Bulleted List',
    description: 'Create a simple bulleted list',
    icon: '•',
    action: 'bulletList',
    category: 'basic'
  },
  {
    id: 'numberedList',
    name: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    action: 'numberedList',
    category: 'basic'
  },
  {
    id: 'todoList',
    name: 'To-Do List',
    description: 'Create a task list with checkboxes',
    icon: '☐',
    action: 'todoList',
    category: 'basic'
  },
  {
    id: 'toggle',
    name: 'Toggle',
    description: 'Create collapsible content',
    icon: '▼',
    action: 'toggle',
    category: 'advanced'
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Capture a code snippet',
    icon: '</>',
    action: 'code',
    category: 'advanced'
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Capture a quote',
    icon: '"',
    action: 'quote',
    category: 'advanced'
  },
];

const SlashCommandMenu = ({ query, onSelect, onClose, position }) => {
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);
  
  // Filter commands based on query
  useEffect(() => {
    if (!query) {
      setFilteredCommands(COMMANDS);
      return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filtered = COMMANDS.filter(command => 
      command.name.toLowerCase().includes(searchTerm) || 
      command.description.toLowerCase().includes(searchTerm)
    );
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prevIndex => 
            prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prevIndex => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
          );
          break;
          
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            console.log('Selecting command via Enter key:', filteredCommands[selectedIndex]);
            onSelect(filteredCommands[selectedIndex]);
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
          
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, filteredCommands, onSelect, onClose]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current) {
      const selectedElement = menuRef.current.querySelector('.slash-command-item.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);
  
  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {});
  
  // Ensure "basic" category appears first
  const orderedCategories = Object.keys(groupedCommands).sort((a, b) => {
    if (a === 'basic') return -1;
    if (b === 'basic') return 1;
    return a.localeCompare(b);
  });
  
  if (filteredCommands.length === 0) {
    return null;
  }
  
  const getCategoryTitle = (category) => {
    switch(category) {
      case 'basic': return 'Basic blocks';
      case 'advanced': return 'Advanced blocks';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  
  const handleClick = (command) => {
    console.log('Command clicked:', command);
    onSelect(command);
  };
  
  return (
    <div 
      className="slash-command-menu"
      role="menu"
      aria-label="Slash Commands"
      ref={menuRef}
      style={{
        top: position?.top || '100%',
        left: position?.left || 0,
      }}
      data-testid="slash-command-menu"
    >
      {orderedCategories.map(category => (
        <div key={category} className="slash-command-category">
          <div className="slash-command-header">
            <span>{getCategoryTitle(category)}</span>
          </div>
          
          <div className="slash-command-list">
            {groupedCommands[category].map((command, index) => {
              // Find the actual index in the flattened list for keyboard navigation
              const flatIndex = filteredCommands.findIndex(cmd => cmd.id === command.id);
              
              return (
                <div 
                  key={command.id}
                  className={`slash-command-item ${flatIndex === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleClick(command)}
                  onMouseEnter={() => setSelectedIndex(flatIndex)}
                  role="menuitem"
                  tabIndex={0}
                  data-testid={`command-${command.action}`}
                >
                  <div className="slash-command-icon">{command.icon}</div>
                  <div className="slash-command-details">
                    <div className="slash-command-name">{command.name}</div>
                    <div className="slash-command-description">{command.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlashCommandMenu; 