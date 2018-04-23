import { DynogelsItemCallback, CreateItemOptions, Model as DynModel, ModelConfiguration, Document, DocumentCollection, UpdateItemOptions, DestroyItemOptions, GetItemOptions } from 'dynogels';
import { injectable, inject } from 'inversify';

import { Dynamo } from './dynamo';
import { MINDLESS_SERVICE_INDENTIFIERS } from '../../types';
import {Model, ModelConstructor} from "../model";
import {ModelFactory} from "../model-factory";


@injectable()
export abstract class DynamoTable<TModel extends Model> implements ModelFactory<TModel> {
    protected abstract tableName: string;
    protected abstract definition: ModelConfiguration;
    public dynModel: DynModel;

    constructor(
        @inject(MINDLESS_SERVICE_INDENTIFIERS.Dynamo) private dynamo: Dynamo,
        protected TConstructor: ModelConstructor<TModel>
    ) { }

    protected registerTable() {
        this.dynModel = this.dynamo.addDefinition(this.tableName, this.definition);
        // this.dynamo.createTables();
    }

    public create(data: TModel, options: CreateItemOptions = {}): Promise<TModel> {
        let promiseCallback = (resolve, reject) => {
            let createModelCallback: DynogelsItemCallback = (err, document) => {
                if (err) {
                    console.error(`Failed to create item on ${this.tableName} table.\n Item: ${JSON.stringify(data.model)}\n Err: `, err);
                    reject(err);
                } else {
                    resolve(data);
                }
            };

            this.dynModel.create(data.model, options, createModelCallback);
        };

        return new Promise(promiseCallback)
    }

    public getAll(): Promise<TModel[]> {
        const documentMapper = (documents: Document[]) =>
            documents.map(document => new this.TConstructor(document));
        return this.getAllBase(documentMapper);
    }

    public getAllRaw(): Promise<{}[]> {
        return this.getAllBase(x => x);
    }

    public getItems(items: any[], options: GetItemOptions = {}): Promise<TModel[]> {

        let promiseCallback = (resolve, reject) => {
            let callback = (err, documents: any[]) => {
                if (err) {
                    console.error(`Error getting items on ${this.tableName} table. Err: ${err}`);
                    reject(err);
                }
                else {
                    const models = documents.map(document => new this.TConstructor(document));
                    resolve(models);
                }
            };

            this.dynModel.getItems(items, options, callback);
        };

        return new Promise(promiseCallback);
    }

    public get(hashKey: string, options: GetItemOptions = {}, rangeKey?: string): Promise<TModel> {

        let promiseCallback = (resolve, reject) => {
            let callback = (err, document) => {
                if (err) {
                    console.error(`Error getting items on ${this.tableName} table. Err: ${err}`);
                    reject(err);
                } else if (document === undefined || document === null) {
                    const keyMsg = `HashKey: ${hashKey} ` + (rangeKey === undefined) ? "": `, RangeKey: ${rangeKey}`;
                    console.error(`No item with ${keyMsg} found on ${this.tableName} table.`);
                    reject("Model not found");
                }
                else {
                    const model = new this.TConstructor(document);
                    resolve(model);
                }
            };

            if (rangeKey == null) {
                this.dynModel.get(hashKey, options, callback);
            }
            else {
                this.dynModel.get(hashKey, rangeKey, options, callback);
            }
        };

        return new Promise(promiseCallback);
    }

    protected getAllBase(documentMapper: (x: any[]) => any): Promise<any[]> {
        let promiseCallback = (resolve, reject) => {

            let callback = (err, documentCollection: DocumentCollection) => {
                if (err) {
                    console.error('Error retrieving all models on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    const models = documentMapper(documentCollection.Items);
                    resolve(models);
                }
            };

            this.dynModel.scan().loadAll().exec(callback);
        };

        return new Promise(promiseCallback);
    }

    public update(data: TModel, options: UpdateItemOptions = {}): Promise<boolean> {
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, document) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            };

            this.dynModel.update(data.model, options, callback);
        };
        return new Promise(promiseCallback);
    }

    public updateRaw(data: { [key: string]: {} }, options: UpdateItemOptions = {}): Promise<boolean> {
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            };

            this.dynModel.update(data, options, callback);
        };

        return new Promise(promiseCallback);
    }

    public delete(hashKey: string, rangeKey?: string, options: DestroyItemOptions = {}): Promise<boolean> {
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            };

            if (rangeKey == null) {
                this.dynModel.destroy(hashKey, options, callback);
            }
            else {
                this.dynModel.destroy(hashKey, rangeKey, options, callback);
            }
        };
        return new Promise(promiseCallback);
    }
}