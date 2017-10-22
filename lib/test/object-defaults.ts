import { Event, HttpMethods } from '../request/event';


export function getEvent(): Event {
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