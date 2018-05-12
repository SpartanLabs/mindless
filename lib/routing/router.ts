import {Route} from './routes';
import {Middleware} from '../middleware/middleware';
import {Controller} from '../controller/controller';
import {Request} from '../request';
import {IRouter} from "./IRouter";


export class Router<M extends Middleware, C extends Controller, R extends Route<M, C>> implements IRouter {

    /**
     * Map that keeps a cache of the names of parameters each controller function requires
     * `key` is of the form <controller-name>-<method-name>
     * The value is an ordered array of required parameters for the method
     */
    protected methodParameterCache: {[key: string]: string[]} = {};

    constructor(protected _routes: R[]) { }

    get routes(): R[] {
        return this._routes;
    }

    /**
     *
     * @param {Request} request
     * @returns:
     *  route: the target route object
     *  params: the required parameters for the controller function in the route object
     */
    public getRouteData(request: Request): {route: R, params: string[]} {

        const route: R = this.getRequestedRoute(request);

        const params = this.getMethodParameters(route);

        return {route, params};
    }

    protected getRequestedRoute(request: Request): R {

        const isRequestedRoute = (route) => {
            if (route.method !== request.method) {
                return false;
            }
            let params = route.url.match(request.path);
            if (params) {
                request.addMultiple(params);
                return true;
            }
            return false;
        };

        let route = this._routes.find(isRequestedRoute);

        if (route) {
            return route;
        }

        throw Error("Could not find requested route.");
    }

    protected getMethodParameters(route: R) {
        const key = `${route.controller.name}-${route.function}`;

        if (this.methodParameterCache[key] === undefined) {
            this.methodParameterCache[key] = Router.getParameters(route.controller.prototype[route.function]);
        }

        return this.methodParameterCache[key];
    }

    private static getParameters(func) {
        // match everything inside the function argument parens
        let args = func.toString().match(/\(([^)]*)\)/)[1];

        return args.split(",")
            .map(arg => arg.replace(/\/\*.*\*\//, "").trim()) // get rid of inline comments, trim whitespace
            .filter(arg => arg); // dont add undefineds
    }
}
