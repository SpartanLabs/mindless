import { Request, RequestEvent } from '../request'
import { Response } from '../response'
import { CustomErrorHandler } from './custom-error-handler'

export const DefaultErrorHandler: CustomErrorHandler = (
  error: Error,
  request: Request | RequestEvent
): Response => {
  console.error({ request, error })
  return new Response(500, {
    message:
      'An error occurred, using default error handler (see docs to supply your own). Please check your logs'
  })
}
