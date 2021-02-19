import { AST } from './ast'
import { Token, tokenize } from './tokenizer'

export function transformQuotes(tokens: Token[]): Token[] {
  const result: Token[] = []
  let acc = ''
  let isInsideQuote = false
  for (const token of tokens) {
    if (token.type === 'char' && token.value === "'") {
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

export function parseSql(sql: string) {
  let tokens = tokenize(sql)
  tokens = transformQuotes(tokens)
  tokens = tokens.filter(token => token.type !== 'whitespace')
  console.log({ tokens })
  const asts: AST[] = []
  let offset: number
  let token: Token
  for (offset = 0; offset < tokens.length; nextToken()) {
    token = tokens[offset]
    if (token.type === 'word') {
      if (token.value === 'select') {
        parseSelect()
        continue
      }
    }
    unknownToken('parseSql')
  }

  function parseSelect() {
    nextToken()
    const columns: string[] = []
    for (; offset < tokens.length; nextToken()) {
      if (token.type === 'word') {
        if (token.value === 'from') {
          break
        }
        columns.push(token.value)
        continue
      }
      if (token.type === 'char' && token.value === ',') {
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

  // function prevToken() {
  //   offset--
  //   token = tokens[offset]
  // }

  function unknownToken(context: string) {
    console.error('[TODO] unknown token:', { context, offset, token })
    process.exit(1)
  }

  return asts
}
