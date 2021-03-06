export type AST = Select | Delete | Update | Insert
export type Select = {
  type: 'select'
  columns: string[]
  parameters: string[]
}
export type Delete = {
  type: 'delete'
  parameters: string[]
}
export type Update = {
  type: 'update'
  parameters: string[]
}
export type Insert = {
  type: 'insert'
  parameters: string[]
}
