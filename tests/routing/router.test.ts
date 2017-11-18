import { Response } from '../../lib/response';
import 'reflect-metadata';
import { MindlessRoutes } from '../../lib/routing/routes';
import { Route, Router } from '../../lib/routing';
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
}

describe('Test router route method', () => {

    let requestMock = TypeMoq.Mock.ofType<Request>();
    let containerMock = TypeMoq.Mock.ofType<Container>();

    let routes: MindlessRoutes = {
        middleware: [],
        routes: {
            "/test": {
                middleware: [],
                post: { controller: TestController, function: "test", middleware: [] }
            }
        }
    };

    requestMock.setup(c => c.getResource()).returns(() => '/test');
    requestMock.setup(c => c.getRequestMethod()).returns(() => 'get');

    test('Throws error when route group undefined', () => {
        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);

        expect(() => { router.route(routes) }).toThrow('get, does not exists on route, /test');
    });
});

describe('Test router dispatchController method', () => {
    let requestMock = TypeMoq.Mock.ofType<Request>();
    let containerMock = TypeMoq.Mock.ofType<Container>();

    let routes: MindlessRoutes = {
        routes: {
            "/test": {
                middleware: [],
                post: { controller: TestController, function: "test", middleware: [] }
            }
        }
    };

    requestMock.setup(c => c.getResource()).returns(() => '/test');
    requestMock.setup(c => c.getRequestMethod()).returns(() => 'post');
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

describe('Test router dispatchMiddleware method', () => {

    class TestMiddleware extends Middleware {
        public handle(request) {
            console.log('really????');
            Promise.reject(new Response(200, { 'msg': 'rejected' }));
        }
    }

    let requestMock = TypeMoq.Mock.ofType<Request>();
    let containerMock = TypeMoq.Mock.ofType<Container>();
    let middlewareMock = TypeMoq.Mock.ofType<TestMiddleware>();

    let routes: MindlessRoutes = {
        routes: {
            "/test": {
                middleware: [],
                post: { controller: TestController, function: "test", middleware: [TestMiddleware] }
            }
        }
    };

    requestMock.setup(c => c.getResource()).returns(() => '/test');
    requestMock.setup(c => c.getRequestMethod()).returns(() => 'post');
    containerMock.setup(c => c.resolve(TestMiddleware)).returns(() => middlewareMock.object);

    test('returns response from controller', () => {
        let router = new Router<Middleware, Controller, Route<Middleware, Controller>>(requestMock.object, containerMock.object);
        router.route(routes);


        let isRejected = false;
        expect(router.dispatchMiddleware()).rejects.toEqual(
            {
                statusCode: 200,
                body: {
                    msg: 'rejected'
                }
            }
        );

        middlewareMock.verify(c => c.handle(TypeMoq.It.isAny()), TypeMoq.Times.once());
    });
});
