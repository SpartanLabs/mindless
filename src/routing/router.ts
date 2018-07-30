import { Route } from './routes'
import { Middleware } from '../middleware/middleware'
import { Controller } from '../controller/controller'
import { Request } from '../request'
import { IRouter } from './IRouter'

export class Router<
  M extends Middleware,
  C extends Controller,
  R extends Route<M, C>
> implements IRouter {
  /**
   * Map that keeps a cache of the names of parameters each controller function requires
   * `key` is of the form <controller-name>-<method-name>
   * The value is an ordered array of required parameters for the method
   */
  protected methodParameterCache: { [key: string]: string[] } = {}

  constructor(protected _routes: R[]) {}

  protected static getRouteMetaData(
    route: Route<Middleware, Controller>
  ): { [key: string]: any } {
    /**
     * controller and middleware are constructors
     * there should be no need for them
     */
    const isUsefulKey = (key: string) =>
      typeof (route as any)[key] !== 'undefined' &&
      key !== 'controller' &&
      key !== 'middleware'

    return Object.keys(route)
      .filter(isUsefulKey)
      .reduce((metaData: any, key) => {
        metaData[key] = (route as any)[key]
        return metaData
      }, {})
  }

  private static getParameters(func: Function) {
    const funcPieces = func.toString().match(/\(([^)]*)\)/)

    if (!funcPieces || funcPieces.length < 2) {
      throw new Error('Route has invalid function')
    }

    const args = funcPieces[1]

    return args
      .split(',')
      .map(arg => arg.replace(/\/\*.*\*\//, '').trim()) // get rid of inline comments, trim whitespace
      .filter(arg => arg) // don't add undefined
  }

  public get routes(): R[] {
    return this._routes
  }

  /**
   *
   * @param {Request} request
   * @returns:
   *  route: the target route object
   *  params: the required parameters for the controller function in the route object
   */
  public getRouteData(request: Request): { route: R; params: string[] } {
    const route: R = this.getRequestedRoute(request)

    request.RouteMetaData = Router.getRouteMetaData(route)

    const params = this.getMethodParameters(route)

    return { route, params }
  }

  protected getRequestedRoute(request: Request): R {
    const isRequestedRoute = (route: Route<M, C>) => {
      if (route.method !== request.method) {
        return false
      }
      let params = route.url.match(request.path)
      if (params) {
        request.addMultiple(params)
        return true
      }
      return false
    }

    let route = this._routes.find(isRequestedRoute)

    if (route) {
      return route
    }

    throw Error('Could not find requested route.')
  }

  protected getMethodParameters(route: R) {
    const key = `${route.controller.name}-${route.function}`

    if (this.methodParameterCache[key] === undefined) {
      const method = route.controller.prototype[route.function]
      if (method === undefined) {
        throw new Error(
          `'${route.function}' is not a method on the controller '${route
            .controller.name}'`
        )
      }
      this.methodParameterCache[key] = Router.getParameters(method)
    }

    return this.methodParameterCache[key]
  }
}
