import {defaults} from './defaults';

var oldParseFloat = parseFloat;
parseFloat = function(str) {
    return Math.round(oldParseFloat(str) * 100000) / 100000;
}

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

const logicalOperations = [
    {
        operator: "=",
        logOperation: function(a, b) {
            return a == b ? 1 : 0;
        }
    },
    {
        operator: "!=",
        logOperation: function(a, b) {
            return a != b ? 1 : 0;
        }
    },
    {
        operator: "<",
        logOperation: function(a, b) {
            return a < b ? 1 : 0;
        }
    },
    {
        operator: ">",
        logOperation: function(a, b) {
            return a > b ? 1 : 0;
        }
    },
    {
        operator: "<=",
        logOperation: function(a, b) {
            return a <= b ? 1 : 0;
        }
    },
    {
        operator: ">=",
        logOperation: function(a, b) {
            return a >= b;
        }
    }
]

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
    }
];

const arithmeticalFunctionDetection = new RegExp(
    "(" + arithmeticalFunctions.map(function(elem) {
        return elem.detect
    }).join("|") + ")", "i"
);

const logicalFunctions = [
    {
        operator: "if",
        //detect: "^if\\(([a-z]+[0-9]+|[0-9]+)\\s*(<=|>=|<|>|=|!=)\\s*([a-z]+[0-9]+|[0-9]+)\\s*,",
        detect: "^if\\(",
        
        logFun: function(data, table, it) {
            var fun = extractSubFunction(data);
            var fullCommand = "";
            if(fun.problems) {
                return fun.str;
            }
            else {
                fun = fun.str;
            }
            console.log(fun);
            console.log("tukaj vse dela");
            var ifStatement = ["", "", ""];

            for(var i = 0, k = 0, brackets = 0; i < fun.length && k < 3; i++) {
                fullCommand += fun[i];
                if(fun[i] == '(')
                    brackets++;
                else if(fun[i] == ')')
                    brackets--;
                
                if(fun[i] == ',' && brackets == 0)
                    k++;
                else
                    ifStatement[k] += fun[i];
            }
            
            console.log(ifStatement);
            console.log(ifStatement.filter(elem => elem.length == 0));
            
            if(brackets != 0 || ifStatement.filter(elem => elem.length == 0).length > 0) {
                return "[ERROR]";
            }

            console.log(ifStatement);

            var conditionInputs = [], conditionOperators = [];
            // ToDo:
            var conditionResult = solveFunction_(table, ifStatement[0], it+1, true);
            console.log("Condition result:");
            console.log(conditionResult);

            return {
                command: "if(" + fullCommand + ")",
                value: solveFunction_(table, parseInt(conditionResult) > 0 ? ifStatement[1] : ifStatement[2], it+1)
            };
        }
    }
];

const logicalFunctionsDetection = new RegExp(
    "(" + logicalFunctions.map(function(elem) {
        return elem.detect
    }).join("|") + ")", "i"
);

// console.log("__________");
// console.log(arithmeticalFunctionDetection);

/**
 * @param {string} cell
 */
