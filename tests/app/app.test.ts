import * as TypeMoq from "typemoq";
import {Request} from "../../lib/request";
import {IRouter} from "../../lib/routing";
import {App, IApp, IContainer} from "../../lib/app";
import {GenericConstructor} from "../../lib/interfaces";

describe('App', () => {
    const requestMock = TypeMoq.Mock.ofType<Request>();
    const containerMock = TypeMoq.Mock.ofType<IContainer>();
    const routerMock = TypeMoq.Mock.ofType<IRouter>();
    const genericMock = TypeMoq.Mock.ofType<GenericConstructor<string>>();
    beforeEach(() => {
        requestMock.reset();
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

    test('Handle Request', () => {
        const app = new App(containerMock.object, routerMock.object);

        routerMock.setup(r => r.getRouteData(requestMock.object))
            .returns({})
    });
});