import {Request} from "../request";
import {GenericConstructor} from "../interfaces";
import {Response} from "../response";

export interface IApp {
    resolve<T>(constructor: GenericConstructor<T>): T;
    handleRequest(request: Request): Promise<Response>;
}