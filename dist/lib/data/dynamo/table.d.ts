import * as dyn from 'dynogels';
import { Dynamo } from './dynamo';
export declare abstract class DynamoTable<T> {
    private dynamo;
    protected abstract tableName: string;
    protected abstract definition: dyn.DynamoTableDefinition;
    private _dynamoTable;
    constructor(dynamo: Dynamo);
    protected registerTable(): void;
    create(data: {
        [key: string]: {};
    }): Promise<T>;
    getAll(): Promise<T[]>;
    getAllRaw(): Promise<{}[]>;
    protected getAllBase(transform: (x: any[]) => any): Promise<any[]>;
    protected abstract transformToModel(createdModel: any): T;
}
