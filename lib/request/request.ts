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

    getResource(): string {
        return this.event.resource;
    }

    getRequestMethod(): HttpMethods {
        return HttpMethods[this.event.httpMethod.toUpperCase()];
    }

    get(key: string): any {

        if (this.event.pathParameters.hasOwnProperty(key)) {
            return this.event.pathParameters[key];
        }
        if (this.event.queryStringParameters.hasOwnProperty(key)) {
            return this.event.queryStringParameters[key];
        }
        if (this._body.hasOwnProperty(key)) {
            return this._body[key];
        }

        throw Error("Invalid key: '" + key + "' , key not found in pathParameters, queryStringParameters, or Body parameters.");
    }

    header(key: string): string {
        if (this.event.headers.hasOwnProperty(key)) {
            return this.event.headers[key];
        }

        throw Error("Invalid key: '" + key + "' , key not found in headers");
    }

    add(key: string, val: any, overwrite: boolean = false): void {
        if (overwrite || !this._body.hasOwnProperty(key)) {
            this._body[key] = val;
            return;
        }

        throw Error("The key '" + key + "' already exists, pass 'overwrite=true' or use a different key.")
    }
}