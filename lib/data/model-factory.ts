import { DestroyItemOptions, UpdateItemOptions, CreateItemOptions, GetItemOptions, Model } from "dynogels";

export interface ModelFactory<TModel> {
    create(data: TModel, options: CreateItemOptions): Promise<TModel>;
    getAll(): Promise<TModel[]>;
    getAllRaw(): Promise<any[]>;
    getItems(items: any[], options?: GetItemOptions): Promise<TModel[]>;
    get(hashKey: string, options?: GetItemOptions, rangeKey?: string): Promise<TModel>;
    update(data: TModel, options?: UpdateItemOptions): Promise<TModel>;
    delete(hashKey: string, rangeKey?: string, options?: DestroyItemOptions): Promise<TModel>
}