const s = "\\\\frac";
console.log("Original:", s);
console.log("Original length:", s.length);

const rep = s.replace(/\\\\/g, '\\');
console.log("Replaced:", rep);
console.log("Replaced length:", rep.length);

const rep2 = s.replace(/\\\\/g, '\\\\');
console.log("Replaced2:", rep2);
console.log("Replaced2 length:", rep2.length);
