const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'data', 'questions.js');
let code = fs.readFileSync(filePath, 'utf8');

// The user requested TWO backslashes `\\sqrt` and `\\frac` instead of FOUR.
// We will replace `\\\\` with `\\`.
code = code.replace(/\\\\\\\\sqrt/g, '\\\\sqrt');
code = code.replace(/\\\\\\\\frac/g, '\\\\frac');

// Also, double check if there are any `sqrtx` without braces (there shouldn't be, but just in case)
code = code.replace(/\\\\sqrtx/g, '\\\\sqrt{x}');

fs.writeFileSync(filePath, code);
console.log('Fixed questions.js to use two backslashes');
