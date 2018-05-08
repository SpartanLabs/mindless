import 'reflect-metadata';
import { HttpMethods, Request } from '../../lib/request';
import { Response } from '../../lib/response';
import { Router, MindlessRoute, RouteUrl } from '../../lib/routing';
import { Controller } from '../..';
import { Middleware } from '../..';

import * as TypeMoq from 'typemoq';

class TestController extends Controller {
    test(): Response {
        return new Response(200);
    }
    // Note: Request parameter 
    testWithRequestParam(request: Request) {
        return new Response(200, { resource: request.path });
    }
    testWithPathParam(val: string): Response {
        return new Response(200, { val: val });
    }
    testWithRequestAndPathParam(request: Request, val: string) {
        const res = {
            resource: request.path,
            val: val
        };
        return new Response(200, res);
    }
}

describe('Router getRequestRoute returns the correct route and parameters', () => {

    let requestMock = TypeMoq.Mock.ofType<Request>();

    beforeEach(() => {
        requestMock.reset();
    });

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "test"
        },
        {
            url: new RouteUrl('/test'),
            method: HttpMethods.PUT,
            controller: TestController,
            middleware: [],
            function: "testWithPathParam"
        }
    ];

    const router = new Router<Middleware, Controller, MindlessRoute>(routes);

    test('Throws error when route group undefined (method mismatch)', () => {

        requestMock.setup(c => c.path).returns(() => '/test');
        requestMock.setup(c => c.method).returns(() => HttpMethods.GET);

        expect(() => { router.getRouteData(requestMock.object) }).toThrow("Could not find requested route.");
    });

    test('Throws error when route group undefined (path mismatch)', () => {

        requestMock.setup(c => c.path).returns(() => '/blah');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        expect(() => { router.getRouteData(requestMock.object) }).toThrow("Could not find requested route.");
    });

    test('Finds the correct route and returns the route object and no parameters', () => {
        requestMock.setup(c => c.path).returns(() => '/test');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        const data = router.getRouteData(requestMock.object);

        expect(data.route).toEqual(routes[0]);
        expect(data.params.length).toEqual(0);
    });

    test('Finds the correct route and returns the route object with parameters', () => {
        requestMock.setup(c => c.path).returns(() => '/test');
        requestMock.setup(c => c.method).returns(() => HttpMethods.PUT);

        const data = router.getRouteData(requestMock.object);

        expect(data.route).toEqual(routes[1]);
        expect(data.params.length).toEqual(1);
        expect(data.params[0]).toEqual('val');
    });
});

