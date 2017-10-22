import { Request } from '../../lib/request';
import { Event, HttpMethods } from '../../lib/request/event';

import * as TypeMoq from 'typemoq';

function getEvent(): Event {
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


describe('Test request constructor', () => {
    // construct an event object
    // no need to mock just a DTO essentially
    // const eventMock: TypeMoq.IMock<Event> = TypeMoq.Mock.ofType(Event);
    const localEvent: Event = getEvent(); // default event with no data.

    test('empty event', () => {
        let request = new Request(localEvent);
        expect(request.getResource()).toBe("");
        expect(request.getRequestMethod()).toBe('get');
    });

    test('successfully parses json event body', () => {
        let eventWithBody = localEvent;
        let body = {
            name: "zach",
            number: 12345,
            things: ['a', 'b', 'c']
        };
        eventWithBody.body = JSON.stringify(body);

        let request = new Request(eventWithBody);


        expect(request.get('name')).toBe("zach");
        expect(request.get('number')).toBe(12345);
        expect(request.get('things')).toEqual(['a','b','c']);
    });

    // needed to not break Request.get()
    test('defaults pathParameters, queryStringParameters and headers if null', () => {
        let defaultEvent = localEvent;
        defaultEvent.pathParameters = null;
        defaultEvent.queryStringParameters = null;
        defaultEvent.headers = null;

        let request = new Request(defaultEvent);
        expect(() => {request.get('abc')}).toThrow(/key not found/);
    });
});

describe('Test request get method', () => {
    const localEvent = getEvent(); 
    test('get path parameters', () => {
        let defaultEvent = Object.assign({}, localEvent);
        defaultEvent.pathParameters['param'] = 'abc';
        let request = new Request(defaultEvent);

        let actualRetrievedValue = request.get('param');

        expect(actualRetrievedValue).toBe('abc');
    });

    test('get query string parameters', () => {
        let defaultEvent = getEvent(); 
        defaultEvent.queryStringParameters['param'] = 'abc';
        
        let request = new Request(defaultEvent);

        let actualRetrievedValue = request.get('param');

        expect(actualRetrievedValue).toBe('abc');
    });
    
    test('get body  parameters', () => {
        let defaultEvent = getEvent(); 
      
        defaultEvent.body = JSON.stringify({'param': 'abc'});

        let request = new Request(defaultEvent);

        let actualRetrievedValue = request.get('param');

        expect(actualRetrievedValue).toBe('abc');
    });

    test('invalid key', () => {
        let defaultEvent = getEvent(); 
        defaultEvent.pathParameters['test'] = 'abc';
        defaultEvent.queryStringParameters['testb'] = 'abc';
        defaultEvent.body = JSON.stringify({'testc': 'abc'});

        let request = new Request(defaultEvent);

        expect(() => {request.get('abc')}).toThrow(/key not found/);
    })
});

describe('Test request header', () => {
    test('invalid key', () => {
        let event = getEvent();
        let request = new Request(event);

        expect(() => {request.header('abc')}).toThrow(/key not found/);
    });

    test('retrieve header value', () => {
        let event = getEvent();
        event.headers['test'] = 'val';

        let request = new Request(event);

        expect(request.header('test')).toBe('val');
    });
});

describe('Test request add method', () => {
    
    let event = getEvent();
    let request = new Request(event);
    
    test('Add new key,val pair', () => {
       request.add('abc', 'val');
       let retrievedVal = request.get('abc');
       
       expect(retrievedVal).toBe('val');
    });

    test('Add new key,val pair with already existing key', () => {
        
        let addKeyAlreadyExists = () => {
            request.add('abc', 'val2');
        };

        expect(addKeyAlreadyExists).toThrow(/key 'abc' already exists/);
        expect(request.get('abc')).toBe('val')
    })

    test('Add new key,val pair with already existing key and overwrite set to true', () => {

        request.add('abc', 'val3', true);

        expect(request.get('abc')).toBe('val3');
    });
});
