import {
  Controller,
  HttpMethods,
  Middleware,
  MindlessRoute,
  Request,
  Response,
  Router,
  RouteUrl
} from '../../src/mindless'

import * as TypeMoq from 'typemoq'
import { GenericConstructor } from '../../src/interfaces'

class TestController extends Controller {
  test(): Response {
    return new Response(200)
  }

  // Note: Request parameter
  testWithRequestParam(request: Request) {
    return new Response(200, { resource: request.path })
  }

  testWithPathParam(val: string): Response {
    return new Response(200, { val: val })
  }

  testWithRequestAndPathParam(request: Request, val: string) {
    const res = {
      resource: request.path,
      val: val
    }
    return new Response(200, res)
  }
}

describe('Router getRequestRoute returns the correct route and parameters', () => {
  let requestMock = TypeMoq.Mock.ofType<Request>()

  beforeEach(() => {
    requestMock.reset()
  })

  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.POST,
      controller: TestController,
      middleware: [],
      function: 'test'
    },
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.PUT,
      controller: TestController,
      middleware: [],
      function: 'testWithPathParam'
    }
  ]

  const router = new Router<Middleware, Controller, MindlessRoute>(routes)

  test('Throws error when route group undefined (method mismatch)', () => {
    requestMock.setup(c => c.path).returns(() => '/test')
    requestMock.setup(c => c.method).returns(() => HttpMethods.GET)

    expect(() => {
      router.getRouteData(requestMock.object)
    }).toThrow('Could not find requested route.')
  })

  test('Throws error when route group undefined (path mismatch)', () => {
    requestMock.setup(c => c.path).returns(() => '/blah')
    requestMock.setup(c => c.method).returns(() => HttpMethods.POST)

    expect(() => {
      router.getRouteData(requestMock.object)
    }).toThrow('Could not find requested route.')
  })

  test('Finds the correct route and returns the route object and no parameters', () => {
    const expectedRouteMetadata = {
      url: routes[0].url,
      method: routes[0].method,
      function: routes[0].function
    }

    requestMock
      .setup(c => c.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.once())
    requestMock
      .setup(c => c.method)
      .returns(() => HttpMethods.POST)
      .verifiable(TypeMoq.Times.once())
    requestMock
      .setup(r => (r.RouteMetaData = TypeMoq.It.isValue(expectedRouteMetadata)))
      .verifiable(TypeMoq.Times.once())

    const data = router.getRouteData(requestMock.object)

    expect(data.route).toEqual(routes[0])
    expect(data.params.length).toEqual(0)

    requestMock.verifyAll()
  })

  test('Finds the correct route and returns the route object with parameters', () => {
    requestMock.setup(c => c.path).returns(() => '/test')
    requestMock.setup(c => c.method).returns(() => HttpMethods.PUT)

    const data = router.getRouteData(requestMock.object)

    expect(data.route).toEqual(routes[1])
    expect(data.params.length).toEqual(1)
    expect(data.params[0]).toEqual('val')
  })

  test('get routes', () => {
    expect(router.routes).toHaveLength(2)
    expect(router.routes).toEqual(routes)
  })
})

describe('Router add all path parameters to the request', () => {
  let requestMock = TypeMoq.Mock.ofType<Request>()

  beforeEach(() => {
    requestMock.reset()
  })

  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test/:id/:name'),
      method: HttpMethods.POST,
      controller: TestController,
      middleware: [],
      function: 'test'
    }
  ]

  const router = new Router<Middleware, Controller, MindlessRoute>(routes)

  test('Finds the correct route and returns the route object with parameters', () => {
    requestMock.setup(c => c.path).returns(() => '/test/123/abc')
    requestMock.setup(c => c.method).returns(() => HttpMethods.POST)

    const data = router.getRouteData(requestMock.object)
    const expectedParams = {
      id: '123',
      name: 'abc'
    }

    requestMock.verify(
      r => r.addMultiple(TypeMoq.It.isObjectWith(expectedParams)),
      TypeMoq.Times.once()
    )

    expect(data.route).toEqual(routes[0])
  })
})

describe('Route function value is not a method name of the controller', () => {
  let requestMock = TypeMoq.Mock.ofType<Request>()

  beforeEach(() => {
    requestMock.reset()
  })

  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: TestController,
      middleware: [],
      function: 'blah'
    }
  ]

  const router = new Router<Middleware, Controller, MindlessRoute>(routes)

  test('throws correct error', () => {
    requestMock.setup(c => c.path).returns(() => '/test')
    requestMock.setup(c => c.method).returns(() => HttpMethods.GET)

    expect(() => router.getRouteData(requestMock.object)).toThrow(
      "'blah' is not a method on the controller 'TestController'"
    )
  })
})

describe('Cannot parse function', () => {
  let requestMock = TypeMoq.Mock.ofType<Request>()

  beforeEach(() => {
    requestMock.reset()
  })

  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: TestController,
      middleware: [],
      function: '__proto__' // only way I could test invalid function
    }
  ]

  const router = new Router<Middleware, Controller, MindlessRoute>(routes)

  test('throws correct error', () => {
    requestMock
      .setup(r => r.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.method)
      .returns(() => HttpMethods.GET)
      .verifiable(TypeMoq.Times.once())

    expect(() => router.getRouteData(requestMock.object)).toThrow(
      'Route has invalid function'
    )

    requestMock.verifyAll()
  })
})

describe('methodParameterCache works', () => {
  const requestMock = TypeMoq.Mock.ofType<Request>()
  const functionMock = TypeMoq.Mock.ofType<() => number>()

  class MyController extends Controller {
    test() {
      return 1
    }
  }

  MyController.prototype.test = functionMock.object

  beforeEach(() => {
    requestMock.reset()
    functionMock.reset()
  })

  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: MyController,
      middleware: [],
      function: 'test'
    }
  ]
  const router = new Router<Middleware, Controller, MindlessRoute>(routes)

  test('will not parse function if already parsed', () => {
    requestMock
      .setup(r => r.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.exactly(2))

    requestMock
      .setup(r => r.method)
      .returns(() => HttpMethods.GET)
      .verifiable(TypeMoq.Times.exactly(2))

    functionMock
      .setup(f => f.toString())
      .returns(() => '()')
      .verifiable(TypeMoq.Times.once())

    const data1 = router.getRouteData(requestMock.object)
    const data2 = router.getRouteData(requestMock.object)

    expect(data1.route).toEqual(routes[0])
    expect(data1).toEqual(data2)

    requestMock.verifyAll()
    functionMock.verifyAll()
  })
})
