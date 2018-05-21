import { Event, HttpMethods } from './event'
import { IRequest } from './request-interface'

export class Request implements IRequest {
  public RouteMetaData: { [key: string]: any } = {}
  protected _body: { [key: string]: any }
  protected data: { [key: string]: any } = {}

  constructor(protected event: Event) {
    if (event.body === '' || event.body == null) {
      this._body = {}
    } else {
      this._body = JSON.parse(event.body)
    }
    if (this.event.pathParameters == null) {
      this.event.pathParameters = {}
    }
    if (this.event.queryStringParameters == null) {
      this.event.queryStringParameters = {}
    }
    if (this.event.headers == null) {
      this.event.headers = {}
    }
  }

  get path(): string {
    return this.event.path
  }

  get method(): HttpMethods {
    return (HttpMethods as any)[this.event.httpMethod.toUpperCase()]
  }

  public getOrFail(key: string): any {
    const value = this.get(key)
    if (value) {
      return value
    }

    throw Error(
      `Invalid key: '${key}', key not found in pathParameters, queryStringParameters, or Body parameters.`
    )
  }

  public get(key: string): any {
    if (typeof this.data[key] !== 'undefined') {
      return this.data[key]
    }
    if (typeof this._body[key] !== 'undefined') {
      return this._body[key]
    }
    if (typeof this.event.queryStringParameters[key] !== 'undefined') {
      return this.event.queryStringParameters[key]
    }

    return undefined
  }

  public header(key: string): string {
    if (typeof this.event.headers[key] !== 'undefined') {
      return this.event.headers[key]
    }

    throw Error(`Invalid key: '${key}', key not found in headers`)
  }

  public add(key: string, val: any, overwrite: boolean = false): void {
    if (overwrite || typeof this.data[key] === 'undefined') {
      this.data[key] = val
      return
    }

    throw Error(
      `The key '${key}' already exists, pass 'overwrite=true' or use a different key.`
    )
  }

  public addMultiple(data: { [key: string]: any }) {
    Object.keys(data).forEach(key => this.add(key, data[key]))
  }
}
