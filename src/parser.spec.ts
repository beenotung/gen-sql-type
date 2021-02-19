import { expect } from 'chai'
import { parseSql } from './parser'
import { Select } from './ast'

describe('parser', () => {
  context('select expression', () => {
    it('should parse column names in basic expression', () => {
      let asts = parseSql('select id,username from user')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['id', 'username'])
    })

    it('should parse multiple select statement', function () {
      let asts = parseSql('select id from user;select username from user')
      expect(asts).to.have.lengthOf(2)
      expect(asts[0].type).to.equals('select')
      expect((asts[0] as Select).columns).to.deep.equals(['id'])
      expect(asts[1].type).to.equals('select')
      expect((asts[1] as Select).columns).to.deep.equals(['username'])
    })

    it('should parse column names with alias', function () {
      // TODO
    })
  })
})
