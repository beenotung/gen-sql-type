import { config } from '../src/config'
import { generateTypes } from '../src/generator'
import { parseSql } from '../src/parser'

declare var sql: HTMLTextAreaElement
declare var ts: HTMLTextAreaElement

config.shouldPanic = false

sql.oninput = check

function check() {
  try {
    let [ast] = parseSql(sql.value)
    ts.value = ast ? generateTypes('', ast) : ''
  } catch (error) {
    ts.value = String(error).replace(/\n/g, '\r\n')
  }
}

check()
