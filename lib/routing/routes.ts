import { extname } from 'path';
import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';

export interface Route<M, C>  {
  controller: GenericConstructor<C>,
  function: string,
  middleware?: GenericConstructor<M>[]
}

export interface Routes<M, C, R extends Route<M,C>>  {
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

export type MindlessRoutes = Routes<Middleware, Controller, Route<Middleware, Controller>>;