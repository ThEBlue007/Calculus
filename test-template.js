const a = 4;
const s = `f(x) = ${a}\\sqrt{x}, f'(x) = ?`;
console.log("Original string:");
console.log(s);

const katex = require('katex');
try {
  console.log("KaTeX Output (Direct):");
  console.log(katex.renderToString(s, { throwOnError: false }));
} catch(e) {
  console.log(e);
}

const afterReplace = s.replace(/\\\\/g, '\\');
console.log("After Replace:");
console.log(afterReplace);
try {
  console.log("KaTeX Output (After Replace):");
  console.log(katex.renderToString(afterReplace, { throwOnError: false }));
} catch(e) {
  console.log(e);
}
