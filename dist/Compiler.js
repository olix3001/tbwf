"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenType;
(function (TokenType) {
    TokenType[TokenType["BRACKET"] = 0] = "BRACKET";
    TokenType[TokenType["TEXT"] = 1] = "TEXT";
    TokenType[TokenType["OPERATOR"] = 2] = "OPERATOR";
})(TokenType || (TokenType = {}));
var StatementType;
(function (StatementType) {
    StatementType[StatementType["NODE"] = 0] = "NODE";
    StatementType[StatementType["TEXT_NODE"] = 1] = "TEXT_NODE";
    StatementType[StatementType["ARG"] = 2] = "ARG";
    StatementType[StatementType["JS"] = 3] = "JS";
})(StatementType || (StatementType = {}));
class Token {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
    toString() {
        return `${this.type.toString()} - ${this.data}`;
    }
}
class Statement {
    constructor(type) {
        this.type = type;
    }
}
class Compiler {
    static tokenize(code) {
        const tokens = [];
        let p = 0;
        while (p < code.length) {
            if (code[p] == '<')
                tokens.push(new Token(TokenType.BRACKET, '<'));
            else if (code[p] == '>')
                tokens.push(new Token(TokenType.BRACKET, '>'));
            else if (code[p] == '{')
                tokens.push(new Token(TokenType.BRACKET, '{'));
            else if (code[p] == '}')
                tokens.push(new Token(TokenType.BRACKET, '}'));
            else if (code[p] == '=')
                tokens.push(new Token(TokenType.OPERATOR, '='));
            else if (code[p] == '/')
                tokens.push(new Token(TokenType.OPERATOR, '/'));
            else if (code[p] == '"')
                tokens.push(new Token(TokenType.OPERATOR, '"'));
            else if (code[p] != ' ' && code[p] != '\n' && code[p] != '\t') {
                let b = p;
                while (p < code.length && code[p] != ' ' && code[p] != '\n' && code[p] != '\t' && !'<>{}=/"'.includes(code[p]))
                    ++p;
                tokens.push(new Token(TokenType.TEXT, code.substring(b, p)));
                --p;
            }
            ++p;
        }
        return tokens;
    }
    static parse(tokens) {
        var p = 0;
        var statement = expectTagDefinition(tokens, p);
    }
}
exports.default = Compiler;
function expectToken(tokens, p, type, data) {
    return (tokens[p].type == type && (data == undefined || tokens[p].data == data)) ? tokens[p] : null;
}
function expectTagDefinition(tokens, p) {
    var _a;
    if (expectToken(tokens, p, TokenType.BRACKET, '<') != null) {
        ++p;
        const tag = (_a = expectToken(tokens, p, TokenType.TEXT)) === null || _a === void 0 ? void 0 : _a.data;
        console.log(tag);
        ++p;
        let temp = '';
        while ((temp = expectArgument(tokens, p)) != null) {
            console.log(temp);
            p = temp.p;
        }
        console.log(temp);
    }
}
function expectArgument(tokens, p) {
    const arg = expectToken(tokens, p, TokenType.TEXT);
    ++p;
    if (arg == null)
        return null;
    if (expectToken(tokens, p, TokenType.OPERATOR, '=') == null)
        return null;
    ++p;
    // Normal option
    if (expectToken(tokens, p, TokenType.OPERATOR, '"') == null) {
        // TODO: JS OPTION
        return null;
    }
    ++p;
    var data = '';
    let temp = '';
    while ((temp = expectToken(tokens, p, TokenType.TEXT)) != null) {
        data += temp.data;
        ++p;
    }
    if (expectToken(tokens, p, TokenType.OPERATOR, '"') == null)
        return null;
    ++p;
    return { p: p, n: arg.data, c: data };
}
