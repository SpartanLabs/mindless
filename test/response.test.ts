import { Response } from '../src/response'

describe('Response class test', () => {
  test('default values', () => {
    const response = new Response()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({})
    expect(response.headers).toEqual({})
  })

  test('aws integration respone', () => {
    const body = { msg: 'hello world' }
    const headers = { aHeader: 'i am a header' }
    const response = new Response(200, body, headers)

    const awsResponse = response.toAWSLambdaIntegrationResponse()

    expect(awsResponse.statusCode).toBe(200)
    expect(awsResponse.body).toBe(JSON.stringify(body))
    expect(awsResponse.headers).toBe(headers)
  })
})
