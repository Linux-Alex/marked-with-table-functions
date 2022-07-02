// table format to row and column
/**
 * @param {string} cell
 */
function tableFormatToNumerical(cell) {
return {
    column: 
        cell.match(/[a-z]+/smi)[0].toUpperCase().split('').reduce(        // check if you need 'm' in regex
            (previus, current) => previus + current.charCodeAt(0) - 64, 0
        ),
    row:
        parseInt(cell.match(/[0-9]+/smi)[0])
    }  
}

const simpleMathOperations = [ 
    [
        {
            operator: "^", 
            mathFun: function(a, b) {
                return Math.pow(a, b);
            }
        }
    ],
    [
        {
            operator: "*", 
            mathFun: function(a, b) {
                return a * b;
            }
        },
        {
            operator: "/", 
            mathFun: function(a, b) {
                return a / b;
            }
        }
    ],
    [
        {
            operator: "+", 
            mathFun: function(a, b) {
                return a + b;
            }
        },
        {
            operator: "-", 
            mathFun: function(a, b) {
                return a - b;
            }
        }
    ]
];

const arithmeticalFunctions = [
    {
        operator: "sum",
        detect: "^sum\\([a-z][a-z]*[0-9]+-[a-z][a-z]*[0-9]+\\)",
        dataExtract: new RegExp(/(?<=^sum\().*?(?=\))/, "i"),
        mathFun: function(data, table, it) {
            var bounds = data.split('-');
            var cell = [];
                  
            bounds.forEach(bound => {
                cell.push(tableFormatToNumerical(bound));
            });

            var sum = 0; 
            for(var m = Math.min(cell[0].column, cell[1].column); m <= Math.max(cell[0].column, cell[1].column); m++) {
                for(var n = Math.min(cell[0].row, cell[1].row); n <= Math.max(cell[0].row, cell[1].row); n++) {
                    sum += parseFloat(CellCalculator(table, table[n - 1][m - 1].text, it));
                }
            }
            return sum;
        }
    },
    {
        operator: "min",
        detect: "^min\\([a-z][a-z]*[0-9]+-[a-z][a-z]*[0-9]+\\)",
        dataExtract: new RegExp(/(?<=^min\().*?(?=\))/, "i"),
        mathFun: function(data, table, it) {
            var bounds = data.split('-');
            var cell = [];
                  
            bounds.forEach(bound => {
                cell.push(tableFormatToNumerical(bound));
            });

            var min = Number.MAX_SAFE_INTEGER; 
            for(var m = Math.min(cell[0].column, cell[1].column); m <= Math.max(cell[0].column, cell[1].column); m++) {
                for(var n = Math.min(cell[0].row, cell[1].row); n <= Math.max(cell[0].row, cell[1].row); n++) {
                    min = Math.min(parseFloat(CellCalculator(table, table[n - 1][m - 1].text, it)), min);
                }
            }
            return min;
        }
    },
    {
        operator: "max",
        detect: "^max\\([a-z][a-z]*[0-9]+-[a-z][a-z]*[0-9]+\\)",
        dataExtract: new RegExp(/(?<=^max\().*?(?=\))/, "i"),
        mathFun: function(data, table, it) {
            var bounds = data.split('-');
            var cell = [];
                  
            bounds.forEach(bound => {
                cell.push(tableFormatToNumerical(bound));
            });

            var max = Number.MIN_SAFE_INTEGER; 
            for(var m = Math.min(cell[0].column, cell[1].column); m <= Math.max(cell[0].column, cell[1].column); m++) {
                for(var n = Math.min(cell[0].row, cell[1].row); n <= Math.max(cell[0].row, cell[1].row); n++) {
                    max = Math.max(parseFloat(CellCalculator(table, table[n - 1][m - 1].text, it)), max);
                }
            }
            return max;
        }
    },
    {
        operator: "avg",
        detect: "^avg\\([a-z][a-z]*[0-9]+-[a-z][a-z]*[0-9]+\\)",
        dataExtract: new RegExp(/(?<=^avg\().*?(?=\))/, "i"),
        mathFun: function(data, table, it) {
            var bounds = data.split('-');
            var cell = [];
                  
            bounds.forEach(bound => {
                cell.push(tableFormatToNumerical(bound));
            });

            var sum = 0, numberOfElements = 0; 
            for(var m = Math.min(cell[0].column, cell[1].column); m <= Math.max(cell[0].column, cell[1].column); m++) {
                for(var n = Math.min(cell[0].row, cell[1].row); n <= Math.max(cell[0].row, cell[1].row); n++) {
                    sum += parseFloat(CellCalculator(table, table[n - 1][m - 1].text, it));
                    numberOfElements++;
                }
            }
            return sum / numberOfElements;
        }
    },
];

