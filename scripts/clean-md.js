const fs = require('fs');

const encoding = 'utf-8';
const filePath = 'docs/docs/doc.md';

let fileContent = fs.readFileSync(filePath, encoding);

// Remove HTML comments
fileContent = fileContent.replace(/<!--.*?-->/gs, '');
// Escape curly brackets
fileContent = fileContent.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
// Escape angle brackets
fileContent = fileContent.replace(/</g, '\\<').replace(/>/g, '\\>');
// Remove excesive more than 3 newlines
fileContent = fileContent.replace(/(\n\s*){3,}/g, '\n\n');

fs.writeFileSync(filePath, fileContent, encoding);
console.log('Cleaned MDX-incompatible content');
