import { GenericConstructor } from '../interfaces'
import { Middleware } from '../middleware/middleware'
import { Controller } from '../controller/controller'
import { HttpMethods } from '../request'
import { RouteUrl } from './route-url'

export interface Route<M extends Middleware, C extends Controller> {
  url: RouteUrl
  method: HttpMethods
  controller: GenericConstructor<C>
  function: string
  middleware?: GenericConstructor<M>[]
}
export type MindlessRoute = Route<Middleware, Controller>
