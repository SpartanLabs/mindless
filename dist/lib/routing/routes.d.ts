import { GenericConstructor } from '../interfaces';
import { Middleware } from '../middleware/middleware';
import { Controller } from '../controller/controller';
export declare type Route<M, C> = {
    controller: GenericConstructor<C>;
    function: string;
    middleware?: GenericConstructor<M>[];
};
export declare type MindlessRoutes = Routes<Middleware, Controller>;
export declare type Routes<M, C> = {
    middleware?: GenericConstructor<M>[];
    routes: {
        [key: string]: {
            middleware?: GenericConstructor<M>[];
            post?: Route<M, C>;
            get?: Route<M, C>;
            put?: Route<M, C>;
            delete?: Route<M, C>;
        };
    };
};
