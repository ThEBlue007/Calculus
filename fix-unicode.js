const fs = require('fs');
let code = fs.readFileSync('server/data/questions.js', 'utf8');

code = code.replace(/\\\\\\\\frac\{\$\{a\}\}\{2\\\\\\\\sqrt\{x\}\}/g, '${a} / (2√x)');
code = code.replace(/\\\\\\\\frac\{\$\{a\}\}\{\\\\\\\\sqrt\{x\}\}/g, '${a} / √x');
code = code.replace(/\\\\\\\\frac\{1\}\{2\\\\\\\\sqrt\{x\}\}/g, '1 / (2√x)');
code = code.replace(/f\(x\) = \$\{a\}\\\\\\\\sqrt\{x\}/g, 'f(x) = ${a}√x');
code = code.replace(/\$\{a\}\\\\\\\\sqrt\{x\}/g, '${a}√x');

code = code.replace(/\\\\\\\\frac\{3\}\{2\\\\\\\\sqrt\{\$\{a\}x \+ \$\{b\}\}\}/g, '3 / (2√(${a}x + ${b}))');
code = code.replace(/\$\{3 \* a\}\\\\\\\\sqrt\{\$\{a\}x \+ \$\{b\}\}/g, '${3 * a}√(${a}x + ${b})');
code = code.replace(/\$\{coef\}\\\\\\\\sqrt\{\$\{a\}x \+ \$\{b\}\}/g, '${coef}√(${a}x + ${b})');

code = code.replace(/\\\\\\\\sqrt\{\(\$\{a\}x \+ \$\{b\}\)\^3\}/g, '√(${a}x + ${b})^3');

code = code.replace(/\\\\\\\\cdot/g, '·');

fs.writeFileSync('server/data/questions.js', code);
