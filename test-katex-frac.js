const katex = require('katex');
try {
  console.log(katex.renderToString("\\frac{4}{2\\sqrt{x}}"));
} catch (e) {
  console.log("Error 1:", e.message);
}
try {
  console.log(katex.renderToString("\\\\frac{4}{2\\\\sqrt{x}}"));
} catch (e) {
  console.log("Error 2:", e.message);
}
