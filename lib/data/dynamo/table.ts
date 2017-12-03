import { DynogelsItemCallback, CreateItemOptions, Model, ModelConfiguration, Document, DocumentCollection, UpdateItemOptions, DestroyItemOptions } from 'dynogels';
import { injectable, inject } from 'inversify';

import { Dynamo } from './dynamo';
import { MINDLESS_SERVICE_INDENTIFIERS } from '../../types';

@injectable()
export abstract class DynamoTable<T> {
    protected abstract tableName: string;
    protected abstract definition: ModelConfiguration;
    private _model: Model;

    constructor( @inject(MINDLESS_SERVICE_INDENTIFIERS.Dynamo) private dynamo: Dynamo) {
    }

    protected registerTable() {
        this._model = this.dynamo.addDefinition(this.tableName, this.definition);
        // this.dynamo.createTables();
    }

    public create(data: { [key: string]: {} }, options: CreateItemOptions = {}): Promise<T> {
        let promiseCallback = (resolve, reject) => {
            let createModelCallback: DynogelsItemCallback = (err, model) => {
                if (err) {
                    console.error('Error creating a entry on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    let m: T = this.transformToModel(model);
                    resolve(m);
                }
            }

            this._model.create(data, options, createModelCallback);
        };

        return new Promise(promiseCallback)
    }

    public getAll(): Promise<T[]> {
        let transform = (models: Document[]) => models.map(model => this.transformToModel(model));
        return this.getAllBase(transform);
    }

    public getAllRaw(): Promise<{}[]> {
        return this.getAllBase(x => x);
    }

    public getItems(items: any[]): Promise<T[]> {
        let transform = (models: T[]) => models.map(model => this.transformToModel(model));

        let promiseCallback = (resolve, reject) => {
            let callback = (err, items: any[]) => {
                if (err) {
                    console.error(`Error getting items on ${this.tableName} table. Err: ${err}`);
                    reject(err);
                }
                else {
                    items = transform(items);
                    resolve(items);
                }
            }

            this._model.getItems(items, callback);
        }

        return new Promise(promiseCallback);
    }

    protected getAllBase(transform: (x: any[]) => any): Promise<any[]> {
        let promiseCallback = (resolve, reject) => {

            let callback = (err, models: DocumentCollection) => {
                if (err) {
                    console.error('Error retrieving all models on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    models = transform(models.Items);
                    resolve(models);
                }
            };

            this._model.scan().loadAll().exec(callback);
        };

        return new Promise(promiseCallback);
    }

    public update(data: { [key: string]: {} }, options: UpdateItemOptions = {}): Promise<T> {
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(this.transformToModel(item));
                }
            };

            this._model.update(data, options, callback);
        }
        return new Promise(promiseCallback);
    }

    public delete(hashKey: string, rangeKey?: string, options: DestroyItemOptions = {}): Promise<T> {
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
                this._model.destroy(hashKey, options, callback);
            }
            else {
                this._model.destroy(hashKey, rangeKey, options, callback);
            }
        }
        return new Promise(promiseCallback);
    }

    protected abstract transformToModel(createdModel: any): T;
}