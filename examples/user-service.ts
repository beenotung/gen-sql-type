import { SqlTypeFile } from '../src/sql-type-file'
import { LoginUserParameters, LoginUserRow } from './user-service-type'

let sqlTypeFile = SqlTypeFile.withPrefix(__filename)

export class UserService {
  async login(parameters: LoginUserParameters): Promise<LoginUserRow> {
    let sql = sqlTypeFile.wrapSql('LoginUser', 'select password_hash from user where id = :id')
    return mockExec(sql, parameters)[0]
  }

  // async logout(parameters: {}) {
  //   let sql = sqlTypeFile.wrapSql('LogoutUser', 'update session set active = false where token = :token')
  //   return mockExec(sql, parameters)
  // }
}

function mockExec(sql: string, parameters: object): any[] {
  return ['mock row']
}


async function test() {
  let userService = new UserService()
  await userService.login({ id: 123 })
  // await userService.logout({ id: 123 })
}

test()
