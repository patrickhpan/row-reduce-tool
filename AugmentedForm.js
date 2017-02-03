const math = require('mathjs');
const leftPad = require('left-pad');

class AugmentedForm {
    constructor(rows, columns, values) {
        if (!rows || rows < 1 || !columns || columns < 1) {
            throw new Error(`Invalid number of rows or columns (specified: ${rows} by ${columns})`);
        }
        this._rows = rows;
        this._columns = columns;
        this._history = []
        if (values) {
            this.initialize(values);
        }
    }
    getRows() {
        return this._rows;
    }
    getColumns() {
        return this._columns;
    }
    initialize(values) {
        if (!(values instanceof Array)) {
            throw new Error('Attempted to initialize AugmentedForm without Array');
        }
        if (values.length !== this._rows) {
            throw new Error(`Supplied array is of incorrect dimensions (should be ${this._rows} by ${this._columns}, ${values.length} by ${values[0].length || 0} provided)`);
        }
        values.forEach(row => {   
            if (!(row instanceof Array)) {
                throw new Error('Array contains non-array element')
            }   
            if (row.length !== this._columns) {
                throw new Error(`Supplied array is of incorrect dimensions (should be ${this._rows} by ${this._columns}, ${values.length} by ${values[0].length || 0} provided)`);
            }
        })
        this._matrix = values;
        
        this._updateHistory('init')
        console.log(this.formatMatrix());
    }
    swapRows(row1, row2) {
        if (!this._matrix) {
            throw new Error(`Matrix not yet initialized`);
        }
        if (!(typeof row1 === 'number' && row1 >= 1 && typeof row2 === 'number' && row2 >= 1)) {
            throw new Error(`Invalid rows (specified ${row1}, ${row2})`);
        }

        row1--; row2--;        
        
        let temp = this._matrix[row1];
        this._matrix[row1] = this._matrix[row2];
        this._matrix[row2] = temp;

        this._updateHistory(`swap r${row1} r${row2}`)

        console.log(this.formatMatrix());
    }
    multiplyRow(row, scalar) {
        if (!this._matrix) {
            throw new Error(`Matrix not yet initialized`);
        }
        if (!(typeof row === 'number' && row >= 1)) {
            throw new Error(`Invalid row (specified ${row})`);
        }
        if (!(typeof scalar === 'number' || math.typeof(scalar) === 'Fraction')) {
            throw new Error(`Invalid scalar (specified ${scalar})`);
        }
        if (scalar === 0) {
            throw new Error(`Cannot multiply row by 0`);
        }

        row--;

        this._matrix[row] = this._matrix[row].map(x => math.multiply(math.fraction(x), math.fraction(scalar)));

        this._updateHistory(`mult r${row}*${scalar}`)

        console.log(this.formatMatrix());
    }
    addRows(row1, row2, scalar = 1) {
        if (!this._matrix) {
            throw new Error(`Matrix not yet initialized`);
        }
        if (!(typeof row1 === 'number' && row1 >= 1 && typeof row2 === 'number' && row2 >= 1)) {
            throw new Error(`Invalid rows (specified ${row1}, ${row2})`);
        }
        if (!(typeof scalar === 'number' || math.typeof(scalar) === 'Fraction')) {
            throw new Error(`Invalid scalar (specified ${scalar})`);
        }

        row1--; row2--;

        let temp = this._matrix[row2].map(x => math.multiply(math.fraction(x), math.fraction(scalar)));
        this._matrix[row1] = this._matrix[row1].map((x, i) => math.add(math.fraction(x), math.fraction(temp[i])));

        this._updateHistory(`add r${row1} r${row2}*${scalar}`)
    
        console.log(this.formatMatrix());
    }
    formatMatrix(matrix = this._matrix) {
        if (!matrix) {
            throw new Error(`Matrix not yet initialized`);
        }

        let strings = matrix.map(row => row.map(x=> math.format(x).replace(/\/1$/, '')));
        let maxLength = strings.map(row => row.map(x => x.length).reduce((a,b) => a > b ? a : b)).reduce((a,b) => a > b ? a : b)
        return strings.map(row => row.map(x => leftPad(x, maxLength)).join('  ')).join('\n')
    }
    // undo() {
    //     if (this._history.length <= 1) {
    //         return;
    //     }
    //     this._history.pop();
    //     this._matrix = this._history[this._history.length-1].state;
    //     console.log(this.formatMatrix());
    // }
    _updateHistory(op) {
        this._history.push({
            op,
            state: this.formatMatrix(),
            tex: this.tex()
        });
    }
    printHistory() {
        this._history.forEach(entry => {
            // let formatted = this.formatMatrix(entry.state);
            let formatted = entry.state;
            let divider = Array(formatted.indexOf('\n')).fill('=').join('');
            console.log(divider);
            console.log(entry.op);
            console.log(formatted);
        })
    }
    parse(str) {
        str = str.trim();
        let swapMatch = str.match(/\s*s(?:wap)?\s+(\d+)\s+(\d+)\s*/);
        if (swapMatch) {
            this.swapRows(Number(swapMatch[1]), Number(swapMatch[2]))
            return;
        }
        let multMatch = str.match(/\s*(?:[\*(?:m(?:ult)?)])\s+(\d+)\s+(-?\d+(?:(?:\/|\.)?\d+))\s*/);
        if (multMatch) {
            this.multiplyRow(Number(multMatch[1]), math.fraction(multMatch[2]))
            return;
        }
        let addMatch = str.match(/\s*(?:[\+(?:a(?:dd)?)])\s+(\d+)\s+(\d+)(?:\s+(-?\d+(?:(?:\/|\.)\d+)?))?\s*/);
        if (addMatch) {
            if (addMatch[3]) {
                this.addRows(Number(addMatch[1]), Number(addMatch[2]), math.fraction(addMatch[3]))
            } else {
                this.addRows(Number(addMatch[1]), Number(addMatch[2]))
            }
            return;
        }
        if (str.match(/^\s*u/)) {
            this.undo();
            return;
        }
        if (str.match(/^\s*hi/)) {
            this.printHistory();
            return;
        }
        if (str.match(/^\s*p/)) {
            console.log(this.formatMatrix())
            return;
        }
        if (str.match(/^\s*te/)) {
            console.log(this.tex())
            return;
        }
        if (str.match(/^\s*th/)) {
            this.printTexHistory()
            return;
        }
        console.log("Invalid command.")
    }
    tex(matrix = this._matrix) {
        return `\\begin{bmatrix}
            ${matrix.map(row => row.join('&').trim()).join('\\\\ \n')}
        \\end{bmatrix}`
    }
    printTexHistory() {
        console.log("\n$$")
        console.log(this._history.map(entry => entry.tex).join("\\sim\n"))
        console.log("$$\n")
    }
    parseInit(rows) {
        let values = rows.split(/\n+/).filter(x => x.trim().length > 0).map(row => row.split(/\s+/).filter(x => x.trim().length > 0).map(x => math.fraction(x)));
        this.initialize(values);
    }
}

module.exports = AugmentedForm;