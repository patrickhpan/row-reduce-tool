const AugmentedForm = require('./AugmentedForm');
const math = require('mathjs');

let x = new AugmentedForm(4, 5)
x.parseInit(`
1 0 -9 - 4
0 1 3 0 -1
0 0 0 1 -7
0 0 0 0 1
`)

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
      x.parse(chunk)
  }
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});