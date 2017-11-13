import { Request } from '../request';
export declare abstract class Middleware {
    constructor();
    protected independent: boolean;
    isIndependent(): boolean;
    abstract handle(request: Request): any;
}
