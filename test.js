const AugmentedForm = require('./AugmentedForm');
const math = require('mathjs');

let x = new AugmentedForm(3,3)
x.parseInit(`
27.6 30.2 162
3100 6400 23610
250 360 1623
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
