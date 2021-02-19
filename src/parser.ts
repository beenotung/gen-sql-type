import { AST } from './ast'
import { Token, tokenize } from './tokenizer'

export function parseSql(sql: string) {
  const tokens = tokenize(sql)
  console.log({ tokens })
  const asts: AST[] = []
  let offset: number
  let token: Token
  for (offset = 0; offset < tokens.length; nextToken()) {
    token = tokens[offset]
    if (token.type === 'keyword') {
      if (token.name === 'select') {
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
      if (token.type === 'keyword') {
        if (token.name === 'from') {
          break
        }
        columns.push(token.name)
        continue
      }
      if (token.type === 'char' && token.name === ',') {
        continue
      }
      unknownToken('parseSelect')
    }
    asts.push({ type: 'select', columns })
    for (; offset < tokens.length; nextToken()) {
      if (token.type === 'char' && token.name === ';') {
        break
      }
      // skip select body
    }
  }

  function nextToken() {
    offset++
    token = tokens[offset]
  }

  function prevToken() {
    offset--
    token = tokens[offset]
  }

  function unknownToken(context: string) {
    console.error('[TODO] unknown token:', { context, offset, token })
    process.exit(1)
  }

  return asts
}
