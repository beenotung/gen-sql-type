import debug from 'debug'
import { AST } from './ast'
import { panic } from './config'
import { Token, tokenize } from './tokenizer'

const log = debug('gen-sql-type:parser')

export function transformQuotes(tokens: Token[]): Token[] {
  tokens = transformQuote(tokens, "'")
  tokens = transformQuote(tokens, '"')
  tokens = transformQuote(tokens, '`')
  return tokens
}

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

export function transformParameters(tokens: Token[]): Token[] {
  tokens = transformParameter(tokens, ':')
  tokens = transformParameter(tokens, '@')
  return tokens
}

function transformParameter(tokens: Token[], prefix: string): Token[] {
  const result: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (
      token.type === 'char' &&
      token.value === prefix &&
      i + 1 < tokens.length &&
      tokens[i + 1].type === 'word'
    ) {
      i++
      result.push({ type: 'parameter', value: tokens[i].value })
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
  tokens = transformParameters(tokens)
  const parameters = scanParameters()
  tokens = transformFunctionCall(tokens)
  tokens = tokens.filter(token => token.type !== 'whitespace')
  log('parseSql() > tokens:', tokens)
  const asts: AST[] = []
  let offset: number
  let token: Token
  for (offset = 0; offset < tokens.length; nextToken()) {
    token = tokens[offset]
    if (token.type === 'word') {
      const type = token.value.toLowerCase()
      switch (type) {
        case 'select':
          parseSelect()
          continue
        case 'with':
          skipWith()
          parseSelect()
          continue
        case 'update':
        case 'delete':
        case 'insert':
          parseMutation(type)
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
    skipBody()
    asts.push({ type: 'select', columns, parameters })
  }

  function parseMutation(type: 'delete' | 'update' | 'insert') {
    nextToken()
    skipBody()
    asts.push({ type, parameters })
  }

  // FIXME scan parameters per SQL statement (currently scan through multiple SQL statements)
  function scanParameters() {
    const parameters: string[] = []
    tokens.forEach(token => {
      if (token.type === 'parameter') {
        parameters.push(token.value)
      }
    })
    return parameters
  }

  function skipBody() {
    for (; offset < tokens.length; nextToken()) {
      if (token.type === 'char' && token.value === ';') {
        break
      }
    }
  }

  function skipWith() {
    for (; token; ) {
      offset++
      token = tokens[offset]
      if (token.type === 'word' && token.value === 'select') {
        break
      }
    }
  }

  function nextToken() {
    offset++
    token = tokens[offset]
  }

  function unknownToken(context: string) {
    console.error('[TODO] [gen-sql-type:parser.ts] unknown token:', {
      context,
      offset,
      token,
    })
    panic()
  }

  return asts
}
