import {Middleware} from "../middleware/middleware";
import {Controller} from "../controller/controller";
import {Route} from "../routing";
import {Request} from "../request";
import {Container} from "inversify";
import {Response} from "../response";

export class Dispatcher {

    protected subjectRoute: Route<Middleware, Controller>;
    protected pathParameters: string[];

    constructor(
        private container: Container,
        protected request: Request,
        subject: {route: Route<Middleware, Controller>, params: string[]}

    ) {
        this.subjectRoute = subject.route;
        this.pathParameters = subject.params;
        this.addRouteMetaDataToRequest();
    }

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
            if ('undefined' !== typeof this.subjectRoute[prop] && prop !== 'controller' && prop !== 'middleware') {
                narrowedRoute[prop] = this.subjectRoute[prop];
            }
        }
        this.request.RouteMetaData = narrowedRoute;
    }

    public dispatchMiddleware(): Promise<any[]> {
        const middleware = this.subjectRoute.middleware || [];
        const promises: Promise<any>[] = middleware.map(constructor => this.container.resolve(constructor))
            .map(object => object.handle(this.request));

        return Promise.all(promises);
    }

    public async dispatchController(): Promise<Response> {

        try {
            let subjectController: Controller = this.container.resolve(this.subjectRoute.controller);
            let args = this.pathParameters.map(this.getArgToInject);

            return await subjectController[this.subjectRoute.function](...args);
        } catch (e) {
            let body = {
                'Error Message': e.message,
                'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
            };
            return new Response(500, body);
        }
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