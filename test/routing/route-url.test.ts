import { RouteUrl } from '../../src/routing'

describe('RouteUrl', () => {
  test('getRaw', () => {
    const path = 'some/path'
    const route = new RouteUrl(path)

    expect(route).toBeInstanceOf(RouteUrl)
    expect(route.getRaw()).toEqual(path)
  })
})
