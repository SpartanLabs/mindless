import { MiddlewareHandle } from '../../src/middleware/middleware-handle'
import { Request } from '../../src/mindless'
import { MiddlewareMock } from './middleware.mock'

export class ActionMiddlewareMock extends MiddlewareMock {
  constructor(protected action: (r: Request) => void) {
    super()
  }

  handle(request: Request, next: MiddlewareHandle): Promise<undefined> {
    this.action(request)
    return super.handle(request, next)
  }
}
