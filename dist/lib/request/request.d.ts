import { Event, HttpMethods } from './event';
import { IRequest } from './request-interface';
export declare class Request implements IRequest {
    protected event: Event;
    protected _body: {
        [key: string]: any;
    };
    RouteMetaData: any;
    constructor(event: Event);
    getResource(): string;
    getRequestMethod(): HttpMethods;
    get(key: string): any;
    header(key: string): string;
    add(key: string, val: any, overwrite?: boolean): void;
}
