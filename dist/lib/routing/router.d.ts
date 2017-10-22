import { Routes } from './routes';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { Request } from '../request/request';
import { Response } from '../response';
import { Container } from 'inversify';
export declare class Router<M extends Middleware, C extends Controller> {
    private request;
    private container;
    private middleware;
    private subjectRoute;
    constructor(request: Request, container: Container);
    route(routes: Routes<M, C>): void;
    private addMiddlewareIfExists(middleware);
    dispatchMiddleware(): void;
    dispatchController(): Promise<Response>;
}
