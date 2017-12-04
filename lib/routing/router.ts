import { Routes, Route } from './routes';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { GenericConstructor } from '../interfaces';
import { Request } from '../request/request';
import { Response } from '../response';
import { Container } from 'inversify';


export class Router<M extends Middleware, C extends Controller, R extends Route<M, C>> {

  private middleware: GenericConstructor<M>[] = [];
  private subjectRoute: Route<M, C>;

  constructor(
    private request: Request,
    private container: Container
  ) { }

  public route(routes: Routes<M, C, R>): void {
    let requestRoute: string = this.request.getResource()
    let requestMethod: string = this.request.getRequestMethod();
    let routeGroup = routes.routes[requestRoute];

    this.addMiddlewareIfExists(routes.middleware);
    this.addMiddlewareIfExists(routeGroup.middleware);

    if (routeGroup[requestMethod] === undefined) {
      // error route does not exists;
      throw Error("Request method, '" + requestMethod
        + ", does not exists on route, " + requestRoute + "'.");
    }

    this.subjectRoute = routeGroup[requestMethod];

    this.addRouteMetaDataToRequest();

    this.addMiddlewareIfExists(this.subjectRoute.middleware);
  }

  /**
   * May be useful to have access to the route data
   * for extensions (Permissions/Gates wink wink)
   */
  private addRouteMetaDataToRequest() {

    let narrowedRoute = {};

    /**
     * controller and middleware are constructors 
     * there should be no need for them outside of this router
     */
    for (let prop in this.subjectRoute) {
      if (this.subjectRoute.hasOwnProperty(prop) && prop != 'controller' && prop != 'middleware') {
        narrowedRoute[prop] = this.subjectRoute[prop];
      }
    }

    this.request.RouteMetaData = narrowedRoute;
  }

  private addMiddlewareIfExists(middleware: GenericConstructor<M>[] | undefined): void {
    if (middleware !== undefined) {
      this.middleware = this.middleware.concat(middleware);
    }
  }


  public dispatchMiddleware(): Promise<any> {
    const promises: Promise<any>[] = this.middleware.map(constructor => this.container.resolve(constructor))
      .map(object => object.handle(this.request));
    
      return Promise.all(promises);
  }

  public async dispatchController(): Promise<Response> {
    try {
      let subjectController: C = this.container.resolve(this.subjectRoute.controller);
      let response: Response = await subjectController[this.subjectRoute.function](this.request);
      return response;
    } catch (e) {
      let body = {
        'Error Message': e.message,
        'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
      };
      return new Response(500, body);
    }
  }
}