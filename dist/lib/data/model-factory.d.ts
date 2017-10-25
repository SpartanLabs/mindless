export interface ModelFactory<T> {
    create(data: {
        [key: string]: {};
    }, params?: {}): Promise<T>;
    getAll(): Promise<T[]>;
    getAllRaw(): Promise<any[]>;
}
