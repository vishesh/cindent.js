/**
 * cintent-js
 *
 * cindent-js is code indenter, formatter and beutifier for C programming
 * language, written in JavaScript.
 *
 * @author   Vishesh Yadav <vishesh3y@gmail.com>
 * @license  BSD License
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
        '-'  : { value: 1 },
        '/'  : { value: 2 },
        '*'  : { value: 3 },
        '%'  : { value: 4 },
        '--' : { value: 5 },
        '++' : { value: 6 },
        
        '='  : { value: 7 },
        '*=' : { value: 8 },
        '/=' : { value: 9 },
        '%=' : { value: 10 },
        '+=' : { value: 11 },
        '-=' : { value: 12 },
        '<<=': { value: 13 },
        '>>=': { value: 14 },
        '&=' : { value: 15 },
        '^=' : { value: 16 },
        '|=' : { value: 17 },

        '==' : { value: 18 },
        '!=' : { value: 19 },
        '>'  : { value: 20 },
        '='  : { value: 21 },
        '<=' : { value: 22 },
        '>=' : { value: 23 },
        '||' : { value: 24 },
        '&&' : { value: 25 },
        '!'  : { value: 26 },
        
        '&'  : { value: 27 },
        '|'  : { value: 28 },
        '^'  : { value: 29 },
        '<<' : { value: 30 },
        '>>' : { value: 31 },
        '~'  : { value: 32 },

        ':'  : { value: 33 },
        '?'  : { value: 34 },

        'sizeof': { value: 35 },

        /* Punctuators */
        
        ','  : { value: 36 },
        '{'  : { value: 37 },
        '}'  : { value: 38 },
        '['  : { value: 39 },
        ']'  : { value: 40 },
        '('  : { value: 41 },
        ')'  : { value: 42 },
        ';'  : { value: 42 }
    };

    this.checkOperatorStart = function(tempToken) {
        for (var key in this.TOKEN_VALUES) {
            if (tempToken == key[0]) {
                return true;
            }
        }
        return false;
    };

    this.readOperator = function() {
        var token = new String();
        var initpos = this.parseState.position;
        var ch = this.source[this.parseState.position++];
        //print("ch = " + ch);

        token += ch;
        while (this.parseState.position < this.source.length) {
            var tempch = this.source[this.parseState.position++];
            var temptoken = token + tempch;
            var found = false;

            for (var key in this.TOKEN_VALUES) {
                if (key.substring(0, temptoken.length) == temptoken) {
                    found = true;
                    token = temptoken;
                }
            }

            if (!found)
                break;
        }
        this.parseState.position = initpos + token.length;
        return token;
    }

    this.readString = function(isChar) {
        var lookout;
        var token = new String();
        
        if (isChar) 
            lookout = "'";
        else 
            lookout = '"';

        token += lookout;
        ++this.parseState.position;

        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position++];
            if (token[token.length] != '\\' && ch == lookout) {
                token += ch;
                break;
            }
            token += ch;
        }
        return token;   
    }

    this.readIdentifier = function() {
        var patt = "abcdefghijklmnopqrstuvwxyz" +
                   "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                   "0123456789_";
        var token = new String();

        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position++];
            if (patt.indexOf(ch) == -1) {
                --this.parseState.position;
                break;
            }
            token += ch;
        }
        
        return token;
    }

    this.readTill = function(till) {
        var token = new String();
        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position++];
            if (ch == till) {
                return token;
            }
            token += ch;
        }
        return token;
    }

    this.getNextToken = function() {
        var token = new String();
        var rews = /\s/; // RegEx to check whitespace

        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position];
            
            if (rews.test(ch)) {
                // do nothing
            }
            else if (ch == '"') {
                return readString(false);
            }
            else if (ch == "'") {
                return readString(true);
            }
            else if (ch != '#' && !this.checkOperatorStart(ch)) {
                return readIdentifier();
            }
            else if (ch == '#') {
                return readTill('\n');
            }
            else if (this.checkOperatorStart(ch)) {
                return readOperator();
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


var s = "#include <stdio.h>\nconst int x = 5>=4;int main(){char *name=\"Vishesh\";char ch='a';return 0;}";
var x = Indenter(s);

print("\nAFter running\n\n");

while (true) {
    var y = x.getNextToken();
    if (!y.length)
        break;
    else
        print(y);
}


