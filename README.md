# gen-sql-type

Generate Typescript Types from raw SQL statements

[![npm Package Version](https://img.shields.io/npm/v/gen-sql-type.svg?maxAge=3600)](https://www.npmjs.com/package/gen-sql-type)

Project Status: **Building Initial Prototype**

## Progress

- [x] Extract types from sql statement
  - [x] Support alias column name
  - [x] Support function call (e.g. `COUNT(*)`)
  - [x] Support quoted column name with escape sequence (e.g. treat `'can''t'` as `"can't"`)
  - [x] Support named parameters (e.g. `:id` and `@username`)
  - [x] Support `SELECT`, `UPDATE`, and `DELETE` statement
- [x] Generate Typescript type for:
  - [x] Row of select result
  - [x] Named parameters for prepared statement

## License

This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
