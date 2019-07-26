import { Controller } from '../controller/controller'
import { MindlessError } from '../error/mindless.error'
import { Middleware } from '../middleware/middleware'
import { Request, RequestEvent } from '../request'
import { IRouter, RouteData, RouteMetadata } from './IRouter'
import { Route } from './routes'

export class Router<TRoute extends Route<Middleware, Controller>> implements IRouter<TRoute> {
  /**
   * Map that keeps a cache of the names of parameters each controller function requires
   * `key` is of the form <controller-name>-<method-name>
   * The value is an ordered array of required parameters for the method
   */
  protected methodParameterCache: { [key: string]: string[] } = {}

  constructor(protected _routes: TRoute[]) {}

  private static getParameters(func: Function) {
    const funcPieces = func.toString().match(/\(([^)]*)\)/)

    if (!funcPieces || funcPieces.length < 2) {
      throw new MindlessError('Route has invalid function')
    }

    const args = funcPieces[1]

    return args
      .split(',')
      .map(arg => arg.replace(/\/\*.*\*\//, '').trim()) // get rid of inline comments, trim whitespace
      .filter(arg => arg) // don't add undefined
  }

  public get routes(): TRoute[] {
    return this._routes
  }

  /**
   *
   * @param {Request} request
   * @returns:
   *  route: the target route object
   *  params: the required parameters for the controller function in the route object
   */
  public getRouteData(request: RequestEvent): RouteData<TRoute> {
    const [route, pathParameters] = this.getRequestedRoute(request)

    const metadata = this.getRouteMetaData(route)

    const methodParameters = this.getMethodParameters(route)

    return { route, metadata, pathParameters, methodParameters }
  }

  protected getRequestedRoute(request: RequestEvent): [TRoute, ReadonlyMap<string, string>] {
    for (const route of this._routes) {
      if (route.method === request.method) {
        const params = route.url.match(request.path)
        if (params) {
          return [route, new Map(Object.entries(params))]
        }
      }
    }

    throw new MindlessError('Could not find requested route.')
  }

  protected getRouteMetaData(route: Route<Middleware, Controller>): RouteMetadata<TRoute> {
    /**
     * controller and middleware are constructors
     * there should be no need for them
     */
    const isUsefulKey = (key: string) =>
      typeof (route as any)[key] !== 'undefined' && key !== 'controller' && key !== 'middleware'

    return Object.keys(route)
      .filter(isUsefulKey)
      .reduce((metaData: any, key) => {
        metaData[key] = (route as any)[key]
        return metaData
      }, {})
  }

  protected getMethodParameters(route: TRoute) {
    const key = `${route.controller.name}-${route.function}`

    if (this.methodParameterCache[key] === undefined) {
      const method = route.controller.prototype[route.function]
      if (method === undefined) {
        throw new MindlessError(
          `'${route.function}' is not a method on the controller '${route.controller.name}'`
        )
      }
      this.methodParameterCache[key] = Router.getParameters(method)
    }

    return this.methodParameterCache[key]
  }
}
