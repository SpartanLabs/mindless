export declare class Response {
    statusCode: number;
    body: {
        [key: string]: any;
    };
    headers: {
        [key: string]: string;
    };
    constructor(statusCode?: number, body?: {
        [key: string]: any;
    }, headers?: {
        [key: string]: string;
    });
}
