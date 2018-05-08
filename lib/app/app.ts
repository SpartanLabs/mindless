import {Container} from "inversify";
import {GenericConstructor} from "../interfaces";
import {Middleware} from "../middleware/middleware";
import {Controller} from "../controller/controller";
import {Router, Route} from "../routing";
import {Request} from "../request";

export interface IApp {

}

class MindlessApp implements IApp {

    protected container: Container;

    constructor() {
        this.container = new Container();
    }

    register(action) {
        action(this.container);
    }

    resolve<T>(constructor: GenericConstructor<T>): T {
        return this.container.resolve(constructor);
    }

    getRouter<M extends Middleware, C extends Controller, R extends Route<M, C>>(request: Request) {
        return new Router<M, C, R>(request, this.container);
    }
}

export const App: IApp = new MindlessApp();