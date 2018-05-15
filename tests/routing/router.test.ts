import {HttpMethods, Request} from '../../src/request';
import {Response} from '../../src/response';
import {Router, MindlessRoute, RouteUrl} from '../../src/routing';
import {Controller} from '../..';
import {Middleware} from '../..';

import * as TypeMoq from 'typemoq';

class TestController extends Controller {
    test(): Response {
        return new Response(200);
    }

    // Note: Request parameter
    testWithRequestParam(request: Request) {
        return new Response(200, {resource: request.path});
    }

    testWithPathParam(val: string): Response {
        return new Response(200, {val: val});
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

        expect(() => {
            router.getRouteData(requestMock.object)
        }).toThrow("Could not find requested route.");
    });

    test('Throws error when route group undefined (path mismatch)', () => {

        requestMock.setup(c => c.path).returns(() => '/blah');
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST);

        expect(() => {
            router.getRouteData(requestMock.object)
        }).toThrow("Could not find requested route.");
    });

    test('Finds the correct route and returns the route object and no parameters', () => {

        const expectedRouteMetadata = {
            url: routes[0].url,
            method: routes[0].method,
            function: routes[0].function
        };

        requestMock.setup(c => c.path).returns(() => '/test').verifiable(TypeMoq.Times.once());
        requestMock.setup(c => c.method).returns(() => HttpMethods.POST).verifiable(TypeMoq.Times.once());
        requestMock.setup(r => r.RouteMetaData = TypeMoq.It.isValue(expectedRouteMetadata)).verifiable(TypeMoq.Times.once());

        const data = router.getRouteData(requestMock.object);

        expect(data.route).toEqual(routes[0]);
        expect(data.params.length).toEqual(0);

        requestMock.verifyAll();
    });

    test('Finds the correct route and returns the route object with parameters', () => {
        requestMock.setup(c => c.path).returns(() => '/test');
        requestMock.setup(c => c.method).returns(() => HttpMethods.PUT);

        const data = router.getRouteData(requestMock.object);

        expect(data.route).toEqual(routes[1]);
        expect(data.params.length).toEqual(1);
        expect(data.params[0]).toEqual('val');
    });
    
    test('get routes', () => {
       expect(router.routes).toHaveLength(2);
       expect(router.routes).toEqual(routes);
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