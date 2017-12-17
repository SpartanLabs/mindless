import * as console from 'console';
import { HttpMethods } from '../../lib/request/event';
import { Response } from '../../lib/response';
import 'reflect-metadata';
import { Route, Router, MindlessRoute, RouteUrl } from '../../lib/routing';
import { Controller } from '../../lib/controller/controller';
import { Middleware } from '../../lib/middleware/middleware';
import { Request } from '../../lib/request';
import { Container } from 'inversify';

import * as TypeMoq from 'typemoq';
import { ExpectedCallType } from 'typemoq/_all';

class TestController extends Controller {
    test(): Response {
        return new Response(200);
    }
    // Note: Request parameter 
    testWithRequestParam(request: Request) {
        return new Response(200, { resource: request.getResource() });
    }
    testWithPathParam(val: string): Response {
        return new Response(200, { val: val });
    }
    testWithRequestAndPathParam(request: Request, val: string) {
        const res = {
            resource: request.getResource(),
            val: val
        };
        return new Response(200, res);
    }
}

describe('Test router route method', () => {

    let requestMock = TypeMoq.Mock.ofType<Request>();
    let containerMock = TypeMoq.Mock.ofType<Container>();

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "test"
        }
    ];

    requestMock.setup(c => c.getResource()).returns(() => '/test');
    requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.GET);

    test('Throws error when route group undefined', () => {
        let router = new Router<Middleware, Controller, MindlessRoute>(requestMock.object, containerMock.object);

        expect(() => { router.route(routes) }).toThrow("Could not find requested route.");
    });
});

describe('Test router dispatchController method', () => {
    let requestMock = TypeMoq.Mock.ofType<Request>();
    let containerMock = TypeMoq.Mock.ofType<Container>();

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "test"
        }
    ];

    requestMock.setup(c => c.getResource()).returns(() => '/test');
    requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.POST);
    let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
    router.route(routes);

    test('returns response from controller', async () => {
        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
    });

    test('returns 500 response from controller on error thrown', async () => {
        containerMock.setup(c => c.resolve(TestController)).throws(new Error('Test error'));

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
            'Error Message': 'Test error',
            'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
        });
    });

});

describe('Test router dispactControlelr with path parameters', () => {

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test1'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "testWithPathParam"
        },
        {
            url: new RouteUrl('/test1/:val'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "testWithPathParam"
        },
        {
            url: new RouteUrl('/test2/:val'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "testWithRequestParam"
        },
        {
            url: new RouteUrl('/test3/:val'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "testWithRequestAndPathParam"
        },
    ];

    const valParam = 'abc';

    test('path parameter get injected', async () => {
        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.getResource()).returns(() => '/test1/' + valParam);
        requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.POST);

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.val).toBe(valParam);
    });

    test('request object get injected', async () => {
        const resource = '/test2/' + valParam;

        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.getResource()).returns(() => resource);
        requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.POST);

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.resource).toBe(resource);
    });

    test('request object and path param get injected', async () => {
        const resource = '/test3/' + valParam;

        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.getResource()).returns(() => resource);
        requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.POST);

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.resource).toBe(resource);
        expect(response.body.val).toBe(valParam);
    });

    test('throw error when cant find argument to inject into function', async () => {
        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.getResource()).returns(() => '/test1');
        requestMock.setup(c => c.getRequestMethod()).returns(() => HttpMethods.POST);

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
            'Error Message': 'Unable to inject val into TestController.testWithPathParam',
            'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
        });
    });
});