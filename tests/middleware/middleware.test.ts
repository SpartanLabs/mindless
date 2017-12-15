import { HttpMethods, Event } from '../../lib/request/event';
import { EventEmitter } from 'events';
import 'reflect-metadata';
import { Middleware } from '../../lib/middleware/middleware';
import { Readable } from 'stream';
import { Request } from '../../lib/request/request';
/*
describe('Test middleware isIndependent method', () => {

    class MiddlewareTest extends Middleware {

        public handle(request) {
            throw new Error('Not implemented yet.');
        }
    }
    test('returns true on construction', () => {

        let middlewareTest = new MiddlewareTest();

        expect(middlewareTest.isIndependent()).toBe(true);
    });
});
*/
const getEvent = (): Event => {
    return {
        headers: {},
        path: '',
        pathParameters: {},
        requestContext: {},
        resource: "",
        httpMethod: HttpMethods.Get,
        queryStringParameters: {},
        stageVariables: {},
        body: ""
    };
}

class InDependentMiddleware extends Middleware {
    protected uid: string = "indep1";

    protected handle(): Promise<string> {
        return Promise.resolve("abc");
    }
}

class DependentMiddleware1 extends Middleware {
    protected uid: string = "dep1";

    protected handle(): Promise<string> {
        return Promise.resolve("efg");
    }
}