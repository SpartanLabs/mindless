import { HttpMethods } from './http-methods'

export interface RequestEvent<TBody = { [key: string]: any }> {
  body: TBody
  queryStringParameters: { [key: string]: string | string[] }
  headers: { [key: string]: string | string[] }

  path: string
  method: HttpMethods
}
