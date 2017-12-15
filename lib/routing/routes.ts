import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';


export interface Route<M extends Middleware, C extends Controller>  {
  controller: GenericConstructor<C>,
  function: string,
  middleware?: GenericConstructor<M>[]
}

export interface Routes<M extends Middleware, C extends Controller, R extends Route<M,C>>  {
  middleware?: GenericConstructor<M>[],
  routes: {
    [key: string]: {
      middleware?: GenericConstructor<M>[],
      post?: R,
      get?: R,
      put?: R,
      delete?: R
    }
  }
}

export type MindlessRoute = Route<Middleware, Controller>;
export type MindlessRoutes = Routes<Middleware, Controller, MindlessRoute>; 