import { DestroyItemOptions, UpdateItemOptions, CreateItemOptions, GetItemOptions } from "dynogels";

export interface ModelFactory<T> {
    create(data: { [key: string]: {} }, params?: CreateItemOptions): Promise<T>;
    getAll(): Promise<T[]>;
    getAllRaw(): Promise<any[]>;
    getItems(items: any[], options?: GetItemOptions): Promise<T[]>;
    get(hashKey: string, options?: GetItemOptions, rangeKey?: string): Promise<T>;
    update(data: { [key: string]: {} }, options?: UpdateItemOptions): Promise<T>;
    delete(hashKey: string, rangeKey?: string, options?: DestroyItemOptions): Promise<T>
}