import 'reflect-metadata';

import { DefaultConfig } from '../../../lib/configs';
import { Dynamo } from '../../../';
import * as TypeMoq from 'typemoq';

describe('Test dynamo constructor', () => {
    test('need to implement', () => {
        var config = new DefaultConfig();
        let dynamo = new Dynamo(config);
    });
});