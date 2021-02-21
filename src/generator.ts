import { AST } from './ast'
import { panic } from './config'
import { isKeyword } from './tokenizer'

export function generateType(ast: AST) {
  if (ast.type === 'select') {
    return `{${ast.columns
      .map(name =>
        name.split('').every(char => isKeyword(char))
          ? name
          : JSON.stringify(name),
      )
      .join(',')}}`
  }
  console.error('[TODO] unknown ast:', ast)
  panic()
  return ''
}
