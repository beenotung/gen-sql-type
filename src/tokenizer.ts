import { isBetween } from '@beenotung/tslib/compare'

export type Token = Word | Whitespace | Char | Parameter
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
export type Parameter = {
  type: 'parameter'
  value: string
}

export function tokenize(sql: string) {
  // add extra whitespace to avoid need of cleanup after for-loop
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
  // remove extra whitespace
  tokens.pop()
  return tokens
}

function isWhitespace(char: string) {
  return char.trim().length === 0
}

export function isKeyword(char: string) {
  return (
    char === '_' ||
    isBetween('0', char, '9') ||
    isBetween('a', char, 'z') ||
    isBetween('A', char, 'Z')
  )
}
