const katex = require('katex');

const s = '\\frac{2x+4}{5x+3}';
console.log("Length:", s.length);
try {
  console.log(katex.renderToString(s, { throwOnError: false }));
} catch (e) {
  console.log("Error:", e.message);
}
