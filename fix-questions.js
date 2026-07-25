const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'data', 'questions.js');
let code = fs.readFileSync(filePath, 'utf8');

// We need to replace all mathematical template literals with String.raw
// The easiest way is to look for backslashes in template literals.
// But we already have double backslashes like \\sqrt and \\frac.
// First, we revert them to single backslashes so String.raw works as expected!
// Wait! If I just keep double backslashes and DO NOT use String.raw, I can just use FOUR backslashes!
// Let's use four backslashes everywhere we have two backslashes in a math string!

// Replace \\sqrt with \\\\sqrt
code = code.replace(/\\\\sqrt/g, '\\\\\\\\sqrt');
// Replace \\frac with \\\\frac
code = code.replace(/\\\\frac/g, '\\\\\\\\frac');
// Replace \\cdot with \\\\cdot
code = code.replace(/\\\\cdot/g, '\\\\\\\\cdot');
// Replace \\sin with \\\\sin
code = code.replace(/\\\\sin/g, '\\\\\\\\sin');
// Replace \\cos with \\\\cos
code = code.replace(/\\\\cos/g, '\\\\\\\\cos');
// Replace \\ln with \\\\ln
code = code.replace(/\\\\ln/g, '\\\\\\\\ln');
// Replace \\csc with \\\\csc
code = code.replace(/\\\\csc/g, '\\\\\\\\csc');
// Replace \\sec with \\\\sec
code = code.replace(/\\\\sec/g, '\\\\\\\\sec');

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed questions.js by replacing 2 backslashes with 4 backslashes.');
