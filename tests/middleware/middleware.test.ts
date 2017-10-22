import { Middleware } from '../../lib/middleware/middleware';

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