import { MindlessConfig } from '../../configs';
import * as dyn from 'dynogels';
export declare class Dynamo {
    private config;
    constructor(config: MindlessConfig);
    addDefinition(tableName: string, tableDefnition: dyn.ModelConfiguration): dyn.Model;
    createTables(): void;
}
