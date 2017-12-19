import { Event, HttpMethods } from './event';
import { IRequest } from './request-interface';


export class Request implements IRequest {
    protected _body: { [key: string]: any };
    public RouteMetaData: any;

    constructor(protected event: Event) {
        if (event.body == "" || event.body == null) {
            this._body = {};
        } else {
            this._body = JSON.parse(event.body);
        }
        if (this.event.pathParameters == null) {
            this.event.pathParameters = {};
        }
        if (this.event.queryStringParameters == null) {
            this.event.queryStringParameters = {};
        }
        if (this.event.headers == null) {
            this.event.headers = {};
        }
    }

    getPath(): string {
        return this.event.path;
    }

    getRequestMethod(): HttpMethods {
        return HttpMethods[this.event.httpMethod.toUpperCase()];
    }

    get(key: string, failOnNotFound: boolean = true): any {

        if ('undefined' !== typeof this.event.pathParameters[key]) {
            return this.event.pathParameters[key];
        }
        if ('undefined' !== typeof this.event.queryStringParameters[key]) {
            return this.event.queryStringParameters[key];
        }
        if ('undefined' !== typeof this._body[key]) {
            return this._body[key];
        }

        if (failOnNotFound) {
            throw Error("Invalid key: '" + key + "' , key not found in pathParameters, queryStringParameters, or Body parameters.");
        }
        return undefined;
    }

    header(key: string): string {
        if ('undefined' !== typeof this.event.headers[key]) {
            return this.event.headers[key];
        }

        throw Error("Invalid key: '" + key + "' , key not found in headers");
    }

    add(key: string, val: any, overwrite: boolean = false): void {
        if (overwrite || 'undefined' === typeof this._body[key]) {
            this._body[key] = val;
            return;
        }

        throw Error("The key '" + key + "' already exists, pass 'overwrite=true' or use a different key.")
    }
}