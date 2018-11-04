import { Controller } from '../controller/controller'
import { Middleware } from '../middleware/middleware'
import { Request } from '../request'
import { Route } from './routes'

export interface RouteData {
  route: Route<Middleware, Controller>
  params: string[]
}

export interface IRouter {
  readonly routes: Route<Middleware, Controller>[]

  getRouteData(request: Request): RouteData
}
