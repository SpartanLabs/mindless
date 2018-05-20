import { Middleware } from '../middleware/middleware'
import { Controller } from '../controller/controller'
import { Route } from './routes'
import { Request } from '../request'

export interface IRouter {
  readonly routes: Route<Middleware, Controller>[]
  getRouteData(
    request: Request
  ): { route: Route<Middleware, Controller>; params: string[] }
}
