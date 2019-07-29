import { Response } from '../src/response'

describe('Response class test', () => {
  test('default values', () => {
    const response = new Response()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({})
    expect(response.headers).toEqual({})
  })

  test('provide values', () => {
    const code = 837
    const body = { key: 'val' }
    const header = { headerKey: 'headerval' }
    const response = new Response(code, body, header)

    expect(response.statusCode).toBe(code)
    expect(response.body).toEqual(body)
    expect(response.headers).toEqual(header)
  })
})
