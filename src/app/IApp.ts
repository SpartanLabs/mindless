import { GenericConstructor } from '../interfaces'
import { Response } from '../response'
import { RequestEvent } from '../request'

export interface IApp {
  resolve<T>(constructor: GenericConstructor<T>): T
  handleRequest(request: RequestEvent): Promise<Response>
}
