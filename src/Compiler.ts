enum TokenType {
    BRACKET, TEXT, OPERATOR
}
enum StatementType {
    NODE, TEXT_NODE, ARG, JS
}

class Token {
    type: TokenType
    data: string

    constructor(type: TokenType, data: string) {
        this.type = type
        this.data = data
    }

    toString() {
        return `${this.type.toString()} - ${this.data}`
    }
}

class Statement {
    type: StatementType

    constructor(type: StatementType) {
        this.type = type
    }
}

export default class Compiler {
    static tokenize(code: string) {
        const tokens = []
        let p = 0
        while (p < code.length) {
            if (code[p] == '<') tokens.push(new Token(TokenType.BRACKET, '<'))
            else if (code[p] == '>') tokens.push(new Token(TokenType.BRACKET, '>'))
            else if (code[p] == '{') tokens.push(new Token(TokenType.BRACKET, '{'))
            else if (code[p] == '}') tokens.push(new Token(TokenType.BRACKET, '}'))
            else if (code[p] == '=') tokens.push(new Token(TokenType.OPERATOR, '='))
            else if (code[p] == '/') tokens.push(new Token(TokenType.OPERATOR, '/'))
            else if (code[p] == '"') tokens.push(new Token(TokenType.OPERATOR, '"'))
            else if (code[p] != ' ' && code[p] != '\n' && code[p] != '\t') {
                let b = p
                while (p < code.length && code[p] != ' ' && code[p] != '\n' && code[p] != '\t' && !'<>{}=/"'.includes(code[p]))
                    ++p
                tokens.push(new Token(TokenType.TEXT, code.substring(b, p)))
                --p
            }
            ++p
        }

        return tokens
    }

    static parse(tokens: [Token]) {
        var p = 0;
        var statement = expectTagDefinition(tokens, p)
    }
}

function expectToken(tokens: [Token], p: number, type: TokenType, data?: string) {
    return (tokens[p].type == type && (data == undefined || tokens[p].data == data)) ? tokens[p] : null
}

function expectTagDefinition(tokens: [Token], p: number) {
    if (expectToken(tokens, p, TokenType.BRACKET, '<') != null) {
        // tag
        ++p
        const tag = expectToken(tokens, p, TokenType.TEXT)?.data
        console.log(tag)
        ++p
        let temp: any = ''
        while ((temp = expectArgument(tokens, p)) != null) {
            // arg
            console.log(temp)
            p = temp.p
        }
        if (!expectToken(tokens, p, TokenType.BRACKET, '>')) return null
        ++p
        // content
        while ((temp = expectTagDefinition(tokens, p)) != null) {

        }

    } else if (expectToken(tokens, p, TokenType.TEXT) != null) {
        let str = expectToken(tokens, p, TokenType.TEXT)?.data + ' '
        ++p
        while (expectToken(tokens, p, TokenType.TEXT) != null) {
            str += (expectToken(tokens, p, TokenType.TEXT)?.data || '') + ' '
            ++p
        }
        console.log(str.trim())
    }
}

function expectArgument(tokens: [Token], p: number): null | { p: number, n: string, c: string } {
    const arg = expectToken(tokens, p, TokenType.TEXT)
    ++p
    if (arg == null) return null
    if (expectToken(tokens, p, TokenType.OPERATOR, '=') == null) return null
    ++p
    // Normal option
    if (expectToken(tokens, p, TokenType.OPERATOR, '"') == null) {
        // TODO: JS OPTION
        return null
    }
    ++p
    var data = ''
    let temp: any = ''
    while ((temp = expectToken(tokens, p, TokenType.TEXT)) != null) {
        data += temp.data
        ++p
    }
    if (expectToken(tokens, p, TokenType.OPERATOR, '"') == null) return null
    ++p
    return { p: p, n: arg.data, c: data }
}