import { Request } from '../request'
import { Response } from '../response'
import { CustomErrorHandler } from './custom-error-handler'

export const DefaultErrorHandler: CustomErrorHandler = (e: Error, request: Request): Response => {
  console.error(e)
  return new Response(500, {
    message:
      'An error occurred, using default error handler (see docs to supply your own). Please check your logs'
  })
}
