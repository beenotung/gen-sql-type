import { expect } from 'chai'
import { Delete, Select, Update } from './ast'
import { generateTypes, toObjectType } from './generator'

describe('generator', function () {
  context('toObjectType', function () {
    it('should generate object type', function () {
      let type = toObjectType(['id', 'username'])
      expect(type).to.contains('id')
      expect(type).to.contains('username')
    })

    it('should quote object field when it contains space', function () {
      let type = toObjectType(['id', 'user name'])
      expect(type).to.contains('id')
      expect(type).to.contains('"user name"')
    })

    it('should quote object field when it contains symbol', function () {
      let type = toObjectType(['id', 'user-name'])
      expect(type).to.contains('id')
      expect(type).to.contains('"user-name"')
    })
  })

  context('generateTypes', function () {
    it('should generate typescript code from select statement', function () {
      let ast: Select = {
        type: 'select',
        columns: ['username'],
        parameters: ['id'],
      }
      let code = generateTypes('User', ast)
      expect(code).to.contains(`export type UserRow = {\n  username: any,\n}`)
      expect(code).to.contains(`export type UserParameters = {\n  id: any,\n}`)
    })
    it('should generate typescript code from update statement', function () {
      let ast: Update = {
        type: 'update',
        parameters: ['id'],
      }
      let code = generateTypes('User', ast)
      expect(code).to.contains(`export type UserParameters = {\n  id: any,\n}`)
    })
    it('should generate typescript code from delete statement', function () {
      let ast: Delete = {
        type: 'delete',
        parameters: ['id'],
      }
      let code = generateTypes('User', ast)
      expect(code).to.contains(`export type UserParameters = {\n  id: any,\n}`)
    })
  })
})
