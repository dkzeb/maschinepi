const fs = require('node:fs');

console.log('copying prebuilds');

// naudiodon2
fs.cpSync('node_modules/speaker/build/Release/.', './build/Release/.', {recursive: true });


fs.cpSync('node_modules/node-hid/prebuilds/.', './dist/prebuilds/.', { recursive: true });