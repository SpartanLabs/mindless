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
import { RequestEvent } from '../../src/request'

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
const eventMock = TypeMoq.Mock.ofType<RequestEvent>()

beforeEach(() => {
  eventMock.reset()
})
afterEach(() => {
  eventMock.verifyAll()
})

describe('Router getRequestRoute returns the correct route and parameters', () => {
  const routes: MindlessRoute[] = [
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

  const router = new Router(routes)

  test('Throws error when route group undefined (method mismatch)', () => {
    eventMock.setup(ev => ev.path).returns(() => '/test')
    eventMock.setup(ev => ev.method).returns(() => HttpMethods.GET)

    expect(() => {
      router.getRouteData(eventMock.object)
    }).toThrow('Could not find requested route.')
  })

  test('Throws error when route group undefined (path mismatch)', () => {
    eventMock.setup(ev => ev.path).returns(() => '/blah')
    eventMock.setup(ev => ev.method).returns(() => HttpMethods.POST)

    expect(() => {
      router.getRouteData(eventMock.object)
    }).toThrow('Could not find requested route.')
  })

  test('Finds the correct route and returns the route object and no parameters', () => {
    const expectedRouteMetadata = {
      url: routes[0].url,
      method: routes[0].method,
      function: routes[0].function
    }

    eventMock
      .setup(ev => ev.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.once())
    eventMock
      .setup(ev => ev.method)
      .returns(() => HttpMethods.POST)
      .verifiable(TypeMoq.Times.once())

    const data = router.getRouteData(eventMock.object)

    expect(data.route).toEqual(routes[0])
    expect(data.methodParameters).toHaveLength(0)
    expect(data.pathParameters).toEqual({})
    expect(data.metadata.url).toEqual(expectedRouteMetadata.url)
    expect(data.metadata.method).toEqual(expectedRouteMetadata.method)
    expect(data.metadata.function).toEqual(expectedRouteMetadata.function)
  })

  test('Finds the correct route and returns the route object with parameters', () => {
    const expectedRouteMetadata = {
      url: routes[1].url,
      method: routes[1].method,
      function: routes[1].function
    }

    eventMock.setup(ev => ev.path).returns(() => '/test')
    eventMock.setup(ev => ev.method).returns(() => HttpMethods.PUT)

    const data = router.getRouteData(eventMock.object)

    expect(data.route).toEqual(routes[1])
    expect(data.methodParameters).toHaveLength(1)
    expect(data.methodParameters[0]).toEqual('val')
    expect(data.pathParameters).toEqual({})
    expect(data.metadata.url).toEqual(expectedRouteMetadata.url)
    expect(data.metadata.method).toEqual(expectedRouteMetadata.method)
    expect(data.metadata.function).toEqual(expectedRouteMetadata.function)
  })

  test('get routes', () => {
    expect(router.routes).toHaveLength(2)
    expect(router.routes).toEqual(routes)
  })
})

describe('Router add all path parameters to the request', () => {
  const routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test/:id/:name'),
      method: HttpMethods.POST,
      controller: TestController,
      middleware: [],
      function: 'test'
    }
  ]

  const router = new Router(routes)

  test('Finds the correct route and returns the route object with parameters', () => {
    eventMock.setup(ev => ev.path).returns(() => '/test/123/abc')
    eventMock.setup(ev => ev.method).returns(() => HttpMethods.POST)

    const data = router.getRouteData(eventMock.object)
    const expectedParams = {
      id: '123',
      name: 'abc'
    }

    expect(data.route).toEqual(routes[0])
    expect(data.pathParameters).toEqual(expectedParams)
  })
})

describe('Route function value is not a method name of the controller', () => {
  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: TestController,
      middleware: [],
      function: 'blah'
    }
  ]

  const router = new Router(routes)

  test('throws correct error', () => {
    eventMock.setup(ev => ev.path).returns(() => '/test')
    eventMock.setup(ev => ev.method).returns(() => HttpMethods.GET)

    expect(() => router.getRouteData(eventMock.object)).toThrow(
      "'blah' is not a method on the controller 'TestController'"
    )
  })
})

describe('Cannot parse function', () => {
  let routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: TestController,
      middleware: [],
      function: '__proto__' // only way I could test invalid function
    }
  ]

  const router = new Router(routes)

  test('throws correct error', () => {
    eventMock
      .setup(ev => ev.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.once())

    eventMock
      .setup(ev => ev.method)
      .returns(() => HttpMethods.GET)
      .verifiable(TypeMoq.Times.once())

    expect(() => router.getRouteData(eventMock.object)).toThrow('Route has invalid function')
  })
})

describe('methodParameterCache works', () => {
  const functionMock = TypeMoq.Mock.ofType<() => number>()

  class MyController extends Controller {
    test() {
      return 1
    }
  }

  MyController.prototype.test = functionMock.object

  beforeEach(() => {
    functionMock.reset()
  })

  const routes: MindlessRoute[] = [
    {
      url: new RouteUrl('/test'),
      method: HttpMethods.GET,
      controller: MyController,
      middleware: [],
      function: 'test'
    }
  ]
  const router = new Router(routes)

  test('will not parse function if already parsed', () => {
    eventMock
      .setup(ev => ev.path)
      .returns(() => '/test')
      .verifiable(TypeMoq.Times.exactly(2))

    eventMock
      .setup(ev => ev.method)
      .returns(() => HttpMethods.GET)
      .verifiable(TypeMoq.Times.exactly(2))

    functionMock
      .setup(f => f.toString())
      .returns(() => '()')
      .verifiable(TypeMoq.Times.once())

    const data1 = router.getRouteData(eventMock.object)
    const data2 = router.getRouteData(eventMock.object)

    expect(data1.route).toEqual(routes[0])
    expect(data1).toEqual(data2)

    functionMock.verifyAll()
  })
})