describe('Router add all path parameters to the request', () => {
    let requestMock = TypeMoq.Mock.ofType<Request>();

    beforeEach(() => {
        requestMock.reset();
    });

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test/:id/:name'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "test"
        }
    ];

    const router = new Router<Middleware, Controller, MindlessRoute>(routes);

    test('Finds the correct route and returns the route object with parameters', () => {
        requestMock.setup(c => c.path).returns(() => '/test/123/abc');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        const data = router.getRouteData(requestMock.object);
        const expectedParams = {
            id: '123',
            name: 'abc'
        };

        requestMock.verify(r => r.addMultiple(TypeMoq.It.isObjectWith(expectedParams)), TypeMoq.Times.once());

        expect(data.route).toEqual(routes[0]);
    });
});
/*
describe('Router caches method parameter mappings', () => {
    let requestMock = TypeMoq.Mock.ofType<Request>();

    let routes: MindlessRoute[] = [
        {
            url: new RouteUrl('/test'),
            method: HttpMethods.POST,
            controller: TestController,
            middleware: [],
            function: "testWithPathParam"
        }
    ];


    beforeEach(() => {
        requestMock.reset();
       // spy.mockReset();
       // spy.mockRestore();
    });

    const router = new Router<Middleware, Controller, MindlessRoute>(routes);


    // const spy = jest.spyOn(Router.prototype, 'getParameters');
    test('only parses and function once', () => {

        requestMock.setup(c => c.path).returns(() => '/test');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        requestMock.verify(r => r.addMultiple(TypeMoq.It.isObjectWith(expectedParams)), TypeMoq.Times.once());
        const data1 = router.getRouteData(requestMock.object);
        const data2 = router.getRouteData(requestMock.object);

        // expect(spy).toHaveBeenCalledTimes(1);
    });
});*/
/*

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

    requestMock.setup(c => c.path).returns(() => '/test');
    requestMock.setup(c => c.method).returns(() => HttpMethods.POST);
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

    test('path parameter get injected', async () => {

        const routes: MindlessRoute[] = [
            {
                url: new RouteUrl('/test1/:val'),
                method: HttpMethods.POST,
                controller: TestController,
                middleware: [],
                function: "testWithPathParam"
            }
        ];

        const valParam = 'abc';

        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(r => r.path).returns(() => '/test1/' + valParam);
        requestMock.setup(r => r.method).returns(() => HttpMethods.POST);
        requestMock.setup(r => r.getOrFail('val')).returns(() => valParam);
        requestMock.setup(r => r.add('val', 'abc', true)).verifiable(TypeMoq.Times.once());

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.val).toBe(valParam);
        requestMock.verifyAll();
    });

    test('request object get injected', async () => {
        let routes: MindlessRoute[] = [
            {
                url: new RouteUrl('/test2/:val'),
                method: HttpMethods.POST,
                controller: TestController,
                middleware: [],
                function: "testWithRequestParam"
            }
        ];

        const valParam = 'abc';
        const resource = '/test2/' + valParam;

        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.path).returns(() => resource);
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.resource).toBe(resource);
    });

    test('request object and path param get injected', async () => {
        let routes: MindlessRoute[] = [
            {
                url: new RouteUrl('/test3/:val'),
                method: HttpMethods.POST,
                controller: TestController,
                middleware: [],
                function: "testWithRequestAndPathParam"
            },
        ];
        const valParam = 'abc'; const resource = '/test3/' + valParam;

        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.path).returns(() => resource);
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);
        requestMock.setup(r => r.getOrFail('val')).returns(() => valParam);
        requestMock.setup(r => r.add('val', 'abc', true)).verifiable(TypeMoq.Times.once());

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.resource).toBe(resource);
        expect(response.body.val).toBe(valParam);
        requestMock.verifyAll();
    });

    test('throw error when cant find argument to inject into function', async () => {
        let routes: MindlessRoute[] = [
            {
                url: new RouteUrl('/test1'),
                method: HttpMethods.POST,
                controller: TestController,
                middleware: [],
                function: "testWithPathParam"
            },
        ];
        const valParam = 'abc';
        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.path).returns(() => '/test1');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);
        requestMock.setup(r => r.getOrFail('val')).returns(() => { throw Error() }).verifiable(TypeMoq.Times.once());
        requestMock.setup(r => r.add('val', 'abc')).verifiable(TypeMoq.Times.never());

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
            'Error Message': 'Unable to inject val into TestController.testWithPathParam',
            'Mindless Message': 'Unable to resolve requested controller or method make sure your routes are configured properly'
        });
        requestMock.verifyAll();
    });

    test('query params are injected', async () => {
        let routes: MindlessRoute[] = [
            {
                url: new RouteUrl('/test1?val=:val'),
                method: HttpMethods.POST,
                controller: TestController,
                middleware: [],
                function: "testWithPathParam"
            },
        ];
        const valParam = 'abc';
        let requestMock = TypeMoq.Mock.ofType<Request>();
        let containerMock = TypeMoq.Mock.ofType<Container>();

        requestMock.setup(c => c.path).returns(() => '/test1?val=' + valParam);
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);
        requestMock.setup(r => r.getOrFail('val')).returns(() => valParam ).verifiable(TypeMoq.Times.once());
        requestMock.setup(r => r.add('val', 'abc', true)).verifiable(TypeMoq.Times.once());

        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);

        containerMock.setup(c => c.resolve(TestController)).returns(() => new TestController());

        let response = await router.dispatchController();

        expect(response.statusCode).toBe(200);
        expect(response.body.val).toBe(valParam);

        requestMock.verifyAll();
    });
});*/