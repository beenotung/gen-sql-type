# gen-sql-type

Generate Typescript Types from raw SQL statements

[![npm Package Version](https://img.shields.io/npm/v/gen-sql-type.svg?maxAge=3600)](https://www.npmjs.com/package/gen-sql-type)

Project Status: **Building Initial Prototype**

## Progress
- [x] Extra column name from select statement
  - [x] Support alias column name
  - [x] Support function call (e.g. `COUNT(*)`)
  - [x] Support quoted column name with escape sequence
  - [x] Support named parameters (e.g. `:id` and `@username`)
- [ ] Generate Typescript type for:
  - [ ] Row of select result
  - [ ] Named parameters for prepared statement

## License
This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
