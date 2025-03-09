const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Creates sample markdown files for testing
 */
function createSampleFiles() {
  const defaultDirectory = path.join(app.getPath('documents'), 'Muse');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(defaultDirectory)) {
    fs.mkdirSync(defaultDirectory, { recursive: true });
  }
  
  // Sample files with content
  const sampleFiles = [
    {
      name: 'Welcome.md',
      content: `# Welcome to Muse

Muse is a simple markdown editor built with Electron and React.

## Features

- Edit markdown files
- Preview markdown in real-time
- Store notes locally
- Simple and intuitive interface

## Getting Started

Select a file from the sidebar to edit or create a new file using the button below.
`
    },
    {
      name: 'Markdown Guide.md',
      content: `# Markdown Guide

## Basic Syntax

### Headers

# H1
## H2
### H3
#### H4
##### H5
###### H6

### Emphasis

*Italic* or _Italic_
**Bold** or __Bold__
**_Bold and Italic_**
~~Strikethrough~~

### Lists

#### Unordered List
- Item 1
- Item 2
  - Item 2a
  - Item 2b

#### Ordered List
1. Item 1
2. Item 2
3. Item 3

### Links

[Markdown Guide](https://www.markdownguide.org)

### Images

![alt text](https://www.markdownguide.org/assets/images/markdown-guide-og.jpg)

### Code

Inline code: \`const greeting = "Hello, world!";\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

### Horizontal Rule

---

## Extended Syntax

### Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Task Lists

- [x] Task 1
- [ ] Task 2
- [ ] Task 3

### Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.
`
    },
    {
      name: 'Todo List.md',
      content: `# Todo List

## Project Tasks

- [x] Create basic application structure
- [x] Implement file explorer
- [ ] Add markdown editing features
- [ ] Implement search functionality
- [ ] Add settings page
- [ ] Create dark theme
- [ ] Add export options

## Notes

Remember to:
- Save frequently
- Commit changes to git
- Write tests for new features
`
    }
  ];
  
  // Create each sample file if it doesn't exist
  sampleFiles.forEach(file => {
    const filePath = path.join(defaultDirectory, file.name);
    if (!fs.existsSync(filePath)) {
      // Create file with proper permissions
      fs.writeFileSync(filePath, file.content, {
        encoding: 'utf8',
        mode: 0o666 // Read/write for all users
      });
      console.log(`Created sample file: ${filePath}`);
    } else {
      // Make sure existing files are writable
      try {
        fs.chmodSync(filePath, 0o666);
      } catch (error) {
        console.error(`Failed to set permissions on existing file: ${filePath}`, error);
      }
    }
  });
  
  return defaultDirectory;
}

module.exports = createSampleFiles; 