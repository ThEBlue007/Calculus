const str = "\\sqrt{x}";
console.log("Original string:", str);
console.log("Replaced string:", str.replace(/\\\\/g, '\\'));

const mathStr = "f(x) = 4\\sqrt{x}";
console.log(mathStr.replace(/\\\\/g, '\\'));

const dotStr = "2(x^2 + 1)^1 \\cdot 2x";
console.log(dotStr.replace(/\\\\/g, '\\'));