const functionDetection = new RegExp(
    "(" + arithmeticalFunctions.map(function(elem) {
        return elem.detect
    }).join("|") + ")", "i"
);

const maxIterationBeforeError = 25;

console.log("__________");
console.log(functionDetection);

/**
 * @param {string} cell
 */
export function CellCalculator(table, cell, it = 0) {
    if(it > maxIterationBeforeError) {
        return "[ERROR]";
    }
    else if(/==.*==/i.test(cell)) {
        // found function
        console.log("[STATUS] Found a function.");
        var functions = detectAllFunctions(cell).reverse();
        console.log(functions);
        functions.forEach((fun) => {
            var solvedFunction = solveFunction_(table, fun[0].substring(2, fun[0].length - 2).toString()/*.replace(/\s/g, '')*/, it);
            console.log("Solved function:");
            console.log(solvedFunction);
            console.log("Extracted function:");
            console.log(fun);
            cell = [cell.substring(0, fun.index), solvedFunction.toString(), cell.substring(fun.index + fun[0].length)].join('');
            // fun.index ... index start of string where the function is
            // fun[0].length ... length of the string
        });
        return cell;
    }
    else {
        console.log("[STATUS] No function found.");
        return cell;
    }
    return cell;
}

/**
 * 
 * @param {string} cell 
 */
function detectAllFunctions(cell) {
    var functions = [];
    var fun;
    console.log(cell);
    for(fun of cell.matchAll(/(==)(?:(?=(\\?))\2.)*?\1/gmi)) {
        functions.push(fun);
    }
    return functions;
}


function solveFunction_(table, fun, it) {
    var numbers = [], operations = [];
    while(fun.length > 0) {
        while(fun[0] == ' ') {
            fun = fun.substring(1);
        }

        if(fun.length == 0) {
            break;
        }
        
        var found;

        console.log("number: " + numbers.length + "\t operations: " + operations.length);

        if(numbers.length > operations.length) {
            if(/^(\+|\-|\*|\/|\^)/.test(fun)) {
                found = fun.match(/^(\+|\-|\*|\/|\^)/gmi)[0];
                operations.push(found);
            }
            else {
                console.log("[ERROR] Expected operator between operands. \n" + fun);
                return "[ERROR]";
            }
        }
        else if(functionDetection.test(fun)) {
            arithmeticalFunctions.forEach((elem) => {
                if(new RegExp(elem.detect, "i").test(fun)) {
                    found = fun.match(new RegExp(elem.detect, "i"))[0];
                    console.log("[STATUS] Found function:" + elem.operator.toUpperCase());
                    numbers.push(elem.mathFun(found.match(elem.dataExtract)[0], table, it++));
                }
            });
        }
        else if(/^\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/.test(fun)) {
            found = fun.match(/^\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/gmi)[0];
            console.log("[STATUS] Found a subfunction");
            console.log(found.substring(1, found.length - 1));
            numbers.push(solveFunction_(table, found.substring(1, found.length - 1), it++));
        }
        else if(/^[a-z][a-z]*[0-9][0-9]*/i.test(fun)) {
            found = fun.match(/^[a-z][a-z]*[0-9][0-9]*/gmi)[0];

            if(numbers.length == operations.length) {
                numbers.push(CellCalculator(table, table[tableFormatToNumerical(found).row - 1][tableFormatToNumerical(found).column - 1].text, it++));
            }
            else if(operation == null) {
                console.log("[ERROR] Can't calculate without operator.");
                return "[ERROR]";
            }
        }
        else if(/^(([0-9]+)(\.[0-9]+)?)|(\.?[0-9]+)/.test(fun)) {
            found = fun.match(/^(([0-9]+)(\.[0-9]+)?)|(\.?[0-9]+)/gmi)[0];
            numbers.push(found);
        }
        else {
            return "[ERROR]";
        }

        fun = fun.substring(found.length);
    }

    // Calculating
    for(var i = 0; i < simpleMathOperations.length; i++) {
        for(var k = 0; k < numbers.length - 1; k++) {
            //console.log(simpleMathOperations[i].operator + "\t" + operations[k]);
            for(var j = 0; j < simpleMathOperations[i].length; j++) {
                if(simpleMathOperations[i][j].operator == operations[k]) {
                    numbers[k] = simpleMathOperations[i][j].mathFun(parseFloat(numbers[k]), parseFloat(numbers[k+1]))
                    operations.splice(k, 1);
                    numbers.splice(k+1, 1);
                    k--;
                }
            }
        }
    }

    console.log("End of calculating: " + numbers[0]);
    if(numbers.length == 1 && operations.length == 0)
        return numbers[0];
    else 
        return "[ERROR]";
}


/**
 * Iskanje vngezdenih funkcij s pomočjo oklepajev
 *      regex: \((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)
 */