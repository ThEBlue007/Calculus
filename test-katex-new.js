const katex = require('katex');

try {
  console.log(katex.renderToString("2(x^2 + 1)^1 \\cdot 2x"));
} catch (e) {
  console.error("Error 1:", e.message);
}

try {
  console.log(katex.renderToString("2(x^2 + 1)^1 cdot 2x"));
} catch (e) {
  console.error("Error 2:", e.message);
}

try {
  console.log(katex.renderToString("4\\sqrtx"));
} catch (e) {
  console.error("Error 3:", e.message);
}

try {
  console.log(katex.renderToString("4\\sqrt{x}"));
} catch (e) {
  console.error("Error 4:", e.message);
}
