import { isBetween } from '@beenotung/tslib/compare'

export type Token = Keyword | Whitespace | Char
export type Keyword = {
  type: 'keyword'
  name: string
}
export type Whitespace = {
  type: 'whitespace'
  char: string
}
export type Char = {
  type: 'char'
  name: string
}

export function tokenize(sql: string) {
  sql += ' '
  const tokens: Token[] = []
  let acc = ''
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    if (isKeyword(char)) {
      acc += char
      continue
    }
    if (acc) {
      tokens.push({ type: 'keyword', name: acc })
      acc = ''
      i--
      continue
    }
    if (isWhitespace(char)) {
      tokens.push({ type: 'whitespace', char })
      continue
    }
    tokens.push({ type: 'char', name: char })
  }
  return tokens.filter(token => token.type !== 'whitespace')
}

function isWhitespace(char: string) {
  return char.trim().length === 0
}

function isKeyword(char: string) {
  return (
    isBetween('a', char, 'z') ||
    isBetween('A', char, 'Z') ||
    isBetween('0', char, '9')
  )
}
