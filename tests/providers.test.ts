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

describe('playground', () => {
    const ModelPropertyMetaDataKey = Symbol("DataMember");

    function ModelProperty() {
        return (target, property) => {
            const props = Reflect.getMetadata(ModelPropertyMetaDataKey, target) || [];
            props.push(property);
            Reflect.defineMetadata(ModelPropertyMetaDataKey, props, target);
        }
    }

    function GetDataMembers(target: any) {
        return Reflect.getMetadata(ModelPropertyMetaDataKey, target);
    }

    class A {
        constructor(data: {[key: string]: any}) {
            const props = GetDataMembers(this);
            console.log("props: ", props);
            Object.keys(data)
                .filter(prop => props.some(p => p === prop))
                .forEach(prop => this[prop] = data[prop]);
        }

        get model() {
            const props =  Object.keys(this);
            return props.reduce((obj, prop) => {
                obj[prop] = this[prop];
                return obj;
            }, {});
        }
    }

    class A2 {
        constructor(data: {[key: string]: any}) {
            Object.keys(data)
                .forEach(prop => this[prop] = data[prop]);
        }

        get model() {
            const props =  Object.keys(this);
            return props.reduce((obj, prop) => {
                obj[prop] = this[prop];
                return obj;
            }, {});
        }
    }

    class B extends A2 {
        //@ModelProperty()
        prop1: string;

        //@ModelProperty()
        prop2: string;

    }

    const m = [['a', 1],['b', 2]];

    const b = new B({prop1: 'hi', prop2: m, prop3: "hi"});
    console.log('b model: ', b.model);

});