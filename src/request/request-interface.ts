export interface IRequest {
  get(key: string): any // retrieve request input
  header(key: string): string // retrieve request header
  add(key: string, value: any): void // add request data
}
