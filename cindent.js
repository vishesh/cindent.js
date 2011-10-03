/**
 * A small C code indenter
 *
 */

var Indenter = function(source) {
    this.language = "C";
    this.tabwidth = 4;
    this.expandtabs = true;

    this.parseState = {
        position: 0,
        depth: 0,
    };

    this.source = source;
    this.result = new String();

    this.TOKEN_TYPE = {
        CONSTANT  : { value: 0 },
        KEYWORD   : { value: 1 },
        IDENTIFIER: { value: 2 },
        STRING    : { value: 3 },
        CHARACTER : { value: 4 },
        OPERATOR  : { value: 5 },
        PUNCTUATOR: { value: 6 }
    };

    this.TOKEN_VALUES = {
        /* Operators */
        '+'  : { value: 0 },
        '-'  : { value: 0 },
        '/'  : { value: 0 },
        '*'  : { value: 0 },
        '%'  : { value: 0 },
        '--' : { value: 0 },
        '++' : { value: 0 },
        
        '='  : { value: 0 },
        '*=' : { value: 0 },
        '/=' : { value: 0 },
        '%=' : { value: 0 },
        '+=' : { value: 0 },
        '-=' : { value: 0 },
        '<<=': { value: 0 },
        '>>=': { value: 0 },
        '&=' : { value: 0 },
        '^=' : { value: 0 },
        '|=' : { value: 0 },

        '==' : { value: 0 },
        '!=' : { value: 0 },
        '>'  : { value: 0 },
        '='  : { value: 0 },
        '<=' : { value: 0 },
        '>=' : { value: 0 },
        '||' : { value: 0 },
        '&&' : { value: 0 },
        '!'  : { value: 0 },
        
        '&'  : { value: 0 },
        '|'  : { value: 0 },
        '^'  : { value: 0 },
        '<<' : { value: 0 },
        '>>' : { value: 0 },
        '~'  : { value: 0 },

        ':'  : { value: 0 },
        '?'  : { value: 0 },

        'sizeof': { value: 0 },

        /* Punctuators */
        
        ','  : { value: 0 },
        '{'  : { value: 0 },
        '}'  : { value: 0 },
        '['  : { value: 0 },
        ']'  : { value: 0 },
        '#'  : { value: 0 }
    };

    this.checkLiteral = function() {
    };

    this.getNextToken = function() {
        var token = new String();
        var rews = /\s/; // RegEx to check whitespace
        var preceedingWhitespace = true;

        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position];
            if (!rews.test(ch)) {
                preceedingWhitespace = false;
                token += ch;
            }
            else if (rews.test(ch) && !preceedingWhitespace) {
                break;
            }

            ++this.parseState.position;
        }
        return token;
    };

    this.getIndentString = function(n) {
        var str = new String();
        for (i = 0; i < n; i++) {
            if (this.expandtabs) {
                for (j = 0; j < this.tabwidth; j++) {
                    str += ' ';
                }
            }
            else {
                str += '\t';
            }
        }
        return str;
    };

    this.prettify = function() {
        
    };

    return this;
}


var s = "#include <stdio.h>\nconst int x = 5;int main(){return 0;}";
var x = Indenter(s);

print("\nAFter running\n\n");

while (true) {
    var y = x.getNextToken();
    if (!y.length)
        break;
    else
        print(y);
}


