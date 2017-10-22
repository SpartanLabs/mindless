export declare enum HttpMethods {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Delete = "DELETE",
    Patch = "PATCH",
    Options = "OPTIONS",
    Head = "HEAD",
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
