import { Middleware } from '../middleware/middleware'
import { Controller } from '../controller/controller'
import { Route } from '../routing'
import { Request } from '../request'
import { Response } from '../response'
import { IContainer } from './IContainer'
import { GenericConstructor } from '../interfaces'

export class Dispatcher {
  public static dispatchMiddleware(
    container: IContainer,
    request: Request,
    middleware: GenericConstructor<Middleware>[]
  ): Promise<any[]> {
    const promises: Promise<any>[] = middleware
      .map(constructor => container.resolve(constructor))
      .map(object => object.handle(request))

    return Promise.all(promises)
  }

  public static async dispatchController(
    container: IContainer,
    request: Request,
    route: Route<Middleware, Controller>,
    params: string[]
  ): Promise<Response> {
    const getArgToInject = (param: string) => {
      if (param === 'request') {
        return request
      }

      try {
        return request.getOrFail(param)
      } catch (e) {
        const msg =
          'Unable to inject ' +
          param +
          ' into ' +
          route.controller.name +
          '.' +
          route.function
        throw Error(msg)
      }
    }

    try {
      let subjectController: Controller = container.resolve(route.controller)
      let args = params.map(getArgToInject)

      return await (subjectController as any)[route.function](...args)
    } catch (e) {
      let body = {
        'Error Message': e.message,
        'Mindless Message':
          'Unable to resolve requested controller or method make sure your _routes are configured properly'
      }
      return new Response(500, body)
    }
  }
}
