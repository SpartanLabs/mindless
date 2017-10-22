import * as dyn from 'dynogels';
export declare class Dynamo {
    constructor();
    addDefinition(tableName: string, tableDefnition: dyn.DynamoTableDefinition): any;
    createTables(): void;
}
