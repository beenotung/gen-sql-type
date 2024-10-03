import { AST } from './ast'
import { config } from './config'
import { isKeyword } from './tokenizer'

export function generateTypes(name: string, ast: AST) {
  switch (ast.type) {
    case 'select':
      return (
        `
export type ${name}Parameters = ${toObjectType(ast.parameters)}
export type ${name}Row = ${toObjectType(ast.columns)}
`.trim() + '\n'
      )
    case 'delete':
    case 'update':
    case 'insert':
      return (
        `
export type ${name}Parameters = ${toObjectType(ast.parameters)}
`.trim() + '\n'
      )
  }
  if (config.shouldPanic) {
    console.error('[TODO] [gen-sql-type:generator.ts] unknown ast:', ast)
    process.exit(1)
    return ''
  } else {
    throw new Error('unknown ast: ' + JSON.stringify(ast, null, 2))
  }
}

export function toObjectType(fields: string[]) {
  return (
    '{\n' +
    fields.map(field => `  ${toFieldName(field)}: any,`).join('\n') +
    '\n}'
  )
}

function toFieldName(name: string) {
  return name.split('').every(isKeyword) ? name : JSON.stringify(name)
}
