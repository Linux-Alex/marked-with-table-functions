<a href="https://marked.js.org">
  <img width="60px" height="60px" src="https://marked.js.org/img/logo-black.svg" align="right" />
</a>

# Marked with table functions

The repository is based on [Marked](https://github.com/markedjs/marked) repository. But here are the table functions added.

## Usage

Download the project and copy the `marked.min.js` file to the server (or just download this one file) and use the example under this text.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Marked in the browser</title>
</head>
<body>
  <div id="content"></div>
  <script src="marked.min.js"></script>
  <script>
    document.getElementById('content').innerHTML =
      marked.parse('# Marked in the browser\n\nRendered by **marked**.');
  </script>
</body>
</html>
```

## Functions

All functions work only in tables and are writen between `==` signs. Example: `==SUM(B1-B6)==`.

### Example function

**Input:**
```readme
# Finding Rational Zeroes

Polinom function: f(x) = 4x² + 4x - 4

| Designation  | Value                      |
| :----------: | :------------------------: |
| a [x²]       | 4                          |
| b [x]        | 4                          |
| c            | -4                         |
| Discriminant | ==(b2^2-4*b1*b3)==         |
| x1           | ==(0-b2-b4^(1/2))/(2*b1)== |
| x2           | ==(0-b2+b4^(1/2))/(2*b1)== |

```

**Output:**
| Designation  | Value    |
| :----------: | :------: |
| a [x²]       | 4        |
| b [x]        | 4        |
| c            | -4       |
| Discriminant | 80       |
| x1           | -1.61803 |
| x2           | 0.61803  |


### Math operators 

| Operator | Usage | Example | Result |
| :-: | :-- | :-- | :-: |
| + | addition | `==15+3==` | 18 |
| - | subtraction | `==15-3==` | 12 |
| * | multiplication | `==15*3==` | 45 |
| / | division | `==15*3==` | 5 |
| ^ | exponential | `==15^3==` | 3375 |

You can calculate **roots** with exponents.
*Example:* if you want to calculate the square root of 16, you can use `==16^(1/2)==` instead.

### Math functions

| Operator | Usage | Example |
| :-: | :-- | :-- |
| sum(...) | summary | `==sum(B1-B3)==` |
| avg(...) | average | `==avg(B1-B3)==` |
| min(...) | minimum | `==min(B1-B3)==` |
| max(...) | maximum | `==max(B1-B3)==` |

### Conditional statement

**Command structure:**

```
==IF(CONDITION, COMMANDS_IF_STATEMENT_IS_TRUE, COMMANDS_IF_STATEMENT_IS_FALSE)==
```

**Examples:**

```readme
==if(5>3, "Five is greater than three.", "Five isn't greater then three")==
```
