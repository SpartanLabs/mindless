import { Middleware } from '../../src/middleware/middleware'
import { MiddlewareHandle } from '../../src/middleware/middleware-handle'
import { Request } from '../../src/request'

export class MiddlewareMock extends Middleware {
  numberOfTimesHandleHasBeenCalled = 0
  tag: string = ''

  constructor(protected getTag: () => string = () => '') {
    super()
  }

  handle(request: Request, next: MiddlewareHandle): Promise<undefined> {
    this.numberOfTimesHandleHasBeenCalled++
    this.tag = this.getTag()
    return next()
  }
}
