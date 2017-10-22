export interface IRequest {
    get(string: any): any;
    header(string: any): string;
    add(string: any, any: any): void;
}
