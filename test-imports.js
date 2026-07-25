const { generateHard, generateBoss, generateMedium } = require('./server/data/questions.js');
console.log('Medium:', JSON.stringify(generateMedium()));
console.log('Hard:', JSON.stringify(generateHard()));
console.log('Boss:', JSON.stringify(generateBoss()));
