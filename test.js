const AugmentedForm = require('./AugmentedForm');
const math = require('mathjs');

let x = new AugmentedForm(3, 4, [
    [1, -2, 1, 0],
    [2, -2, -6, 8],
    [-4, 5, 9, -9]
])

x.parse(`+ 1 0 -2; + 2 0 4; * 1 1/2; hist`)