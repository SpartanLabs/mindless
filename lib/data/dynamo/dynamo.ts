import * as dyn from 'dynogels';
import { injectable } from 'inversify';


import { DynamoTable } from './table';

@injectable()
export class Dynamo {

    constructor() {
        dyn.AWS.config.update({ region: "us-east-1", accessKeyId: "abcd", secretAccessKey: "secret" });
        const opts = { endpoint: 'http://localhost:8008' }
        dyn.dynamoDriver(new dyn.AWS.DynamoDB(opts));
    }

    public addDefinition(tableName: string, tableDefnition: dyn.DynamoTableDefinition) {
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