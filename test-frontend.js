const mathStr = '3(6x+4)^2 \\\\cdot 6';
console.log('Original length:', mathStr.length);
console.log('Original content:', mathStr);

const parsed = JSON.parse(JSON.stringify({ math: mathStr }));
console.log('Parsed content:', parsed.math);
console.log('Parsed length:', parsed.math.length);

const replaced = parsed.math.replace(/\\\\/g, '\\');
console.log('Replaced content:', replaced);
console.log('Replaced length:', replaced.length);

const katex = require('katex');
try {
  console.log('KaTeX Output:');
  console.log(katex.renderToString(replaced, { throwOnError: false }));
} catch(e) {
  console.log(e);
}
