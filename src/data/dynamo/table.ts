import {
    DynogelsItemCallback,
    CreateItemOptions,
    Model as DynModel,
    ModelConfiguration,
    Document,
    DocumentCollection,
    UpdateItemOptions,
    DestroyItemOptions,
    GetItemOptions,
    define as defineTable
} from 'dynogels';
import { Model, ModelConstructor } from "../model";
import { ModelFactory } from "../model-factory";
import { omit } from 'lodash';

export abstract class DynamoTable<TModel extends Model> implements ModelFactory<TModel> {
    protected abstract tableName: string;
    protected abstract definition: ModelConfiguration;
    protected abstract TConstructor: ModelConstructor<TModel>;
    public dynModel: DynModel;
    protected partitionKeyValue: string;
    protected rangeKeyValue: string;

    constructor() {
    }

    protected registerTable() {
        this.dynModel = defineTable(this.tableName, this.definition);
    }

    public create(data: TModel, options: CreateItemOptions = {}): Promise<TModel> {
        const mappedItem = this.mapToDynamoItem(data.model);
        let promiseCallback = (resolve, reject) => {
            let createModelCallback: DynogelsItemCallback = (err, document) => {
                if (err) {
                    console.error(`Failed to create item on ${this.tableName}
                     table.\n Item: ${JSON.stringify(data.model)}\n Err: `, err);
                    reject(err);
                } else {
                    resolve(data);
                }
            };

            this.dynModel.create(mappedItem, options, createModelCallback);
        };

        return new Promise(promiseCallback)
    }

    public getAll(): Promise<TModel[]> {
        const documentMapper = (documents: Document[]) =>
            documents.map((document) => this.mapFromDynamoItem(document.attrs))
                .map(document => new this.TConstructor(document));
        return this.getAllBase(documentMapper);
    }

    public getAllRaw(): Promise<{}[]> {
        return this.getAllBase((documents: Document[]) => documents.map((document) => document.attrs));
    }

    public getItems(items: any[], options: GetItemOptions = {}): Promise<TModel[]> {

        let promiseCallback = (resolve, reject) => {
            let callback = (err, documents: any[]) => {
                if (err) {
                    console.error(`Error getting items on ${this.tableName} table. Err: ${err}`);
                    reject(err);
                }
                else {
                    const models = documents
                        .map((document) => this.mapFromDynamoItem(document.attrs))
                        .map(document => new this.TConstructor(document));

                    resolve(models);
                }
            };

            this.dynModel.getItems(items, options, callback);
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

                    resolve(documentMapper(documentCollection.Items));
                }
            };

            this.dynModel.scan().loadAll().exec(callback);
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
                    resolve(undefined);
                }
                else {
                    const model = new this.TConstructor(this.mapFromDynamoItem(document.attrs));
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

    public getOrFail(hashKey: string, options: GetItemOptions = {}, rangeKey?: string): Promise<TModel> {

        return this.get(hashKey, options, rangeKey).then((model) => {
            if (model === undefined) {
                const keyMsg = `HashKey: ${hashKey} ` + (rangeKey === undefined) ? "" : `, RangeKey: ${rangeKey}`;
                console.error(`No item with ${keyMsg} found on ${this.tableName} table.`);
                return Promise.reject("Model not found");
            }
            return Promise.resolve(model);
        })
    }

    public update(data: TModel, options: UpdateItemOptions = {}): Promise<void> {
        return this.updateRaw(data.model, options);
    }

    public updateRaw(data: { [key: string]: {} }, options: UpdateItemOptions = {}): Promise<void> {
        const mappedItem = this.mapToDynamoItem(data);
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve();
                }
            };

            this.dynModel.update(mappedItem, options, callback);
        };

        return new Promise(promiseCallback);
    }

    public delete(hashKey: string, rangeKey?: string, options: DestroyItemOptions = {}): Promise<void> {
        let promiseCallback = (resolve, reject) => {

            let callback: DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error deleting item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve();
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

    private mapToDynamoItem = (data: { [key: string]: any }) => {
        if (this.partitionKeyValue === undefined && this.rangeKeyValue == undefined) {
            return data;
        }

        const fieldsToRemove = new Set<string>();

        if (this.partitionKeyValue !== undefined) {
            let value = this.partitionKeyValue;
            const curlyBracketRegex = new RegExp(/{([^}]+)}/gi);
            const partitionKeyMatches = value.match(curlyBracketRegex) as RegExpMatchArray;
            partitionKeyMatches.forEach((match) => {
                const field = match.substring(1, match.length - 1);
                fieldsToRemove.add(field);
                value = value.replace(match, data[field]);
            });
            data[this.definition.hashKey] = value;
        }

        if (this.rangeKeyValue !== undefined && this.definition.rangeKey) {
            let value = this.rangeKeyValue;
            const curlyBracketRegex = new RegExp(/{([^}]+)}/gi);

            const partitionKeyMatches = value.match(curlyBracketRegex) as RegExpMatchArray;

            partitionKeyMatches.forEach((match) => {
                const field = match.substring(1, match.length - 1);
                fieldsToRemove.add(field);
                value = value.replace(match, data[field]);
            });
            data[this.definition.rangeKey] = value;
        }

        return omit(data, Array.from(fieldsToRemove));
    }

    private mapFromDynamoItem = (data: { [key: string]: any }) => {
        if (this.partitionKeyValue === undefined && this.rangeKeyValue == undefined) {
            return data;
        }

        if (this.partitionKeyValue !== undefined) {
            let value = this.partitionKeyValue;
            const curlyBracketRegex = new RegExp(/{([^}]+)}/gi);
            const partitionKeyMatches = value.match(curlyBracketRegex) as RegExpMatchArray;

            let toMatch = value;
            let fields: string[] = [];
            partitionKeyMatches.forEach((match) => {
                fields.push(match.substring(1, match.length - 1));
                toMatch = toMatch.replace(match, "(.*)");
            });

            const hashKey = data[this.definition.hashKey];

            let matches = hashKey.match(toMatch);
            fields.forEach((field, index) => {
                data[field] = matches[index + 1];
            });

            delete data[this.definition.hashKey];
        }

        if (this.rangeKeyValue !== undefined && this.definition.rangeKey) {
            let value = this.rangeKeyValue;
            const curlyBracketRegex = new RegExp(/{([^}]+)}/gi);
            const partitionKeyMatches = value.match(curlyBracketRegex) as RegExpMatchArray;

            let toMatch = value;
            let fields: string[] = [];
            partitionKeyMatches.forEach((match) => {
                fields.push(match.substring(1, match.length - 1));
                toMatch = toMatch.replace(match, "(.*)");
            });

            const hashKey = data[this.definition.rangeKey];

            let matches = hashKey.match(toMatch);
            fields.forEach((field, index) => {
                data[field] = matches[index + 1];
            });

            delete data[this.definition.rangeKey];
        }

        return data;
    }
}