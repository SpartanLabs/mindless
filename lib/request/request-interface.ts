export interface IRequest {
    get(string) : any; // retrieve request input
    header(string) : string; // retrieve request header
    add(string, any) : void; // add request data
}