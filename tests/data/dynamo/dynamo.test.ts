import 'reflect-metadata';
import { ConfigurationManager } from '../../../lib/configs/configuration-manager';
import { DefaultConfig } from '../../../lib/configs/config';
import { Dynamo } from '../../../lib/data/dynamo/dynamo';
import * as TypeMoq from 'typemoq';

describe('Test dynamo constructor', () => {
    test('need to implement', () => {
        var config = new DefaultConfig();
        var configurationManager = new ConfigurationManager(config);
        let dynamo = new Dynamo(configurationManager);
    });
});