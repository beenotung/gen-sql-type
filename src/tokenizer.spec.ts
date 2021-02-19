import { expect } from 'chai'
import { tokenize } from './tokenizer'

describe('tokenizer', () => {
  context('select expression', () => {
    it('should tokenize basic expression', function () {
      let tokens = tokenize('select id,username from user')
      tokens = tokens.filter(token => token.type !== 'whitespace')
      expect(tokens).deep.equals([
        { type: 'word', value: 'select' },
        { type: 'word', value: 'id' },
        { type: 'char', value: ',' },
        { type: 'word', value: 'username' },
        { type: 'word', value: 'from' },
        { type: 'word', value: 'user' },
      ])
    })
  })
})
