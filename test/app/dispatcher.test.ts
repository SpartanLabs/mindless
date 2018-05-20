import * as TypeMoq from 'typemoq'
import { Dispatcher } from '../../src/app'
import { GenericConstructor } from '../../src/interfaces'

import {
  Controller,
  HttpMethods,
  IContainer,
  Middleware,
  Request,
  Response,
  RouteUrl
} from '../../src/mindless'

describe('Dispatch middleware', () => {
  const requestMock = TypeMoq.Mock.ofType<Request>()
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const controllerConstructorMock = TypeMoq.Mock.ofType<
    GenericConstructor<Controller>
  >()
  const middlewareConstructorMock = TypeMoq.Mock.ofType<
    GenericConstructor<Middleware>
  >()
  const middlewareMock = TypeMoq.Mock.ofType<Middleware>()
  beforeEach(() => {
    requestMock.reset()
    containerMock.reset()
    controllerConstructorMock.reset()
    middlewareConstructorMock.reset()
    middlewareMock.reset()
  })

  test('Middleware is dispatched successfully', async () => {
    const middleware = [middlewareConstructorMock.object]

    containerMock
      .setup(c => c.resolve(middlewareConstructorMock.object))
      .returns(() => middlewareMock.object)
      .verifiable(TypeMoq.Times.once())

    middlewareMock
      .setup(m => m.handle(TypeMoq.It.isAny()))
      .returns(() => Promise.resolve('done'))
      .verifiable(TypeMoq.Times.once())

    const values = await Dispatcher.dispatchMiddleware(
      containerMock.object,
      requestMock.object,
      middleware
    )

    expect(values).toHaveLength(1)
    expect(values[0]).toBe('done')

    containerMock.verifyAll()
    middlewareMock.verifyAll()
  })
})

describe('Dispatch controller', () => {
  const requestMock = TypeMoq.Mock.ofType<Request>()
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const controllerConstructorMock = TypeMoq.Mock.ofType<
    GenericConstructor<Controller>
  >()
  const controllerMock = TypeMoq.Mock.ofType<Controller>()

  beforeEach(() => {
    requestMock.reset()
    containerMock.reset()
    controllerConstructorMock.reset()
    controllerMock.reset()
  })

  test('dispatch controller successfully with no parameters.', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params: string[] = []

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    controllerMock
      .setup(m => (m as any).test())
      .returns(() => Promise.resolve(new Response()))
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(200)

    containerMock.verifyAll()
    controllerMock.verifyAll()
  })

  test('dispatch controller successfully with parameters.', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params = ['test', 'test2']

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.getOrFail('test'))
      .returns(() => 1)
      .verifiable(TypeMoq.Times.once())
    requestMock
      .setup(r => r.getOrFail('test2'))
      .returns(() => 2)
      .verifiable(TypeMoq.Times.once())

    controllerMock
      .setup(m => (m as any).test(1, 2))
      .returns(() => Promise.resolve(new Response()))
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(200)

    containerMock.verifyAll()
    requestMock.verifyAll()
    controllerMock.verifyAll()
  })

  test('dispatch controller successfully with request parameter.', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params = ['request']

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    controllerMock
      .setup(m => (m as any).test(requestMock.object))
      .returns(() => Promise.resolve(new Response()))
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(200)

    containerMock.verifyAll()
    requestMock.verifyAll()
    controllerMock.verifyAll()
  })
})

describe('Dispatch controller fails', () => {
  const requestMock = TypeMoq.Mock.ofType<Request>()
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const controllerConstructorMock = TypeMoq.Mock.ofType<
    GenericConstructor<Controller>
  >()
  const controllerMock = TypeMoq.Mock.ofType<Controller>()

  beforeEach(() => {
    requestMock.reset()
    containerMock.reset()
    controllerConstructorMock.reset()
    controllerMock.reset()
  })

  test('dispatch controller, cannot resolve controller from container', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params: string[] = []

    const errorMsg = 'could not resolve controller'

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .throws(new Error(errorMsg))
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response.statusCode).toBe(500)
    expect(response.body['Error Message']).toBe(errorMsg)

    containerMock.verifyAll()
  })

  test('dispatch controller, required function parameter not found.', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params = ['test']

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.getOrFail('test'))
      .throws(new Error())
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response.statusCode).toBe(500)
    expect(response.body['Error Message']).toMatch(/Unable to inject test into/)

    containerMock.verifyAll()
    requestMock.verifyAll()
  })

  test('dispatch controller, controller method throws', async () => {
    const route = {
      url: new RouteUrl(''),
      method: HttpMethods.GET,
      controller: controllerConstructorMock.object,
      function: 'test'
    }

    const params: string[] = []

    const errorMsg = 'controller method failed.'

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    controllerMock
      .setup(m => (m as any).test())
      .throws(new Error(errorMsg))
      .verifiable(TypeMoq.Times.once())

    const response: Response = await Dispatcher.dispatchController(
      containerMock.object,
      requestMock.object,
      route,
      params
    )

    expect(response.statusCode).toBe(500)
    expect(response.body['Error Message']).toBe(errorMsg)

    containerMock.verifyAll()
    controllerMock.verifyAll()
  })
})
