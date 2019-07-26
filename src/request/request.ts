import { MindlessError } from '../error/mindless.error'
import { RouteMetadata } from '../routing/IRouter'
import { HttpMethods } from './http-methods'

export class Request<TBody = { [key: string]: any }> {
  protected _pathParam: ReadonlyMap<string, string>
  protected _queryParam: ReadonlyMap<string, string | string[]>
  protected _header: ReadonlyMap<string, string | string[]>
  protected _context = new Map<string, any>()
  protected _routeMetadata: Readonly<RouteMetadata>
  protected _method: Readonly<HttpMethods>

  constructor(
    protected _path: Readonly<string>,
    protected _body: Readonly<TBody>,
    routeMetadata: RouteMetadata,
    pathParameters: ReadonlyMap<string, string> = new Map(), // { [keys: string]: string } = {},
    queryStringParameters: ReadonlyMap<string, string | string[]> = new Map(), // { [key: string]: string | string[] } = {},
    headers: ReadonlyMap<string, string | string[]> = new Map() // { [key: string]: string | string[] } = {}
  ) {
    this._method = routeMetadata.method
    this._pathParam = pathParameters
    this._queryParam = queryStringParameters
    this._header = headers
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

  public getPathParameter(key: string): string | undefined {
    return this._pathParam.get(key)
  }

  public getPathParameterOrFail(key: string): string {
    if (this._pathParam.has(key)) {
      return this._pathParam.get(key)!
    }

    throw new MindlessError(`Invalid key: '${key}', key not found in path parameters`)
  }

  public getQueryStringParameter(key: string): string | string[] | undefined {
    return this._queryParam.get(key)
  }

  public getQueryStringParameterOrFail(key: string): string | string[] {
    if (this._queryParam.has(key)) {
      return this._queryParam.get(key)!
    }

    throw new MindlessError(`Invalid key: '${key}', key not found in query string parameters`)
  }

  public getHeader(key: string): string | string[] | undefined {
    return this._header.get(key)
  }

  public getHeaderOrFail(key: string): string | string[] {
    if (this._header.has(key)) {
      return this._header.get(key)!
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
