import {Request} from "../request";
import {Middleware} from "../middleware/middleware";
import {Controller} from "../controller/controller";
import {GenericConstructor} from "../interfaces";
import {Route} from "../routing";
import {Response} from "../response";

export interface IApp {
    resolve<T>(constructor: GenericConstructor<T>): T;
    handleRequest(request: Request): Promise<Response>;
}