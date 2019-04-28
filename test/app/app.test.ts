import * as TypeMoq from 'typemoq'
import { Dispatcher } from '../../src/app/dispatcher'
import { CustomErrorHandler } from '../../src/error/custom-error-handler'
import { GenericConstructor } from '../../src/interfaces'
import {
  App,
  Controller,
  HttpMethods,
  IContainer,
  IRouter,
  Middleware,
  Request,
  Response,
  RouteUrl
} from '../../src/mindless'
import { RequestEvent } from '../../src/request'
import { DefaultBodyDeserializer } from '../../src/request/default-body-deserializer'
import { RouteData } from '../../src/routing/IRouter'

describe('App', () => {
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const routerMock = TypeMoq.Mock.ofType<IRouter>()
  const genericMock = TypeMoq.Mock.ofType<GenericConstructor<string>>()
  beforeEach(() => {
    containerMock.reset()
    routerMock.reset()
    genericMock.reset()
  })

  test('App gets constructed', () => {
    const app = new App(containerMock.object, routerMock.object)
    expect(app).toBeInstanceOf(App)
  })

  test('App resolve', () => {
    const app = new App(containerMock.object, routerMock.object)

    containerMock
      .setup(c => c.resolve(TypeMoq.It.isAny()))
      .returns(() => 'abc')
      .verifiable(TypeMoq.Times.once())

    const str = app.resolve(genericMock.object)

    expect(str).toBe('abc')

    containerMock.verifyAll()
  })
})

