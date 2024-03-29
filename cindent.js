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
    /* Common settings and properties */
    this.language = "C";
    this.tabwidth = 4;
    this.expandtabs = true; // Use spaces or tabs

    /* Defines the current parsing and indenting progress */
    this.parseState = {
        position: 0,      // Index in input
        depth: 0,         // Depth during formatting
    };

    this.indentoptions = {
    };

    /* Source - Input and Output */
    this.source = source;         // The input source code
    this.result = new String();   // Prettified output

    /* Defines differnt kinds of Tokens found in a C program. */
    /* Used a Enum */
    this.TOKEN_TYPE = {
        CONSTANT  : 0,
        KEYWORD   : 1,
        IDENTIFIER: 2,
        STRING    : 3,
        CHARACTER : 4,
        OPERATOR  : 5,
        PUNCTUATOR: 6,
        PREPROCESSOR: 7
    };

    /* An array of all operators and punctuators found in C code */
    /* Also contains the formatting information related to that token */
    this.TOKEN_VALUES = {
        /* Operators */
        '+'  : { value: 0, type: this.TOKEN_TYPE.OPERATOR},
        '-'  : { value: 1, type: this.TOKEN_TYPE.OPERATOR },
        '/'  : { value: 2, type: this.TOKEN_TYPE.OPERATOR },
        '*'  : { value: 3, type: this.TOKEN_TYPE.OPERATOR },
        '%'  : { value: 4, type: this.TOKEN_TYPE.OPERATOR },
        '--' : { value: 5, type: this.TOKEN_TYPE.OPERATOR },
        '++' : { value: 6, type: this.TOKEN_TYPE.OPERATOR },
        
        '='  : { value: 7, type: this.TOKEN_TYPE.OPERATOR },
        '*=' : { value: 8, type: this.TOKEN_TYPE.OPERATOR },
        '/=' : { value: 9, type: this.TOKEN_TYPE.OPERATOR },
        '%=' : { value: 10, type: this.TOKEN_TYPE.OPERATOR },
        '+=' : { value: 11, type: this.TOKEN_TYPE.OPERATOR },
        '-=' : { value: 12, type: this.TOKEN_TYPE.OPERATOR },
        '<<=': { value: 13, type: this.TOKEN_TYPE.OPERATOR },
        '>>=': { value: 14, type: this.TOKEN_TYPE.OPERATOR },
        '&=' : { value: 15, type: this.TOKEN_TYPE.OPERATOR },
        '^=' : { value: 16, type: this.TOKEN_TYPE.OPERATOR },
        '|=' : { value: 17, type: this.TOKEN_TYPE.OPERATOR },

        '==' : { value: 18, type: this.TOKEN_TYPE.OPERATOR },
        '!=' : { value: 19, type: this.TOKEN_TYPE.OPERATOR },
        '>'  : { value: 20, type: this.TOKEN_TYPE.OPERATOR },
        '='  : { value: 21, type: this.TOKEN_TYPE.OPERATOR },
        '<=' : { value: 22, type: this.TOKEN_TYPE.OPERATOR },
        '>=' : { value: 23, type: this.TOKEN_TYPE.OPERATOR },
        '||' : { value: 24, type: this.TOKEN_TYPE.OPERATOR },
        '&&' : { value: 25, type: this.TOKEN_TYPE.OPERATOR },
        '!'  : { value: 26, type: this.TOKEN_TYPE.OPERATOR },
        
        '&'  : { value: 27, type: this.TOKEN_TYPE.OPERATOR },
        '|'  : { value: 28, type: this.TOKEN_TYPE.OPERATOR },
        '^'  : { value: 29, type: this.TOKEN_TYPE.OPERATOR },
        '<<' : { value: 30, type: this.TOKEN_TYPE.OPERATOR },
        '>>' : { value: 31, type: this.TOKEN_TYPE.OPERATOR },
        '~'  : { value: 32, type: this.TOKEN_TYPE.OPERATOR },

        ':'  : { value: 33, type: this.TOKEN_TYPE.OPERATOR },
        '?'  : { value: 34, type: this.TOKEN_TYPE.OPERATOR },
        // skipping sizeof :|

        /* Punctuators */
        
        ','  : { value: 36, type: this.TOKEN_TYPE.PUNCTUATOR },
        '{'  : { value: 37, type: this.TOKEN_TYPE.PUNCTUATOR },
        '}'  : { value: 38, type: this.TOKEN_TYPE.PUNCTUATOR },
        '['  : { value: 39, type: this.TOKEN_TYPE.PUNCTUATOR },
        ']'  : { value: 40, type: this.TOKEN_TYPE.PUNCTUATOR },
        '('  : { value: 41, type: this.TOKEN_TYPE.PUNCTUATOR },
        ')'  : { value: 42, type: this.TOKEN_TYPE.PUNCTUATOR },
        ';'  : { value: 42, type: this.TOKEN_TYPE.PUNCTUATOR }
    };

    /**
     * Check if this is an operator or can expect a full opearator 
     * 
     * @param tempToken A character which check whether its an operator, or
     *                  there exists an operator which starts with it
     * @returns true if match found, otherwise false
     */
    this.checkOperatorStart = function(tempToken) {
        for (var key in this.TOKEN_VALUES) {
            if (tempToken == key[0]) {
                return true;
            }
        }
        return false;
    };

    /* Read the operator token from the input, given the fact that current
     * position is at operator. Uses the big list above to compare and find
     *
     * @returns A string containg the token value
     */
    this.readOperator = function() {
        var token = new String();
        var initpos = this.parseState.position; // save initial index
        var ch = this.source[this.parseState.position++];

        token += ch;
        // read next input character, combine with token and check if it is
        // an operator. Is required to handle cases like '=' and '==' where
        // a part of second can act an independent operator.
        while (this.parseState.position < this.source.length) {
            var tempch = this.source[this.parseState.position++];
            var temptoken = token + tempch;
            var found = false; // whether a match was found in current iteration

            // Match with each token in TOKEN_VALUES array above
            for (var key in this.TOKEN_VALUES) {
                if (key.substring(0, temptoken.length) == temptoken) {
                    found = true; // iteration found
                    token = temptoken;
                }
            }

            // not found any match in current iteration. Hence cant expect in 
            // next iteration as well. 
            if (!found)
                break;
        }
        this.parseState.position = initpos + token.length;
        return token;
    }

    /**
     * Read a String or Character literal
     *
     * @param isChar Reading String or Character
     * @returns String containing the token value
     */
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

    /**
     * Read an identifier token.
     *
     * @returns A string containg the token value
     */
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

    this.readNumber = function() {
        var patt = "0123456789.flL";
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

    /**
     * Read from input and increase position counter until CHARACTER
     * 'till' is read.
     *
     * @returns The string formed by concatenating all read characters.
     *
     */
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

    /**
     * Higher level function, which returns the next token from the input
     * source string which is a C program code
     */
    this.getNextToken = function() {
        var rews = /\s/; // RegEx to check whitespace

        while (this.parseState.position < this.source.length) {
            var ch = this.source[this.parseState.position];
            var token = {toString: function() { return this.value }};
            
            if (rews.test(ch)) {
                // do nothing, its just a whitespace
            }
            else if (ch == '"') {
                token.value = this.readString(false);
                token.type = this.TOKEN_TYPE.STRING;
                return token;
            }
            else if (ch == "'") {
                token.value = this.readString(true);
                token.type = this.TOKEN_TYPE.CHARACTER;
                return token;
            }
            else if (ch != '#' && !this.checkOperatorStart(ch)) { 
                if ("0123456789".indexOf(ch) == -1) {
                    token.value = this.readIdentifier();
                    token.type = this.TOKEN_TYPE.IDENTIFIER;
                    return token;
                }
                else {
                    token.value = this.readNumber();
                    token.type = this.TOKEN_TYPE.CONSTANT;
                    return token;
                }
            }
            else if (ch == '#') {
                token.value = this.readTill('\n');
                token.type = this.TOKEN_TYPE.PREPROCESSOR;
                return token;
            }
            else if (this.checkOperatorStart(ch)) {
                token.value = this.readOperator();
                token.type = this.TOKEN_TYPE.STRING;
                return token;
            }

            ++this.parseState.position;
        }
        return undefined;
    };

    /**
     * Returns a string containg the required whitespaces to indent a 
     * line a level/depth 'n'
     *
     * @param n Depth of the line which is supposed to Indenter
     * @return A string containing whitespace(space or tabs) to indent line
     */
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
    }

    /**
     * Prettifies the input source - C program code 
     **/
    this.prettify = function() {
        this.result = "";
        
        while (true) {
            var token = this.getNextToken();
            if (!token)
                break;

            if (token.type == this.TOKEN_TYPE.PREPROCESSOR) {
                this.result += token.value + '\n';
            }
            else if (token) {
                var line = "";
                var insideParan = false;
                
                while (token) {
                    if (token.value == '{') {
                        if (line.search("else") == 0) {
                            // do something to remove previous newline
                        }
                        line += ' ' + token.value + '\n';
                        this.result += this.getIndentString(this.parseState.depth);
                        this.result += line;
                        ++this.parseState.depth;
                        break;
                    }
                    else if (token.value == '(') {
                        insideParan = true;
                        line += token.value;
                    }
                    else if (token.value == '[') {
                        line += token.value;
                    }
                    else if (token.value == ')') {
                        insideParan = false;
                        line += token.value;
                    }
                    else if (token.value == ';') {
                        if (!insideParan) {
                            line += token.value + '\n';
                            this.result += this.getIndentString(this.parseState.depth);
                            this.result += line;
                            break;
                        }
                        else {
                            line += token.value;
                        }
                    }
                    else if (token.value == '}') {
                        line += this.getIndentString(--this.parseState.depth);
                        line += token.value + '\n\n';
                        this.result += line;
                        break;
                    }
                    else {
                        if (line.length && token != "++" && token != "--" &&
                                line[line.length-1] != '(' && token != ',' &&
                                line[line.length-1] != '[' && token != ']')
                            line += ' ';
                        line += token;
                    }

                    token = this.getNextToken();
                }
            }
        }

        return this.result;
    };

    return this;
}

/************************
 *      Test Code       *
 ************************/
/***
var s = "#include<sf>\n#include <stdio.h>\nconst int x = 5>=4.5;int main(){char *name=\"Vishesh\";char ch='a';while(true){printf(\"hello\");while(true){}}return 0;}";
var x = new Indenter(s);

print("\nAFter running - ");
var result = x.prettify();

print(result);**/
