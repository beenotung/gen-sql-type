import { expect } from 'chai'
import { Select } from './ast'
import { generateTypes, toObjectType } from './generator'

describe('generator', function () {
  context('toObjectType', function () {
    it('should generate object type', function () {
      expect(toObjectType(['id', 'username'])).to.equals(`{ id, username }`)
    })

    it('should quote object field when it contains space', function () {
      expect(toObjectType(['id', 'user name'])).to.equals(`{ id, "user name" }`)
    })

    it('should quote object field when it contains symbol', function () {
      expect(toObjectType(['id', 'user-name'])).to.equals(`{ id, "user-name" }`)
    })
  })

  context('generateTypes', function () {
    it('should generate typescript code', function () {
      let select: Select = {
        type: 'select',
        columns: ['username'],
        parameters: ['id'],
      }
      let code = generateTypes('User', select)
      expect(code).to.contains(`export type UserRow = { username }`)
      expect(code).to.contains(`export type UserParameters = { id }`)
    })
  })
})
