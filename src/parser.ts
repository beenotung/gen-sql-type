import { AST } from './ast'
import { Token, tokenize } from './tokenizer'

export function transformQuotes(tokens: Token[]): Token[] {
  tokens = transformQuote(tokens, "'")
  tokens = transformQuote(tokens, '"')
  tokens = transformQuote(tokens, '`')
  return tokens
}

// TODO handle escape sequence
function transformQuote(tokens: Token[], quote: string): Token[] {
  const result: Token[] = []
  let acc = ''
  let isInsideQuote = false
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'char' && token.value === quote) {
      if (i + 1 < tokens.length && quote === "'") {
        const next = tokens[i + 1]
        if (next.type === 'char' && next.value === quote) {
          acc += "'"
          i++
          continue
        }
      }
      if (isInsideQuote) {
        result.push({ type: 'word', value: acc })
      }
      isInsideQuote = !isInsideQuote
      acc = ''
      continue
    }
    if (isInsideQuote) {
      acc += token.value
    } else {
      result.push(token)
    }
  }
  return result
}

export function transformColumnWithTableName(tokens: Token[]): Token[] {
  const result: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'char' && token.value === '.') {
      // replace table name by column name
      result.pop()
      i++
      const column = tokens[i]
      result.push(column)
      continue
    }
    result.push(token)
  }
  return result
}

export function transformFunctionCall(tokens: Token[]): Token[] {
  const result: Token[] = []
  let level = 0
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    // concat function call expression
    if (token.type === 'char' && token.value === '(') {
      level++
      let acc = ''
      acc += result.pop()!.value // function nme
      acc += token.value // '('
      i++
      for (; i < tokens.length; i++) {
        token = tokens[i]
        acc += token.value
        if (token.type === 'char') {
          if (token.value === '(') {
            level++
          } else if (token.value === ')') {
            level--
            if (level === 0) {
              i++
              break
            }
          }
        }
      }
      result.push({ type: 'word', value: acc })
      continue
    }
    result.push(token)
  }
  return result
}

export function parseSql(sql: string) {
  let tokens = tokenize(sql)
  tokens = transformQuotes(tokens)
  tokens = transformColumnWithTableName(tokens)
  tokens = transformFunctionCall(tokens)
  tokens = tokens.filter(token => token.type !== 'whitespace')
  console.log({ tokens })
  const asts: AST[] = []
  let offset: number
  let token: Token
  for (offset = 0; offset < tokens.length; nextToken()) {
    token = tokens[offset]
    if (token.type === 'word') {
      if (token.value.toLowerCase() === 'select') {
        parseSelect()
        continue
      }
    }
    unknownToken('parseSql')
  }

  function parseSelect() {
    nextToken()
    const columns: string[] = []
    let isExpectComma = false
    for (; offset < tokens.length; nextToken()) {
      if (token.type === 'word') {
        if (token.value.toLowerCase() === 'from') {
          break
        }
        if (token.value.toLowerCase() === 'as') {
          // replace column expression by alias with 'AS'
          columns.pop()
          nextToken()
          isExpectComma = false
        }
        if (isExpectComma) {
          // replace column express by alias without 'AS'
          columns.pop()
        }
        columns.push(token.value)
        isExpectComma = true
        continue
      }
      if (token.type === 'char' && token.value === ',') {
        isExpectComma = false
        continue
      }
      unknownToken('parseSelect')
    }
    asts.push({ type: 'select', columns })
    for (; offset < tokens.length; nextToken()) {
      if (token.type === 'char' && token.value === ';') {
        break
      }
      // skip select body
    }
  }

  function nextToken() {
    offset++
    token = tokens[offset]
  }

  function unknownToken(context: string) {
    console.error('[TODO] unknown token:', { context, offset, token })
    process.exit(1)
  }

  return asts
}
