# gen-sql-type

Generate Typescript Types from raw SQL statements

[![npm Package Version](https://img.shields.io/npm/v/gen-sql-type.svg?maxAge=3600)](https://www.npmjs.com/package/gen-sql-type)

## How it works

This library scan the plain sql statements then auto generate Typescript types of the result row and named parameters.
(Also supports prepared statement)

## Features

- [x] Extract types from sql statement
  - [x] Support alias column name
  - [x] Support function call (e.g. `COUNT(*)`)
  - [x] Support quoted column name with escape sequence (e.g. treat `'can''t'` as `"can't"`)
  - [x] Support named parameters (e.g. `:id` and `@username`)
  - [x] Support `INSERT`, `SELECT`, `UPDATE`, and `DELETE` statement
- [x] Generate Typescript type for:
  - [x] Row of select result
  - [x] Named parameters for prepared statement

## Usage Example

Given *user-service.ts*:
```typescript
const sqlTypeFile = SqlTypeFile.withPrefix(__filename)

export class UserService {
  async login(parameters: LoginUserParameters): Promise<LoginUserRow> {
    const sql: string = sqlTypeFile.wrapSql('LoginUser', 'select password_hash from user where id = :id')
    return mockExec(sql, parameters)[0]
  }

  async logout(parameters: LogoutUserParameters) {
    const sql: string = sqlTypeFile.wrapSql('LogoutUser', 'update session set active = false where token = :token')
    return mockExec(sql, parameters)
  }
}
```

Upon execution, it will auto generate *user-service.types.ts*:
```typescript
export type LoginUserParameters = {
  id: any
}
export type LoginUserRow = {
  password_hash: any
}

export type LogoutUserParameters = {
  token: any
}
```

Complete example refers to [./examples/user-service.ts](./examples/user-service.ts)

## License

This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
