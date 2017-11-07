import { MINDLESS_SERVICE_INDENTIFIERS } from '../../types';
import { ConfigurationManager } from '../../configs';
import * as dyn from 'dynogels';
import { injectable, inject } from 'inversify';
import { DynamoTable } from './table';

@injectable()
export class Dynamo {

    constructor( @inject(MINDLESS_SERVICE_INDENTIFIERS.ConfigurationManager) private configManager: ConfigurationManager) {
        dyn.AWS.config.update({ region: "us-east-1", accessKeyId: "abcd", secretAccessKey: "secret" });
        const opts = { endpoint: configManager.get('dynamoEndpoint') }
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