import { GenericConstructor } from '../interfaces'
import { RequestEvent } from '../request/request'
import { Response } from '../response'

export interface IApp {
  resolve<T>(constructor: GenericConstructor<T>): T
  handleRequest(request: RequestEvent): Promise<Response>
}
