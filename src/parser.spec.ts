import { expect } from 'chai'
import { parseSql, transformQuotes } from './parser'
import { Select } from './ast'
import { tokenize } from './tokenizer'

describe('parser', () => {
  context('transformQuotes', () => {
    it('should parse term with single quote', function () {
      let tokens = tokenize("select id as 'user id' from user")
      tokens = transformQuotes(tokens)
      tokens = tokens.filter(token => token.type !== 'whitespace')
      expect(tokens).deep.equals([
        { type: 'word', value: 'select' },
        { type: 'word', value: 'id' },
        { type: 'word', value: 'as' },
        { type: 'word', value: 'user id' },
        { type: 'word', value: 'from' },
        { type: 'word', value: 'user' },
      ])
    })
  })

  context('select expression', () => {
    it('should parse column names in basic expression', () => {
      let asts = parseSql('select id,username from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['id', 'username'])
    })

    it('should parse column names with alias', function () {
      let asts = parseSql("select id as 'user id' from user")
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      expect((asts[0] as Select).columns).to.deep.equals(['user id'])
    })

    it('should parse column with table name', function () {
      let asts = parseSql('select user.id from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['id'])
    })

    it('should parse column with table name and alias', function () {
      let asts = parseSql('select user.id as user_id from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['user_id'])
    })

    it('should parse column with function call', function () {
      let asts = parseSql('select id, max(salary) as max_salary from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['id', 'max_salary'])
    })

    it('should parse function call with wildcard', function () {
      let asts = parseSql('select count(*) as count from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['count'])
    })

    it('should parse multiple select statement', function () {
      let asts = parseSql('select id from user;select username from user')
      expect(asts).to.have.lengthOf(2)
      expect(asts[0].type).to.equals('select')
      expect((asts[0] as Select).columns).to.deep.equals(['id'])
      expect(asts[1].type).to.equals('select')
      expect((asts[1] as Select).columns).to.deep.equals(['username'])
    })
  })
})
