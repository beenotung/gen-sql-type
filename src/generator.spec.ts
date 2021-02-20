import { expect } from 'chai'
import { Select } from './ast'
import { generateType } from './generator'
import { parseSql } from './parser'

describe('generator', function () {
  it('should generate type of column data', function () {
    let asts = parseSql('select id,username from user')
    expect(asts).to.have.lengthOf(1)
    let select = asts[0] as Select
    expect(select.type).to.equals('select')
    let type = generateType(select)
    expect(type).to.equals(`{id,username}`)
  })

  it('should quote column name when it contains space', function () {
    let asts = parseSql("select id,username as 'user name' from user")
    expect(asts).to.have.lengthOf(1)
    let select = asts[0] as Select
    expect(select.type).to.equals('select')
    let type = generateType(select)
    expect(type).to.equals(`{id,"user name"}`)
  })

  it('should quote column name when it contains symbol', function () {
    let asts = parseSql("select id,username as 'user-name' from user")
    expect(asts).to.have.lengthOf(1)
    let select = asts[0] as Select
    expect(select.type).to.equals('select')
    let type = generateType(select)
    expect(type).to.equals(`{id,"user-name"}`)
  })
})
