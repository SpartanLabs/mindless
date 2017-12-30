import { Route } from './routes';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
import { GenericConstructor } from '../interfaces';
import { Request } from '../request/request';
import { Response } from '../response';
import { Container } from 'inversify';
import { HttpMethods } from '../request/event';


export class Router<M extends Middleware, C extends Controller, R extends Route<M, C>> {

  private middleware: GenericConstructor<M>[] = [];
  private subjectRoute: R;
  private requestPath: string;
  private requestMethod: HttpMethods;
  private pathParams: {};

  constructor(
    private request: Request,
    private container: Container
  ) { }

  public route(routes: R[]): void {
    this.requestPath = this.request.getPath()
    this.requestMethod = this.request.getRequestMethod();

    try {
      this.subjectRoute = this.getRequestRoute(routes);
    } catch (e) {
      throw e; // could not find route, lets just throw for now.
    };

    // add path params to request object
    Object.keys(this.pathParams).forEach(param => {
      this.request.add(param, this.pathParams[param]);
    });

    this.addRouteMetaDataToRequest();
    this.addMiddlewareIfExists(this.subjectRoute.middleware);
  }

  protected getRequestRoute(routes: R[]): R {

    let route = routes.find(this.isRequestedRoute);

    if (route) {
      return route;
    }

    throw Error("Could not find requested route.");
  }

  private isRequestedRoute = (route) => {
    if (route.method !== this.requestMethod) {
      return false;
    }
    let params = route.url.match(this.requestPath);
    if (params) {
      this.pathParams = params;
      return true;
    }
    return false;
  };

  /**
   * May be useful to have access to the route data
   * for extensions (Permissions/Gates wink wink)
   */
  private addRouteMetaDataToRequest() {

    let narrowedRoute: any = {};

    /**
     * controller and middleware are constructors 
     * there should be no need for them outside of this router
     */
    for (let prop in this.subjectRoute) {
      if ('undefined' !== typeof this.subjectRoute[prop] && prop != 'controller' && prop != 'middleware') {
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
      const params = Router.getParameters(subjectController[this.subjectRoute.function]); // TODO: run all this on construction maybe.
      let args = params.map(this.getArgToInject);

      let response: Response = await subjectController[this.subjectRoute.function](...args);
      return response;
    } catch (e) {
      let body = {
        'Error Message': e.message,
        'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
      };
      return new Response(500, body);
    }
  }

  private static getParameters = (func) => {
    // match everything inside the function argument parens
    let args = func.toString().match(/\(([^)]*)\)/)[1];

    return args.split(",")
      .map(arg => arg.replace(/\/\*.*\*\//, "").trim()) // get rid of inline comments, trim whitespace
      .filter(arg => arg); // dont add undefineds
  }

  private getArgToInject = (param) => {
    if (param == 'request') {
      return this.request;
    }

    try {
      return this.request.getOrFail(param);
    } catch (e) {
      const msg = "Unable to inject " + param + " into " + this.subjectRoute.controller.name
        + '.' + this.subjectRoute.function;
      throw Error(msg);
    }
  };
}