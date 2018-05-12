import {GenericConstructor} from "../interfaces";
import {Request} from "../request";
import {Dispatcher} from "./dispatcher";
import {Response} from "../response";
import {IContainer} from "./IContainer";
import {IRouter} from "../routing";
import {IApp} from "./IApp";


export class App implements IApp {

    constructor(protected container: IContainer, protected router: IRouter) {
    }

    resolve<T>(constructor: GenericConstructor<T>): T {
        return this.container.resolve(constructor);
    }

    async handleRequest(request: Request): Promise<Response> {
        // TODO: better response.
        try {
            const data = this.router.getRouteData(request);
            await Dispatcher.dispatchMiddleware(this.container, request, data.route.middleware || []);
            return await Dispatcher.dispatchController(this.container, request, data.route, data.params);
        } catch (e) {
            if (process.env.NODE_ENV === 'prod') {
                console.log('error in MindlessApp.handleRequest: ', e);
                return new Response(500, {error: 'failed to return a response'})
            }
            return new Response(500, e);
        }
    }
}