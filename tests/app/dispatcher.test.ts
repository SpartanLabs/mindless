import {HttpMethods, Request} from "../../lib/request";
import * as TypeMoq from "typemoq";
import {Container} from "inversify";
import {Route, RouteUrl} from "../../lib/routing";
import {Middleware} from "../../lib/middleware/middleware";
import {Controller} from "../../lib/controller/controller";
import {Dispatcher} from "../../lib/app/dispatcher";
import {GenericConstructor} from "../../lib/interfaces";
import {Response} from "../../lib/response";

describe('Dispatcher construction', () => {
    const requestMock = TypeMoq.Mock.ofType<Request>();
    const containerMock = TypeMoq.Mock.ofType<Container>();
    const constructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>();
    beforeEach(() => {
        requestMock.reset();
        containerMock.reset();
        constructorMock.reset();
    });

    test('dispatcher get constructed and metadata gets added', () => {
        const subject = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                controller: constructorMock.object,
                function: 'test'
            },
            params: []
        };

        const expectedRouteMetadata = {
            url: subject.route.url,
            method: subject.route.method,
            function: subject.route.function
        };

        const dispatcher = new Dispatcher(containerMock.object, requestMock.object, subject);

        expect(dispatcher).toBeInstanceOf(Dispatcher);
        requestMock.verify(r => r.RouteMetaData = TypeMoq.It.isValue(expectedRouteMetadata), TypeMoq.Times.once());
    });
});

describe('Dispatch middleware', () => {
    const requestMock = TypeMoq.Mock.ofType<Request>();
    const containerMock = TypeMoq.Mock.ofType<Container>();
    const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>();
    const middlewareConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Middleware>>();
    const middlewareMock = TypeMoq.Mock.ofType<Middleware>();
    beforeEach(() => {
        requestMock.reset();
        containerMock.reset();
        controllerConstructorMock.reset();
        middlewareConstructorMock.reset();
        middlewareMock.reset();
    });

    test('Middleware is dispatched successfully', async () => {
        const subject = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                controller: controllerConstructorMock.object,
                function: 'test',
                middleware: [middlewareConstructorMock.object]
            },
            params: []
        };

        const dispatcher = new Dispatcher(containerMock.object, requestMock.object, subject);


        // TODO: figure out how to verify the arguments of the function calls
        // cannot get it to work with the mocks.
        containerMock.setup(c => c.resolve(TypeMoq.It.isAny()))
            .returns(() => middlewareMock.object)
            .verifiable(TypeMoq.Times.once());

        middlewareMock.setup(m => m.handle(TypeMoq.It.isAny()))
            .returns(() => Promise.resolve('done'))
            .verifiable(TypeMoq.Times.once());


        const values = await dispatcher.dispatchMiddleware();

        expect(values).toHaveLength(1);
        expect(values[0]).toBe('done');

        containerMock.verifyAll();
        middlewareMock.verifyAll();
    });
});


describe('Dispatch controller', () => {
    const requestMock = TypeMoq.Mock.ofType<Request>();
    const containerMock = TypeMoq.Mock.ofType<Container>();
    const controllerConstructorMock = TypeMoq.Mock.ofType<GenericConstructor<Controller>>();
    const controllerMock = TypeMoq.Mock.ofType<Controller>();

    beforeEach(() => {
        requestMock.reset();
        containerMock.reset();
        controllerConstructorMock.reset();
        controllerMock.reset();
    });

    test('dispatch controller successfully with no parameters.', async () => {
        const subject = {
            route: {
                url: new RouteUrl(''),
                method: HttpMethods.GET,
                controller: controllerConstructorMock.object,
                function: 'test'
            },
            params: []
        };

        const dispatcher = new Dispatcher(containerMock.object, requestMock.object, subject);


        // TODO: figure out how to verify the arguments of the function calls
        // cannot get it to work with the mocks.
        containerMock.setup(c => c.resolve(TypeMoq.It.isAny()))
            .returns(() => controllerMock.object)
            .verifiable(TypeMoq.Times.once());

        controllerMock.setup(m => (<any>m).test())
            .returns(() => Promise.resolve(new Response()))
            .verifiable(TypeMoq.Times.once());


        const response: Response = await dispatcher.dispatchController();

        expect(response).toBeInstanceOf(Response);
        expect(response.statusCode).toBe(200);

        containerMock.verifyAll();
        controllerMock.verifyAll();
    });
});