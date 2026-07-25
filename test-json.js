const str = '{"math": "\\\\frac"}';
const obj = JSON.parse(str);
console.log(obj.math);
console.log(obj.math.length);
console.log(obj.math.charCodeAt(0));

const rep = obj.math.replace(/\\\\/g, '\\');
console.log(rep);
console.log(rep.length);
console.log(rep.charCodeAt(0));