describe('App handle request', () => {
  const eventMock = TypeMoq.Mock.ofType<RequestEvent>()
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const routerMock = TypeMoq.Mock.ofType<IRouter>()
  const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>()
  const middlewareConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Middleware>>()
  const dispatchMiddlewareMock = TypeMoq.Mock.ofInstance(Dispatcher.dispatchMiddleware)
  const dispatchControllerMock = TypeMoq.Mock.ofInstance(Dispatcher.dispatchController)
  const errorHandlerMock = TypeMoq.Mock.ofType<CustomErrorHandler>()
  const bodyDeserializerMock = TypeMoq.Mock.ofType<DefaultBodyDeserializer>()
  beforeEach(() => {
    eventMock.reset()
    containerMock.reset()
    routerMock.reset()
    controllerConstructorMock.reset()
    middlewareConstructorMock.reset()
    dispatchMiddlewareMock.reset()
    dispatchControllerMock.reset()
    errorHandlerMock.reset()
    bodyDeserializerMock.reset()
  })

  afterEach(() => {
    eventMock.verifyAll()
    containerMock.verifyAll()
    routerMock.verifyAll()
    controllerConstructorMock.verifyAll()
    middlewareConstructorMock.verifyAll()
    dispatchMiddlewareMock.verifyAll()
    dispatchControllerMock.verifyAll()
    errorHandlerMock.verifyAll()
    bodyDeserializerMock.verifyAll()
  })

  test('successfully handle request', async () => {
    const app = new App(
      containerMock.object,
      routerMock.object,
      errorHandlerMock.object,
      bodyDeserializerMock.object
    )

    Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object
    Dispatcher.dispatchController = dispatchControllerMock.object

    const data = {
      route: {
        url: new RouteUrl(''),
        method: HttpMethods.GET,
        function: 'test',
        controller: controllerConstructorMock.object,
        middleware: [middlewareConstructorMock.object]
      },
      params: []
    }

    const routeData: RouteData = {
      route: data.route,
      metadata: { url: data.route.url, method: data.route.method, function: data.route.function },
      pathParameters: {},
      methodParameters: []
    }

    routerMock
      .setup(r => r.getRouteData(eventMock.object))
      .returns(() => routeData)
      .verifiable(TypeMoq.Times.once())

    bodyDeserializerMock
      .setup(bd => bd.deserialize(eventMock.object, routeData.metadata))
      .verifiable(TypeMoq.Times.once())

    dispatchMiddlewareMock
      .setup(m =>
        m(containerMock.object, TypeMoq.It.is(obj => obj instanceof Request), data.route.middleware)
      )
      .verifiable(TypeMoq.Times.once())

    dispatchControllerMock
      .setup(c =>
        c(
          containerMock.object,
          TypeMoq.It.is(obj => obj instanceof Request),
          data.route,
          data.params
        )
      )
      .returns(() => Promise.resolve(new Response()))
      .verifiable(TypeMoq.Times.once())

    const response = await app.handleRequest(eventMock.object)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(200)
  })

  test('successfully handle request without middleware', async () => {
    const app = new App(
      containerMock.object,
      routerMock.object,
      errorHandlerMock.object,
      bodyDeserializerMock.object
    )

    Dispatcher.dispatchController = dispatchControllerMock.object

    const data = {
      route: {
        url: new RouteUrl(''),
        method: HttpMethods.GET,
        function: 'test',
        controller: controllerConstructorMock.object
      },
      params: []
    }

    const routeData: RouteData = {
      route: data.route,
      metadata: { url: data.route.url, method: data.route.method, function: data.route.function },
      pathParameters: {},
      methodParameters: []
    }

    routerMock
      .setup(r => r.getRouteData(eventMock.object))
      .returns(() => routeData)
      .verifiable(TypeMoq.Times.once())

    bodyDeserializerMock
      .setup(bd => bd.deserialize(eventMock.object, routeData.metadata))
      .verifiable(TypeMoq.Times.once())

    dispatchControllerMock
      .setup(c =>
        c(
          containerMock.object,
          TypeMoq.It.is(obj => obj instanceof Request),
          data.route,
          data.params
        )
      )
      .returns(() => Promise.resolve(new Response()))
      .verifiable(TypeMoq.Times.once())

    const response = await app.handleRequest(eventMock.object)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(200)
  })

  test('middleware rejects with response', async () => {
    const app = new App(
      containerMock.object,
      routerMock.object,
      errorHandlerMock.object,
      bodyDeserializerMock.object
    )

    Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object
    Dispatcher.dispatchController = dispatchControllerMock.object

    const data = {
      route: {
        url: new RouteUrl(''),
        method: HttpMethods.GET,
        function: 'test',
        controller: controllerConstructorMock.object,
        middleware: [middlewareConstructorMock.object]
      },
      params: []
    }

    const routeData: RouteData = {
      route: data.route,
      metadata: { url: data.route.url, method: data.route.method, function: data.route.function },
      pathParameters: {},
      methodParameters: []
    }

    const errorMsg = 'error message'

    routerMock
      .setup(r => r.getRouteData(eventMock.object))
      .returns(() => routeData)
      .verifiable(TypeMoq.Times.once())

    bodyDeserializerMock
      .setup(bd => bd.deserialize(eventMock.object, routeData.metadata))
      .verifiable(TypeMoq.Times.once())

    dispatchMiddlewareMock
      .setup(m =>
        m(containerMock.object, TypeMoq.It.is(obj => obj instanceof Request), data.route.middleware)
      )
      .returns(() => Promise.reject(new Response(399, { rejected: errorMsg })))
      .verifiable(TypeMoq.Times.once())

    dispatchControllerMock
      .setup(c => c(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .verifiable(TypeMoq.Times.never())

    const response = await app.handleRequest(eventMock.object)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(399)
    expect(response.body.rejected).toEqual(errorMsg)
  })

  test('handle error from getRouteData', async () => {
    const app = new App(
      containerMock.object,
      routerMock.object,
      errorHandlerMock.object,
      bodyDeserializerMock.object
    )

    Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object
    Dispatcher.dispatchController = dispatchControllerMock.object

    const error = new Error('error message')
    const expectedRes = new Response(399, { err: 'blah' })

    routerMock
      .setup(r => r.getRouteData(eventMock.object))
      .throws(error)
      .verifiable(TypeMoq.Times.once())

    errorHandlerMock
      .setup(handler => handler(error, eventMock.object))
      .returns(() => expectedRes)
      .verifiable(TypeMoq.Times.once())

    dispatchControllerMock
      .setup(c => c(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .verifiable(TypeMoq.Times.never())

    dispatchMiddlewareMock
      .setup(m => m(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .verifiable(TypeMoq.Times.never())

    const actualResponse = await app.handleRequest(eventMock.object)

    expect(actualResponse).toBeInstanceOf(Response)
    expect(actualResponse).toBe(expectedRes)
  })

  test('handle error from dispatching controller', async () => {
    const app = new App(
      containerMock.object,
      routerMock.object,
      errorHandlerMock.object,
      bodyDeserializerMock.object
    )

    Dispatcher.dispatchController = dispatchControllerMock.object

    const error = new Error('error message')
    const expectedRes = new Response(399, { err: 'blah' })

    const data = {
      route: {
        url: new RouteUrl(''),
        method: HttpMethods.GET,
        function: 'test',
        controller: controllerConstructorMock.object,
        middleware: []
      },
      params: []
    }

    const routeData: RouteData = {
      route: data.route,
      metadata: { url: data.route.url, method: data.route.method, function: data.route.function },
      pathParameters: {},
      methodParameters: []
    }

    routerMock
      .setup(r => r.getRouteData(eventMock.object))
      .returns(() => routeData)
      .verifiable(TypeMoq.Times.once())

    bodyDeserializerMock
      .setup(bd => bd.deserialize(eventMock.object, routeData.metadata))
      .verifiable(TypeMoq.Times.once())

    errorHandlerMock
      .setup(handler => handler(error, TypeMoq.It.is(obj => obj instanceof Request)))
      .returns(() => expectedRes)
      .verifiable(TypeMoq.Times.once())

    dispatchControllerMock
      .setup(c =>
        c(
          containerMock.object,
          TypeMoq.It.is(obj => obj instanceof Request),
          data.route,
          data.params
        )
      )
      .returns(() => Promise.reject(error))
      .verifiable(TypeMoq.Times.once())

    const actualResponse = await app.handleRequest(eventMock.object)

    expect(actualResponse).toBeInstanceOf(Response)
    expect(actualResponse).toBe(expectedRes)
  })
})
