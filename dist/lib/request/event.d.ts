export declare enum HttpMethods {
    GET = 0,
    POST = 1,
    PUT = 2,
    DELETE = 3,
    PATCH = 4,
    OPTIONS = 5,
    HEAD = 6,
}
export interface Event {
    headers: {
        [key: string]: string;
    };
    path: string;
    pathParameters: {
        [key: string]: string;
    };
    requestContext: {
        [key: string]: any;
    };
    resource: string;
    httpMethod: string;
    queryStringParameters: {
        [key: string]: any;
    };
    stageVariables: {
        [key: string]: any;
    };
    body: string;
    isOffline?: boolean;
}
