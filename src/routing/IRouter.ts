import { Controller } from '../controller/controller'
import { Middleware } from '../middleware/middleware'
import { RequestEvent } from '../request/request-event'
import { Route } from './routes'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type RouteMetadata<
  TRoute extends Route<Middleware, Controller> = Route<Middleware, Controller>
> = Omit<TRoute, 'controller' | 'middleware'>

export interface RouteData<
  TRoute extends Route<Middleware, Controller> = Route<Middleware, Controller>
> {
  route: TRoute
  metadata: RouteMetadata<TRoute>
  pathParameters: ReadonlyMap<string, string>
  methodParameters: string[]
}

export interface IRouter<
  TRoute extends Route<Middleware, Controller> = Route<Middleware, Controller>
> {
  readonly routes: TRoute[]

  getRouteData(request: RequestEvent): RouteData<TRoute>
}
