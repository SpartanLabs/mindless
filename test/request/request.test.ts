import { RequestEvent, HttpMethods, Request } from '../../src/request'
import { RouteUrl } from '../../src/routing'
import { RouteMetadata } from '../../src/routing/IRouter'

function getEvent(path: string = '', method: HttpMethods = HttpMethods.GET): RequestEvent {
  return {
    path,
    method,
    headers: {},
    queryStringParameters: {},
    body: {}
  }
}

function getRouteMetadata(): RouteMetadata {
  return {
    function: '',
    url: new RouteUrl(''),
    method: HttpMethods.GET
  }
}

describe('Test request constructor', () => {
  test('method and path are properly exposed', () => {
    const path = 'some-path'
    const method = HttpMethods.POST
    const request = new Request(getEvent(path, method), {}, getRouteMetadata())
    expect(request.path).toEqual(path)
    expect(request.method).toEqual(method)
  })

  test('request exposes body object', () => {
    const event = getEvent()
    event.body = {
      name: 'zach',
      number: 12345,
      things: ['a', 'b', 'c']
    }

    const request = new Request(event, {}, getRouteMetadata())

    expect(request.body).toEqual(event.body)
  })

  test('request exposes routeMetedata', () => {
    const routeMetadata = getRouteMetadata()
    routeMetadata.function = 'blah'

    const request = new Request(getEvent(), {}, routeMetadata)

    expect(request.routeMetadata).toEqual(routeMetadata)
  })
})

describe('Test request get method ', () => {
  const localEvent = getEvent()
  test('get added params', () => {
    let defaultEvent = Object.assign({}, localEvent)
    let request = new Request(defaultEvent)
    request.add('param', 'abc')

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('get query string parameters', () => {
    let defaultEvent = getEvent()
    defaultEvent.queryStringParameters['param'] = 'abc'

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('get body parameters', () => {
    let defaultEvent = getEvent()

    defaultEvent.body = JSON.stringify({ param: 'abc' })

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('getOrFail retrieve body parameters', () => {
    let defaultEvent = getEvent()

    defaultEvent.body = JSON.stringify({ param: 'abc' })

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.getOrFail('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('invalid key getOrFail', () => {
    let defaultEvent = getEvent()
    defaultEvent.pathParameters['test'] = 'abc'
    defaultEvent.queryStringParameters['testb'] = 'abc'
    defaultEvent.body = JSON.stringify({ testc: 'abc' })

    let request = new Request(defaultEvent)

    expect(() => {
      request.getOrFail('abc')
    }).toThrow(/key not found/)
  })

  test('key not found returns undefined', () => {
    let defaultEvent = getEvent()
    defaultEvent.pathParameters['test'] = 'abc'
    defaultEvent.queryStringParameters['testb'] = 'abc'
    defaultEvent.body = JSON.stringify({ testc: 'abc' })

    let request = new Request(defaultEvent)

    let retrievedValue = request.get('abc')

    expect(retrievedValue).toBeUndefined()
  })
})

describe('Test request header', () => {
  test('invalid key', () => {
    let event = getEvent()
    let request = new Request(event)

    expect(() => {
      request.headerOrFail('abc')
    }).toThrow(/key not found/)
  })

  test('headerOrFail retrieve header', () => {
    let event = getEvent()
    event.headers['test'] = 'val'
    let request = new Request(event)
    expect(request.headerOrFail('test')).toBe('val')
  })

  test('undefined header value', () => {
    let event = getEvent()
    let request = new Request(event)

    expect(() => {
      request.header('abc').toBeUndefined()
    })
  })

  test('retrieve header value', () => {
    let event = getEvent()
    event.headers['test'] = 'val'

    let request = new Request(event)

    expect(request.header('test')).toBe('val')
  })
})

describe('Test request add method', () => {
  let event = getEvent()
  let request: Request

  beforeEach(() => {
    // reset request object
    request = new Request(event)
  })

  test('Add new key,val pair', () => {
    request.add('abc', 'val')
    let retrievedVal = request.get('abc')

    expect(retrievedVal).toBe('val')
  })

  test('Add new key,val pair with already existing key', () => {
    request.add('abc', 'val')

    let addKeyAlreadyExists = () => {
      request.add('abc', 'val2')
    }

    expect(addKeyAlreadyExists).toThrow(/key 'abc' already exists/)
    expect(request.get('abc')).toBe('val')
  })

  test('Add new key,val pair with already existing key and overwrite set to true', () => {
    request.add('abc', 'val')
    request.add('abc', 'val2', true)

    expect(request.get('abc')).toBe('val2')
  })

  test('Add multiple key,val pair', () => {
    const map = { abc: 'val', def: 'lav' }
    request.addMultiple(map)

    expect(request.get('abc')).toBe('val')
    expect(request.get('def')).toBe('lav')
  })
})
