const katex = require('katex');

const s = "\frac"; // One backslash (evaluates to Form Feed + 'rac')
console.log("String is:", s);
console.log("Length is:", s.length);

try {
  console.log(katex.renderToString(s, { throwOnError: false }));
} catch (e) {
  console.log("Error:", e.message);
}
