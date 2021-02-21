export type AST = Select | Delete | Update
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
