/**
 * Jest transformer for Google Apps Script files
 * Automatically adds CommonJS exports for testing purposes without modifying source files
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  process(sourceText, sourcePath) {
    // Only transform files in the src/ directory
    if (!sourcePath.includes(path.sep + 'src' + path.sep)) {
      return { code: sourceText };
    }

    // Skip if file already has module.exports
    if (sourceText.includes('module.exports')) {
      return { code: sourceText };
    }

    // Extract function names from the source
    const functionNames = extractFunctionNames(sourceText);
    
    if (functionNames.length === 0) {
      return { code: sourceText };
    }

    // Add CommonJS exports for testing
    const exportCode = `
    // Auto-generated exports for Jest testing
    /* istanbul ignore next */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { ${functionNames.join(',')} };
    }`;

    return {
      code: sourceText + exportCode
    };
  }
};

/**
 * Extract function names from JavaScript source code
 * @param {string} source - JavaScript source code
 * @returns {string[]} - Array of function names
 */
function extractFunctionNames(source) {
  const functionNames = [];
  
  // Match function declarations: function functionName(
  const functionDeclarations = source.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm);
  if (functionDeclarations) {
    functionDeclarations.forEach(match => {
      const name = match.replace(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(.*/, '$1');
      if (name && !functionNames.includes(name)) {
        functionNames.push(name);
      }
    });
  }

  // Match arrow functions assigned to variables: const functionName = (
  const arrowFunctions = source.match(/^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/gm);
  if (arrowFunctions) {
    arrowFunctions.forEach(match => {
      const name = match.replace(/^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*/, '$1');
      if (name && !functionNames.includes(name)) {
        functionNames.push(name);
      }
    });
  }

  return functionNames;
}
