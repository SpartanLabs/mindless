import { MindlessError } from '../error/mindless.error'
import { RouteMetadata } from '../routing/IRouter'
import { HttpMethods } from './http-methods'
import { RequestEvent } from './request-event'

export class Request<TBody = { [key: string]: any }> {
  protected _pathParam: Readonly<{ [key: string]: string }>
  protected _queryParam: Readonly<{ [key: string]: string | string[] }>
  protected _header: Readonly<{ [key: string]: string | string[] }>

  protected _context = new Map<string, any>()

  protected _routeMetadata: Readonly<RouteMetadata>
  protected _method: Readonly<HttpMethods>

  constructor(
    protected _path: Readonly<string>,
    protected _body: Readonly<TBody>,
    routeMetadata: RouteMetadata,
    pathParameters: { [keys: string]: string } = {},
    queryStringParameters: { [key: string]: string | string[] } = {},
    headers: { [key: string]: string | string[] } = {}
  ) {
    this._method = routeMetadata.method
    this._pathParam = Object.freeze(pathParameters)
    this._queryParam = Object.freeze(queryStringParameters)
    this._header = Object.freeze(headers)
    this._routeMetadata = Object.freeze(routeMetadata)
  }

  get path() {
    return this._path
  }
  get method() {
    return this._method
  }

  get body() {
    return this._body
  }
  get routeMetadata() {
    return this._routeMetadata
  }

  public getPathParameter(key: string) {
    return this._pathParam[key]
  }

  public getPathParameterOrFail(key: string) {
    const value = this.getPathParameter(key)

    if (value !== undefined) {
      return value
    }

    throw new MindlessError(`Invalid key: '${key}', key not found in path parameters`)
  }

  public getQueryStringParameter(key: string) {
    return this._queryParam[key]
  }

  public getQueryStringParameterOrFail(key: string) {
    const value = this.getQueryStringParameter(key)

    if (value !== undefined) {
      return value
    }

    throw new MindlessError(`Invalid key: '${key}', key not found in query string parameters`)
  }

  public getHeader(key: string) {
    return this._header[key]
  }

  public getHeaderOrFaile(key: string) {
    const value = this.getHeader(key)

    if (value !== undefined) {
      return value
    }

    throw new MindlessError(`Invalid key: '${key}', key not found in headers`)
  }

  public addContext<TValue>(key: string, value: TValue) {
    this._context.set(key, value)
  }

  public getContext<TValue>(key: string): TValue {
    return this._context.get(key)
  }
}
