const s1 = "\\cdot"; // one backslash
const s2 = "\\\\cdot"; // two backslashes

console.log("Regex /\\\\/g (matches two backslashes in regex literal? No, it matches one backslash in regex!)");
console.log("s1:", s1);
console.log("s1 replaced:", s1.replace(/\\\\/g, '\\'));

console.log("s2:", s2);
console.log("s2 replaced:", s2.replace(/\\\\/g, '\\'));

console.log("Regex /\\\\\\\\/g");
console.log("s2 replaced 4:", s2.replace(/\\\\\\\\/g, '\\'));
