import { DestroyItemOptions, UpdateItemOptions, CreateItemOptions } from "dynogels";

export interface ModelFactory<T> {
    create(data: { [key: string]: {} }, params?: CreateItemOptions): Promise<T>;
    getAll(): Promise<T[]>;
    getAllRaw(): Promise<any[]>;
    update(data: { [key: string]: {} }, options?: UpdateItemOptions): Promise<T>;
    delete(hashKey: string, rangeKey?: string, options?: DestroyItemOptions): Promise<T>
}