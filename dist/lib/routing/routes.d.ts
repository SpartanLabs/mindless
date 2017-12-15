import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { HttpMethods } from '../request/event';
import * as RPRoute from 'route-parser';
export declare class RouteUrl extends RPRoute {
}
export interface Route<M extends Middleware, C extends Controller> {
    url: RouteUrl;
    method: HttpMethods;
    controller: GenericConstructor<C>;
    function: string;
    middleware?: GenericConstructor<M>[];
}
export declare type MindlessRoute = Route<Middleware, Controller>;
