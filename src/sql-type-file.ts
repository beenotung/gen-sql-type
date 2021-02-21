import { writeFileSync } from 'fs'
import * as path from 'path'
import { config } from './config'
import { generateTypes } from './generator'
import { parseSql } from './parser'

export class SqlTypeFile {
  code = ''

  constructor(public file: string) {}

  wrapSql(name: string, sql: string): string {
    if (!this.file.endsWith('.ts')) {
      // only do code generation when the consumer is .ts file (e.g. when invoke from ts-node)
      return sql
    }
    const asts = parseSql(sql)
    const code = asts
      .map(ast => generateTypes(name, ast))
      .filter(s => s.trim())
      .join('\n')
      .trim()
    if (code) {
      if (this.code) {
        this.code += '\n'
      }
      this.code += code
      writeFileSync(this.file, this.code + '\n')
      if (config.verbose) {
        console.log('generated', this.file)
      }
    }
    return sql
  }

  static withPrefix(file: string, prefix = '-type') {
    const base = path.basename(file)
    const dir = removeLast(file, base)
    const ext = path.extname(base)
    const name = removeLast(base, ext)
    const destFile = dir + name + prefix + ext
    return new SqlTypeFile(destFile)
  }
}

function removeLast(str: string, pattern: string) {
  const idx = str.lastIndexOf(pattern)
  return str.slice(0, idx)
}

SqlTypeFile.withPrefix(__filename)
