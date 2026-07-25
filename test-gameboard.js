const str = 'a\\\\b'; // two backslashes in memory
const regex = /\\\\/g; // regex literal from GameBoard.jsx
const replaced = str.replace(regex, '\\');
console.log('Original:', str.length);
console.log('Replaced:', replaced.length);
