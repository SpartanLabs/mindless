import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { HttpMethods } from '../request';
import * as RPRoute from 'route-parser';

// don't want to tie user code to route-parser.
// this allows us to change with out requiring usrs to.
export class RouteUrl extends RPRoute {

}

export interface Route<M extends Middleware, C extends Controller> {
  url: RouteUrl,
  method: HttpMethods,
  controller: GenericConstructor<C>,
  function: string,
  middleware?: GenericConstructor<M>[]
}
export type MindlessRoute = Route<Middleware, Controller>;

