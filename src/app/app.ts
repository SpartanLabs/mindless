import { CustomErrorHandler } from '../error/custom-error-handler'
import { DefaultErrorHandler } from '../error/default-error-handler'
import { GenericConstructor } from '../interfaces'
import { Request, RequestEvent } from '../request'
import { DefaultBodyDeserializer } from '../request/default-body-deserializer'
import { RequestBodyDeserializer } from '../request/request-body-deserializer'
import { Response } from '../response'
import { IRouter } from '../routing'
import { RouteData } from '../routing/IRouter'
import { Dispatcher } from './dispatcher'
import { IApp } from './IApp'
import { IContainer } from './IContainer'

export class App implements IApp {
  constructor(
    protected container: IContainer,
    protected router: IRouter,
    protected errorHandler: CustomErrorHandler = DefaultErrorHandler,
    protected requestBodyDeserializer: RequestBodyDeserializer = new DefaultBodyDeserializer()
  ) {}

  resolve<T>(constructor: GenericConstructor<T>): T {
    return this.container.resolve(constructor)
  }

  async handleRequest(event: RequestEvent): Promise<Response> {
    const [data, error] = this.getRouteData(event)

    if (error !== undefined) {
      return this.errorHandler(error, event)
    }
    // If error is undefined then data must be defined

    const request = this.createRequest(event, data!)

    try {
      await Dispatcher.dispatchMiddleware(this.container, request, data!.route.middleware || [])
      return await Dispatcher.dispatchController(
        this.container,
        request,
        data!.route,
        data!.methodParameters
      )
    } catch (e) {
      // Allow middleware and controller to reject with response object
      if (e instanceof Response) {
        return e
      }
      return this.errorHandler(e, request)
    }
  }

  protected getRouteData(event: RequestEvent): [RouteData, undefined] | [undefined, Error] {
    try {
      return [this.router.getRouteData(event), undefined]
    } catch (e) {
      return [undefined, e]
    }
  }

  protected createRequest(event: RequestEvent, data: RouteData): Request {
    const bodyObj = this.requestBodyDeserializer.deserialize(event, data.metadata)

    return new Request(
      event.path,
      bodyObj,
      data!.metadata,
      data!.pathParameters,
      event.queryStringParameters,
      event.headers
    )
  }
}
