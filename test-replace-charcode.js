const str = 'a\\\\\\\\b';
console.log('Original length:', str.length);
for(let i=0; i<str.length; i++) console.log('O', i, str.charCodeAt(i));

const replaced = str.replace(/\\\\/g, '\\\\');
console.log('Replaced length:', replaced.length);
for(let i=0; i<replaced.length; i++) console.log('R', i, replaced.charCodeAt(i));
