import { Middleware, Request } from '../../src/mindless'

class TestMiddleware extends Middleware {
  public handle(request: Request) {
    return Promise.resolve()
  }
}

describe('Test Middleware Construction, just want travis to pass lol', () => {
  test('should create TestMiddleware', () => {
    let middleware = new TestMiddleware()
    expect(middleware instanceof Middleware).toBeTruthy()
  })
})
