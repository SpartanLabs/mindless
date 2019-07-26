import { HttpMethods } from './http-methods'

export interface RequestEvent<TBody = { [key: string]: any }> {
  body: TBody
  queryStringParameters: ReadonlyMap<string, string | string[]>
  headers: ReadonlyMap<string, string | string[]>

  path: string
  method: HttpMethods
}
