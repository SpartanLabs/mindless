import { Request } from '../request'
import { MiddlewareHandle } from './middleware-handle'

export abstract class Middleware {
  abstract handle(request: Request, next: MiddlewareHandle): Promise<undefined>
}
