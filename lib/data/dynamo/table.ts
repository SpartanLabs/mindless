import * as dyn from 'dynogels';
import { injectable } from 'inversify';

import { Dynamo } from './dynamo';

@injectable()
export abstract class DynamoTable<T> {
    protected abstract tableName: string;
    protected abstract definition: dyn.DynamoTableDefinition;
    private _dynamoTable;

    constructor(private dynamo: Dynamo) {
    }
    
    protected registerTable() {
        this._dynamoTable = this.dynamo.addDefinition(this.tableName, this.definition);
        // this.dynamo.createTables();
    }

    public create(data: {[key: string]: {}}): Promise<T> {
        
        let promiseCallback = (resolve, reject) => {
            let createModelCallback = (err, model) => {
                if (err) {
                    console.error('Error creating a entry on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    let m: T = this.transformToModel(model);
                    console.log("model: ", m);
                    resolve(m);
                }
            }
            this._dynamoTable.create(data, createModelCallback);
        };
        

        return new Promise(promiseCallback)
    }

    public getAll(): Promise<T[]> {
        let transform = (models:dyn.Document[]) => models.map(model => this.transformToModel(model));
        return this.getAllBase(transform);
    }

    public getAllRaw(): Promise<{}[]> {
       return this.getAllBase(x => x);       
    }

    protected getAllBase(transform: (x:any[]) => any): Promise<any[]> {
        let promiseCallback = (resolve, reject) => {
            
            let callback = (err, models: dyn.DocumentCollection) => {
                if (err) {
                    console.error('Error retrieving all models on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    models = transform(models.Items);
                    resolve(models);
                }
            };

            this._dynamoTable.scan().loadAll().exec(callback);
        };
        
        return new Promise(promiseCallback);
    }

    protected abstract transformToModel(createdModel: any): T;
}