import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
// type Routes<M extends Middleware, C extends Controller> = {

export type Route<M, C> = {
  controller: GenericConstructor<C>,
  function: string,
  middleware?: GenericConstructor<M>[]
}

export type MindlessRoutes = Routes<Middleware, Controller>;

export type Routes<M, C> = {
  middleware?: GenericConstructor<M>[],
  routes: {
    [key: string]: {
      middleware?: GenericConstructor<M>[],
      post?: Route<M, C>,
      get?: Route<M, C>,
      put?: Route<M, C>,
      delete?: Route<M, C>
    }
  }
}