export function CellCalculator(table, cell, it = 0) {
    if(it > defaults.tableFunctionRecursionNumber) {
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


function solveFunction_(table, fun, it, logicFun = false) {
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
                console.log("[STATUS] Found one arithmetical operator.");
            }
            else if(logicFun == true && /^(<=|>=|<|>|=|!=)/.test(fun)) {
                found = fun.match(/^(<=|>=|<|>|=|!=)/gmi)[0];
                operations.push(found);
                console.log("[STATUS] Found one logical operator.");
            }
            else {
                console.log("[ERROR] Expected operator between operands. \n" + fun);
                return "[ERROR]";
            }
        }
        else if(/^('([^']*)'|"([^"]*)")/i.test(fun)) {
            found = fun.match(/^('([^']*)'|"([^"]*)")/gmi)[0];
            var tmp = fun.substring(found.length);
            if(tmp.length == 0 || /^\s*(;|$)/i.test(tmp)) {
                console.log("[STATUS] Found some text to print.");
                return found.substring(1, found.length - 1);
            }
            else {
                console.log("[ERROR] Found invalid string in function.");
                return "[ERROR]";
            }
        }
        else if(arithmeticalFunctionDetection.test(fun)) {
            arithmeticalFunctions.forEach((elem) => {
                if(new RegExp(elem.detect, "i").test(fun)) {
                    found = fun.match(new RegExp(elem.detect, "i"))[0];
                    console.log("[STATUS] Found an arithmetical function:" + elem.operator.toUpperCase());
                    numbers.push(elem.mathFun(found.match(elem.dataExtract)[0], table, it++));
                }
            });
        }
        else if(logicalFunctionsDetection.test(fun)) {
            logicalFunctions.filter(elem => (new RegExp(elem.detect)).test(fun)).forEach((elem) => {
                var tmp = elem.logFun(fun, table, it++);
                console.log("[STATUS] Found a logical function:" + fun);
                found = tmp.command;    // find a better name
                if(found == "[ERROR]") {
                    return "[ERROR]";
                }
                numbers.push(tmp.value);
            });
        }
        else if(/^\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/.test(fun)) {
            found = fun.match(/^\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/gmi)[0];
            console.log("[STATUS] Found a subfunction:\n\t" + found.substring(1, found.length - 1));
            numbers.push(solveFunction_(table, found.substring(1, found.length - 1), it++, logicFun));
        }
        else if(/^[a-z][a-z]*[0-9][0-9]*/i.test(fun)) {
            found = fun.match(/^[a-z][a-z]*[0-9][0-9]*/gmi)[0];

            if(numbers.length == operations.length) {
                numbers.push(CellCalculator(table, table[tableFormatToNumerical(found).row - 1][tableFormatToNumerical(found).column - 1].text, it++));
                console.log("[STATUS] Found a cell reference.");
            }
            else if(operation == null) {
                console.log("[ERROR] Can't calculate without operator.");
                return "[ERROR]";
            }
        }
        else if(/^(([0-9]+)(\.[0-9]+)?)|(\.?[0-9]+)/.test(fun)) {
            found = fun.match(/^(([0-9]+)(\.[0-9]+)?)|(\.?[0-9]+)/gmi)[0];
            numbers.push(parseFloat(found));
            console.log("[STATUS] Found a real number.");
        }
        else {
            console.log("[ERROR] Found invalid string in function.");
            console.log(fun);
            return "[ERROR]";
        }

        fun = fun.substring(found.toString().length);

        console.log("Numbers: ", numbers, "Operators: ", operations, "Fun: ", fun);
    }

    // Calculating
    for(var i = 0; i < simpleMathOperations.length; i++) {
        for(var k = 0; k < numbers.length - 1; k++) {
            //console.log(simpleMathOperations[i].operator + "\t" + operations[k]);
            for(var j = 0; j < simpleMathOperations[i].length; j++) {
                if(simpleMathOperations[i][j].operator == operations[k]) {
                    numbers[k] = parseFloat(simpleMathOperations[i][j].mathFun(parseFloat(numbers[k]), parseFloat(numbers[k+1])));
                    operations.splice(k, 1);
                    numbers.splice(k+1, 1);
                    k--;
                }
            }
        }
    }

    // Logical operations
    for(var k = 0; k < numbers.length - 1; k++) {
        for(var i = 0; i < logicalOperations.length; i++) {
            if(logicalOperations[i].operator == operations[k]) {
                numbers[k] = (logicalOperations[i].logOperation((numbers[k]), (numbers[k+1])));
                operations.splice(k, 1);
                numbers.splice(k+1, 1);
                k--;
            }
        }
    }

    console.log("End of calculating: " + numbers[0]);
    if(numbers.length == 1 && operations.length == 0) {
        console.log("[STATUS] Calculated correct. Result: " + numbers[0]);
        return numbers[0];
    }
    else {
        console.log("[ERROR] Result is not calculated.\n\tLeft numbers: " + numbers.toString() + "\n\tLeft operations: " + operations.toString());
        return "[ERROR]";
    }
}


function extractSubFunction(fun) {
    var openBrackets = 0, closedBrackets = 0;
    var subfunction = "";

    while(fun.length > 0) {
        
        if(fun[0] == '(') {
            openBrackets++;
        }
        else if(fun[0] == ')') {
            closedBrackets++;
        }
        
        if(openBrackets != 0) {
            if(closedBrackets == openBrackets)
                break;
            else {
                subfunction += fun[0];
            }
        }

        fun = fun.substring(1);
    }

    return {
        problems: openBrackets != closedBrackets,
        str: subfunction.substring(1)
    };

    if(openBrackets != closedBrackets)
        return "[ERROR]";
    else
        return subfunction.substring(1);
}
