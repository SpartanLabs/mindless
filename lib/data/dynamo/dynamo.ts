import { MINDLESS_SERVICE_INDENTIFIERS } from '../../types';
import { MindlessConfig } from '../../configs';
import * as dyn from 'dynogels';
import { injectable, inject } from 'inversify';

import { DynamoTable } from './table';

@injectable()
export class Dynamo {

    constructor( @inject(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig) private config: MindlessConfig) {
        let opts = {};
        if (config.dynamoEndpoint.length != 0)
            opts = { endpoint: config.dynamoEndpoint }

        dyn.dynamoDriver(new dyn.AWS.DynamoDB(opts));
    }

    public addDefinition(tableName: string, tableDefnition: dyn.ModelConfiguration): dyn.Model {
        return dyn.define(tableName, tableDefnition);
    }

    public createTables() {
        dyn.createTables((err) => {
            if (err) {
                console.log('Dynamo error creating tables: ', err);
            } else {
                console.log('successfully created tables');
            }
        })
    }
}