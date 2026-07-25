const katex = require('katex');

const strWithoutRaw = `\cdot`; // Zero backslashes (evaluates to 'cdot')
const strWithRaw = String.raw`\cdot`; // One backslash

console.log('Without raw:');
try { console.log(katex.renderToString(strWithoutRaw)); } catch(e) { console.log(e.message); }

console.log('With raw:');
try { console.log(katex.renderToString(strWithRaw)); } catch(e) { console.log(e.message); }
