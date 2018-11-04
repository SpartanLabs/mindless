import { CustomErrorHandler } from '../error/custom-error-handler'
import { DefaultErrorHandler } from '../error/default-error-handler'
import { GenericConstructor } from '../interfaces'
import { Request } from '../request'
import { Response } from '../response'
import { IRouter } from '../routing'
import { Dispatcher } from './dispatcher'
import { IApp } from './IApp'
import { IContainer } from './IContainer'

export class App implements IApp {
  constructor(
    protected container: IContainer,
    protected router: IRouter,
    protected errorHandler: CustomErrorHandler = DefaultErrorHandler
  ) {}

  resolve<T>(constructor: GenericConstructor<T>): T {
    return this.container.resolve(constructor)
  }

  async handleRequest(request: Request): Promise<Response> {
    try {
      const data = this.router.getRouteData(request)
      await Dispatcher.dispatchMiddleware(this.container, request, data.route.middleware || [])
      return await Dispatcher.dispatchController(this.container, request, data.route, data.params)
    } catch (e) {
      return this.errorHandler(e, request)
    }
  }
}
