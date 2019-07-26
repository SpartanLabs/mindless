import { MindlessError } from '../../src/mindless'
import { HttpMethods, Request } from '../../src/request'
import { RouteUrl } from '../../src/routing'
import { RouteMetadata } from '../../src/routing/IRouter'
import { escapeRegExp } from 'tslint/lib/utils'

function getRouteMetadata(): RouteMetadata {
  return {
    function: '',
    url: new RouteUrl(''),
    method: HttpMethods.GET
  }
}

describe('Test request constructor', () => {
  const path = 'some-path'

  test('method and path are properly exposed', () => {
    const request = new Request(path, {}, getRouteMetadata())
    expect(request.path).toEqual(path)
    expect(request.method).toEqual(HttpMethods.GET)
  })

  test('request exposes body object', () => {
    const body = {
      name: 'zach',
      number: 12345,
      things: ['a', 'b', 'c']
    }

    const request = new Request(path, body, getRouteMetadata())

    expect(request.body).toEqual(body)
  })

  test('request exposes body object of class instance', () => {
    class TestBody {
      constructor(public data: string) {}
      getGreeting(name: string): string {
        return `Hello ${name}`
      }
    }
    const body = new TestBody('some data')

    const request = new Request(path, body, getRouteMetadata())

    expect(request.body).toBeInstanceOf(TestBody)
    expect(request.body.data).toEqual('some data')
    expect(request.body.getGreeting('bob')).toEqual('Hello bob')
  })

  test('request exposes routeMetedata', () => {
    const routeMetadata = getRouteMetadata()
    routeMetadata.function = 'blah'

    const request = new Request(path, {}, routeMetadata)

    expect(request.routeMetadata).toEqual(routeMetadata)
  })
})

describe('Test request get data ', () => {
  const key = 'param'
  const val = 'abc'
  const obj = new Map([['param', 'abc']])

  test('set and get context', () => {
    const request = new Request('', {}, getRouteMetadata())
    request.addContext(key, val)
    const actual = request.getContext(key)

    expect(actual).toBe(val)
  })

  test('get path parameters', () => {
    const request = new Request('', {}, getRouteMetadata(), obj)
    const actual = request.getPathParameter(key)
    const actualFromOrFail = request.getPathParameterOrFail(key)

    expect(actual).toBe(val)
    expect(actualFromOrFail).toBe(val)
  })

  test('get path param or fail', () => {
    const request = new Request('', {}, getRouteMetadata())

    try {
      const actual = request.getPathParameterOrFail(key)
    } catch (e) {
      expect(e).toBeInstanceOf(MindlessError)
    }

    expect.assertions(1)
  })

  test('get query string parameters', () => {
    const request = new Request('', {}, getRouteMetadata(), new Map(), obj)
    const actual = request.getQueryStringParameter(key)
    const actualFromOrFail = request.getQueryStringParameterOrFail(key)

    expect(actual).toBe(val)
    expect(actualFromOrFail).toBe(val)
  })

  test('get query string param or fail', () => {
    const request = new Request('', new Map(), getRouteMetadata())

    try {
      const actual = request.getQueryStringParameterOrFail(key)
    } catch (e) {
      expect(e).toBeInstanceOf(MindlessError)
    }

    expect.assertions(1)
  })

  test('get header', () => {
    const request = new Request('', {}, getRouteMetadata(), new Map(), new Map(), obj)
    const actual = request.getHeader(key)
    const actualFromFail = request.getHeaderOrFail(key)

    expect(actual).toBe(val)
    expect(actualFromFail).toBe(val)
  })

  test('get header or fail', () => {
    const request = new Request('', {}, getRouteMetadata())

    try {
      const actual = request.getHeaderOrFail(key)
    } catch (e) {
      expect(e).toBeInstanceOf(MindlessError)
    }

    expect.assertions(1)
  })
})
