import { Route } from './routes';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { Request } from '../request/request';
import { Response } from '../response';
import { Container } from 'inversify';
export declare class Router<M extends Middleware, C extends Controller, R extends Route<M, C>> {
    private request;
    private container;
    private middleware;
    private subjectRoute;
    private requestRoute;
    private requestMethod;
    private pathParams;
    constructor(request: Request, container: Container);
    route(routes: R[]): void;
    protected getRequestRoute(routes: R[]): R;
    private addRouteMetaDataToRequest();
    private addMiddlewareIfExists(middleware);
    dispatchMiddleware(): Promise<any>;
    dispatchController(): Promise<Response>;
}
