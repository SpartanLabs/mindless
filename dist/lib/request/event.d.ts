export declare enum HttpMethods {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
    HEAD
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
    httpMethod: HttpMethods;
    queryStringParameters: {
        [key: string]: any;
    };
    stageVariables: {
        [key: string]: any;
    };
    body: string;
    isOffline?: boolean;
}
