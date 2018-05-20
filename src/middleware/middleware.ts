import { Request } from '../request'

export abstract class Middleware {
  abstract handle(request: Request): Promise<any>
}
