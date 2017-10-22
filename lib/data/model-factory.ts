export interface ModelFactory<T> {
    create(data: {[key: string]: {}}): Promise<T>;
    getAll(): Promise<T[]>;
    getAllRaw(): Promise<any[]>;
}