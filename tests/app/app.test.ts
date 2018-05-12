import * as TypeMoq from "typemoq";
import {HttpMethods, Request} from "../../lib/request";
import {IRouter, RouteUrl} from "../../lib/routing";
import {App, Dispatcher, IApp, IContainer} from "../../lib/app";
import {GenericConstructor} from "../../lib/interfaces";
import {Middleware} from "../../lib/middleware/middleware";
import {Controller} from "../../lib/controller/controller";
import {Response} from "../../lib/response";

describe('App', () => {
    const containerMock = TypeMoq.Mock.ofType<IContainer>();
    const routerMock = TypeMoq.Mock.ofType<IRouter>();
    const genericMock = TypeMoq.Mock.ofType<GenericConstructor<string>>();
    beforeEach(() => {
        containerMock.reset();
        routerMock.reset();
        genericMock.reset();
    });

    test('App gets constructed', () => {
        const app = new App(containerMock.object, routerMock.object);
        expect(app).toBeInstanceOf(App);
    });

    test('App resolve', () => {
        const app = new App(containerMock.object, routerMock.object);

        containerMock.setup(c => c.resolve(TypeMoq.It.isAny()))
            .returns(() => 'abc')
            .verifiable(TypeMoq.Times.once());

        const str = app.resolve(genericMock.object);

        expect(str).toBe('abc');

        containerMock.verifyAll();
    });


});

describe('App handle request', () => {
    const requestMock = TypeMoq.Mock.ofType<Request>();
    const containerMock = TypeMoq.Mock.ofType<IContainer>();
    const routerMock = TypeMoq.Mock.ofType<IRouter>();
    const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>();
    const middlewareConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Middleware>>();
    const dispatchMiddlewareMock = TypeMoq.Mock.ofInstance(Dispatcher.dispatchMiddleware);
    const dispatchControllerMock = TypeMoq.Mock.ofInstance(Dispatcher.dispatchController);
    beforeEach(() => {
        requestMock.reset();
        containerMock.reset();
        routerMock.reset();
        controllerConstructorMock.reset();
        middlewareConstructorMock.reset();
        dispatchMiddlewareMock.reset();
        dispatchControllerMock.reset();
    });

    test('successfully handle request', async () => {
        const app = new App(containerMock.object, routerMock.object);


        Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object;
        Dispatcher.dispatchController = dispatchControllerMock.object;

        const data = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                function: 'test',
                controller: controllerConstructorMock.object,
                middleware: [middlewareConstructorMock.object],
            },
            params: []
        };


        routerMock.setup(r => r.getRouteData(requestMock.object))
            .returns(() => data)
            .verifiable(TypeMoq.Times.once());

        dispatchMiddlewareMock.setup(m => m(containerMock.object, requestMock.object, data.route.middleware))
            .verifiable(TypeMoq.Times.once());

        dispatchControllerMock.setup(c => c(containerMock.object, requestMock.object, data.route, data.params))
            .returns(() => Promise.resolve(new Response()))
            .verifiable(TypeMoq.Times.once());

        const response = await app.handleRequest(requestMock.object);

        expect(response).toBeInstanceOf(Response);
        expect(response.statusCode).toBe(200);

        routerMock.verifyAll();
        dispatchMiddlewareMock.verifyAll();
        dispatchControllerMock.verifyAll();
    });

    test('error nonprod', async () => {
        const app = new App(containerMock.object, routerMock.object);

        Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object;
        Dispatcher.dispatchController = dispatchControllerMock.object;

        const data = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                function: 'test',
                controller: controllerConstructorMock.object,
                middleware: [middlewareConstructorMock.object],
            },
            params: []
        };

        const errorMsg = 'error message with potentially sensitive info';

        routerMock.setup(r => r.getRouteData(requestMock.object))
            .returns(() => data)
            .verifiable(TypeMoq.Times.once());

        dispatchMiddlewareMock.setup(m => m(containerMock.object, requestMock.object, data.route.middleware))
            .verifiable(TypeMoq.Times.once());

        dispatchControllerMock.setup(c => c(containerMock.object, requestMock.object, data.route, data.params))
            .throws(new Error(errorMsg))
            .verifiable(TypeMoq.Times.once());

        process.env.NODE_ENV = 'nonprod';

        const response = await app.handleRequest(requestMock.object);
        expect(response).toBeInstanceOf(Response);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe(errorMsg);

        routerMock.verifyAll();
        dispatchMiddlewareMock.verifyAll();
        dispatchControllerMock.verifyAll();
    });

    test('error prod', async () => {
        const app = new App(containerMock.object, routerMock.object);

        Dispatcher.dispatchMiddleware = dispatchMiddlewareMock.object;
        Dispatcher.dispatchController = dispatchControllerMock.object;

        const data = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                function: 'test',
                controller: controllerConstructorMock.object,
                middleware: [middlewareConstructorMock.object],
            },
            params: []
        };

        const errorMsg = 'error message with potentially sensitive info';

        routerMock.setup(r => r.getRouteData(requestMock.object))
            .returns(() => data)
            .verifiable(TypeMoq.Times.once());

        dispatchMiddlewareMock.setup(m => m(containerMock.object, requestMock.object, data.route.middleware))
            .verifiable(TypeMoq.Times.once());

        dispatchControllerMock.setup(c => c(containerMock.object, requestMock.object, data.route, data.params))
            .throws(new Error(errorMsg))
            .verifiable(TypeMoq.Times.once());

        process.env.NODE_ENV = 'prod';

        const response = await app.handleRequest(requestMock.object);
        expect(response).toBeInstanceOf(Response);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('failed to return a response');

        routerMock.verifyAll();
        dispatchMiddlewareMock.verifyAll();
        dispatchControllerMock.verifyAll();
    });
});