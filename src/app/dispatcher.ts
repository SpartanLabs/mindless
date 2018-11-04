import { Controller } from '../controller/controller'
import { MindlessError } from '../error/mindless.error'
import { GenericConstructor } from '../interfaces'
import { Middleware } from '../middleware/middleware'
import { Request } from '../request'
import { Response } from '../response'
import { Route } from '../routing'
import { IContainer } from './IContainer'

export class Dispatcher {
  public static dispatchMiddleware(
    container: IContainer,
    request: Request,
    middleware: GenericConstructor<Middleware>[]
  ): Promise<undefined> {
    const middlewares: Middleware[] = middleware
      .map(constructor => container.resolve(constructor))
      .reverse()

    const runNextMiddleware = (): Promise<undefined> => {
      if (middlewares.length === 0) {
        return Promise.resolve(undefined)
      }
      return middlewares.pop()!.handle(request, runNextMiddleware)
    }

    return runNextMiddleware()
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
          'Unable to inject ' + param + ' into ' + route.controller.name + '.' + route.function
        throw new MindlessError(msg)
      }
    }

    let subjectController: Controller
    try {
      subjectController = container.resolve(route.controller)
    } catch (e) {
      throw new MindlessError(
        `Failed to resolve controller from container. Error Message: ${e.message}`
      )
    }
    const args = params.map(getArgToInject)

    return await (subjectController as any)[route.function](...args)
  }
}
