import { expect } from 'chai'
import { parseSql, transformQuotes } from './parser'
import { Select, Update } from './ast'
import { tokenize } from './tokenizer'

describe('parser', () => {
  context('transformQuotes', () => {
    function test(name: string, quote: string) {
      it('should parse term with ' + name, function () {
        let tokens = tokenize(`select id as ${quote}user id${quote} from user`)
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
    }

    test('single quote', "'")
    test('double quote', '"')
    test('back quote', '`')

    it('should parse quoted term with escape sequence', function () {
      let tokens = tokenize(`'I mustn''t sin!'`)
      tokens = transformQuotes(tokens)
      expect(tokens).deep.equals([{ type: 'word', value: "I mustn't sin!" }])
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

    it('should parse terms when keywords are in upper case', function () {
      let asts = parseSql('SELECT id,username FROM USER')
      expect(asts).to.have.lengthOf(1)
      expect(asts[0].type).to.equals('select')
      let select = asts[0] as Select
      expect(select.columns).to.deep.equals(['id', 'username'])
    })

    context('column alias', () => {
      it("should parse column alias with 'AS'", function () {
        let asts = parseSql("select id as 'user id' from user")
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        expect((asts[0] as Select).columns).to.deep.equals(['user id'])
      })
      it("should parse column alias without 'AS'", function () {
        let asts = parseSql("select id 'user id' from user")
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        expect((asts[0] as Select).columns).to.deep.equals(['user id'])
      })
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

    context('function call', function () {
      it('should parse function call with wildcard', function () {
        let asts = parseSql('select count(*) as count from user')
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        let select = asts[0] as Select
        expect(select.columns).to.deep.equals(['count'])
      })

      it('should parse nested function call', function () {
        let asts = parseSql(
          'select AVG(ISNULL(DATEDIFF(SECOND, start_time, end_time),0)) as avg_diff from calls',
        )
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        let select = asts[0] as Select
        expect(select.columns).to.deep.equals(['avg_diff'])
      })
    })

    context('distinct column expression', function () {
      it('should parse distinct column', function () {
        let asts = parseSql('select distinct salary from Employee e1')
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        let select = asts[0] as Select
        expect(select.columns).to.deep.equals(['salary'])
      })

      it('should parse distinct column with alias', function () {
        let asts = parseSql('select distinct salary income from Employee e1')
        expect(asts).to.have.lengthOf(1)
        expect(asts[0].type).to.equals('select')
        let select = asts[0] as Select
        expect(select.columns).to.deep.equals(['income'])
      })
    })

    context('named parameters', function () {
      function test(prefix: string) {
        it(`should recognize parameter prefix '${prefix}'`, () => {
          let asts = parseSql(
            `select username from user where id = ${prefix}id`,
          )
          expect(asts).to.have.lengthOf(1)
          expect(asts[0].type).to.equals('select')
          let select = asts[0] as Select
          expect(select.parameters).to.deep.equals(['id'])
        })
      }
      test(':')
      test('@')
    })

    it('should parse multiple select statement', function () {
      let asts = parseSql('select id from user;select username from user')
      expect(asts).to.have.lengthOf(2)
      expect(asts[0].type).to.equals('select')
      expect((asts[0] as Select).columns).to.deep.equals(['id'])
      expect(asts[1].type).to.equals('select')
      expect((asts[1] as Select).columns).to.deep.equals(['username'])
    })

    it('should parse complex query', function () {
      // source of sql: https://www.sqlshack.com/learn-sql-how-to-write-a-complex-select-query/
      let asts = parseSql(`
        SELECT country.country_name_eng,
               SUM(CASE WHEN call.id IS NOT NULL THEN 1 ELSE 0 END)             AS calls,
               AVG(ISNULL(DATEDIFF(SECOND, call.start_time, call.end_time), 0)) AS avg_difference
        FROM country
               LEFT JOIN city ON city.country_id = country.id
               LEFT JOIN customer ON city.id = customer.city_id
               LEFT JOIN call ON call.customer_id = customer.id
        GROUP BY country.id,
                 country.country_name_eng
        HAVING AVG(ISNULL(DATEDIFF(SECOND, call.start_time, call.end_time), 0)) >
               (SELECT AVG(DATEDIFF(SECOND, call.start_time, call.end_time)) FROM call)
        ORDER BY calls DESC, country.id ASC;
      `)
      expect(asts).to.have.lengthOf(1)
      let select = asts[0] as Select
      expect(select.type).to.equals('select')
      expect(select.columns).to.deep.equals([
        'country_name_eng',
        'calls',
        'avg_difference',
      ])
    })
  })

  context('mutate expression', () => {
    it('should parse update express', function () {
      let asts = parseSql('update user set username = :username where id = :id')
      expect(asts).to.be.lengthOf(1)
      let ast = asts[0] as Update
      expect(ast.type).to.equals('update')
      expect(ast.parameters).to.contains('username')
      expect(ast.parameters).to.contains('id')
    })

    it('should parse delete express', function () {
      let asts = parseSql('delete from user where id = :id')
      expect(asts).to.be.lengthOf(1)
      let ast = asts[0] as Update
      expect(ast.type).to.equals('delete')
      expect(ast.parameters).to.contains('id')
    })
  })
})
