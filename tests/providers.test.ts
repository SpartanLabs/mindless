import 'reflect-metadata';

import { MINDLESS_SERVICE_INDENTIFIERS } from '../lib/types';
import { DefaultConfig, MindlessConfig } from '../lib/configs';
import { registerProviders } from '../lib/providers';
import {Container, injectable} from "inversify";

describe('registerProviders', () => {

    @injectable()
    class CustomConfig implements MindlessConfig {
        public dynamoEndpoint: string = "MyCustomEndpoint";
    }

    test(' registers correct implementations for default case', () => {

        let container = new Container();

        registerProviders(container);

        expect(container.get(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig)).toEqual(new DefaultConfig);
        expect(container.isBound(MINDLESS_SERVICE_INDENTIFIERS.Dynamo)).toBeTruthy();
    });

    test(' doesnt register config when one is already provided', () => {
        let container = new Container();

        container.bind<MindlessConfig>(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig).to(CustomConfig);

        registerProviders(container);

        expect(container.get<MindlessConfig>(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig).dynamoEndpoint).toEqual("MyCustomEndpoint");
    });
});