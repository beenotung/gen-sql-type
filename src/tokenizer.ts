import { isBetween } from '@beenotung/tslib/compare'

export type Token = Word | Whitespace | Char
export type Word = {
  type: 'word'
  value: string
}
export type Whitespace = {
  type: 'whitespace'
  value: string
}
export type Char = {
  type: 'char'
  value: string
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
      tokens.push({ type: 'word', value: acc })
      acc = ''
      i--
      continue
    }
    if (isWhitespace(char)) {
      tokens.push({ type: 'whitespace', value: char })
      continue
    }
    tokens.push({ type: 'char', value: char })
  }
  return tokens
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
