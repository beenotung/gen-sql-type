import { expect } from 'chai'
import { tokenize } from './tokenizer'

describe('tokenizer', () => {
  context('select expression', () => {
    it('should tokenize basic expression', function () {
      let tokens = tokenize('select id,username from user')
      expect(tokens).deep.equals([
        { type: 'keyword', name: 'select' },
        { type: 'keyword', name: 'id' },
        { type: 'char', name: ',' },
        { type: 'keyword', name: 'username' },
        { type: 'keyword', name: 'from' },
        { type: 'keyword', name: 'user' },
      ])
    })
  })
})
