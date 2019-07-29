import * as TypeMoq from 'typemoq'
import { Dispatcher } from '../../src/app/dispatcher'
import { MindlessError } from '../../src/error/mindless.error'
import { GenericConstructor } from '../../src/interfaces'

import {
  Controller,
  Event,
  HttpMethods,
  IContainer,
  Middleware,
  Request,
  Response,
  RouteUrl
} from '../../src/mindless'
import { ActionMiddlewareMock } from '../mocks/action-middleware.mock'
import { MiddlewareMock } from '../mocks/middleware.mock'

describe('Dispatch middleware', () => {
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const requestMock = TypeMoq.Mock.ofType<Request>()

  beforeEach(() => {
    containerMock.reset()
    requestMock.reset()
  })

  test('no middleware', async () => {
    const middlewareList: GenericConstructor<Middleware>[] = []

    containerMock.setup(c => c.resolve(TypeMoq.It.isAny())).verifiable(TypeMoq.Times.never())

    const response = await Dispatcher.dispatchMiddleware(
      containerMock.object,
      requestMock.object,
      middlewareList
    )

    expect(response).toBeUndefined()

    containerMock.verifyAll()
  })

  test('single middleware', async () => {
    const middlewareList: GenericConstructor<Middleware>[] = [MiddlewareMock]
    const middlewareMock = new MiddlewareMock()

    containerMock
      .setup(c => c.resolve(MiddlewareMock))
      .returns(() => middlewareMock)
      .verifiable(TypeMoq.Times.once())

    const response = await Dispatcher.dispatchMiddleware(
      containerMock.object,
      requestMock.object,
      middlewareList
    )

    expect(response).toBeUndefined()
    expect(middlewareMock.numberOfTimesHandleHasBeenCalled).toEqual(1)

    containerMock.verifyAll()
  })

  test('multiple middleware are called in correct order', async () => {
    let order = 0
    const getTag = () => (order++).toString()

    const middlewareList: GenericConstructor<Middleware>[] = [MiddlewareMock, MiddlewareMock]

    const middlewareMock = new MiddlewareMock(getTag)
    const anotherMiddlewareMock = new MiddlewareMock(getTag)

    containerMock.setup(c => c.resolve(MiddlewareMock)).returns(() => middlewareMock)

    containerMock
      .setup(c => c.resolve(MiddlewareMock))
      .returns(() => anotherMiddlewareMock)
      .verifiable(TypeMoq.Times.exactly(2))

    const response = await Dispatcher.dispatchMiddleware(
      containerMock.object,
      requestMock.object,
      middlewareList
    )

    expect(response).toBeUndefined()
    expect(middlewareMock.numberOfTimesHandleHasBeenCalled).toEqual(1)
    expect(anotherMiddlewareMock.numberOfTimesHandleHasBeenCalled).toEqual(1)
    expect(middlewareMock.tag).toEqual('0')
    expect(anotherMiddlewareMock.tag).toEqual('1')

    containerMock.verifyAll()
  })

  test('multiple middleware share same request', async () => {
    const middlewareList: GenericConstructor<Middleware>[] = [
      ActionMiddlewareMock,
      ActionMiddlewareMock
    ]

    const key = 'key'
    const value = 'special value from middleware 1'
    const middlewareMock = new ActionMiddlewareMock(req => req.addContext(key, value))

    let valueFromAnotherMiddlewareMock: string | undefined = undefined
    const anotherMiddlewareMock = new ActionMiddlewareMock(
      req => (valueFromAnotherMiddlewareMock = req.getContext(key))
    )

    containerMock.setup(c => c.resolve(ActionMiddlewareMock)).returns(() => middlewareMock)

    containerMock
      .setup(c => c.resolve(ActionMiddlewareMock))
      .returns(() => anotherMiddlewareMock)
      .verifiable(TypeMoq.Times.exactly(2))

    requestMock.setup(r => r.addContext(key, value)).verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.getContext(key))
      .returns(() => value)
      .verifiable(TypeMoq.Times.once())

    const response = await Dispatcher.dispatchMiddleware(
      containerMock.object,
      requestMock.object,
      middlewareList
    )

    expect(response).toBeUndefined()
    expect(middlewareMock.numberOfTimesHandleHasBeenCalled).toEqual(1)
    expect(anotherMiddlewareMock.numberOfTimesHandleHasBeenCalled).toEqual(1)
    expect(valueFromAnotherMiddlewareMock).toEqual(value)

    containerMock.verifyAll()
    requestMock.verifyAll()
  })
})

describe('Dispatch controller', () => {
  const requestMock = TypeMoq.Mock.ofType<Request>()
  const containerMock = TypeMoq.Mock.ofType<IContainer>()
  const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>()
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

    const params = ['test1', 'test2']

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .returns(() => controllerMock.object)
      .verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.getPathParameter('test1'))
      .returns(() => '1')
      .verifiable(TypeMoq.Times.once())
    requestMock
      .setup(r => r.getQueryStringParameter('test2'))
      .returns(() => '2')
      .verifiable(TypeMoq.Times.once())

    controllerMock
      .setup(c => (c as any).test('1', '2'))
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
  const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>()
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

    const errorMsg = 'original error message'

    containerMock
      .setup(c => c.resolve(controllerConstructorMock.object))
      .throws(new Error(errorMsg))
      .verifiable(TypeMoq.Times.once())

    try {
      const response: Response = await Dispatcher.dispatchController(
        containerMock.object,
        requestMock.object,
        route,
        params
      )
    } catch (e) {
      expect(e).toBeInstanceOf(MindlessError)
      expect(e.message).toMatch(/Failed to resolve controller from container/)
      expect(e.message).toMatch(new RegExp(errorMsg))
    }

    expect.assertions(3)

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
      .setup(r => r.getPathParameter('test'))
      .returns(() => undefined)
      .verifiable(TypeMoq.Times.once())

    requestMock
      .setup(r => r.getQueryStringParameter('test'))
      .returns(() => undefined)
      .verifiable(TypeMoq.Times.once())

    try {
      const response: Response = await Dispatcher.dispatchController(
        containerMock.object,
        requestMock.object,
        route,
        params
      )
    } catch (e) {
      expect(e).toBeInstanceOf(MindlessError)
      expect(e.message).toMatch(/Unable to inject test/)
    }

    expect.assertions(2)

    containerMock.verifyAll()
    requestMock.verifyAll()
  })

  test('dispatch controller, controller method error bubbles up', async () => {
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

    try {
      const response: Response = await Dispatcher.dispatchController(
        containerMock.object,
        requestMock.object,
        route,
        params
      )
    } catch (e) {
      expect(e.message).toEqual(errorMsg)
    }

    expect.assertions(1)

    containerMock.verifyAll()
    controllerMock.verifyAll()
  })
})
