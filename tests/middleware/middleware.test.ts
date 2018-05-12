import 'reflect-metadata';

import { Middleware } from '../..';
import { Request, Event } from '../../src/request';

const getEvent = (): Event => {
    return {
        headers: {},
        path: '',
        pathParameters: {},
        requestContext: {},
        resource: "",
        httpMethod: "GET",
        queryStringParameters: {},
        stageVariables: {},
        body: ""
    };
}

class TestMiddleware extends Middleware {
    public handle(request: Request) {
        return Promise.resolve();
    }
}


describe("Test Middleware Construction, just want travis to pass lol", () => {
    test("should create TestMiddleware", () => {
        let middleware = new TestMiddleware();
        expect(middleware instanceof Middleware).toBeTruthy();
    });
});
