export declare abstract class Middleware {
    constructor();
    protected independent: boolean;
    isIndependent(): boolean;
    abstract handle(request: any): any;
}
