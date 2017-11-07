import 'reflect-metadata';
import { MindlessConfig, ConfigurationManager } from '../../lib/configs';

describe('Constructor ', () => {

    class ConfigTest implements MindlessConfig {
        dynamoEndpoint: string = "testRoute";
        customConfig: {} = {
            a: 2,
            b: 3
        };
    }

    test('sets configuration values for properties existing in config object', () => {
        let configTest = new ConfigTest();
        let configurationManager = new ConfigurationManager(configTest);

        expect(configurationManager.get("dynamoEndpoint")).toEqual("testRoute");
        expect(configurationManager.get("customConfig")).toEqual({ a: 2, b: 3 });
    });
});

describe('set ', () => {

    test('adds values to configuration cache', () => {
        let configurationManager = new ConfigurationManager();

        configurationManager.set('test', 'Evan');

        expect(configurationManager.get('test')).toEqual('Evan');
    });

    test('overrides value currently in configuration cache', () => {
        let configurationManager = new ConfigurationManager();

        configurationManager.set('test', 'Evan');
        configurationManager.set('test', 'Evan1');

        expect(configurationManager.get('test')).toEqual('Evan1');
    });
});

describe('get ', () => {

    test('throws error when key does not exist in cache', () => {
        let configurationManager = new ConfigurationManager();

        expect(() => { configurationManager.get('test') }).toThrow(/test/);
    });
});

describe('setIfNonExistant ', () => {
    test('sets configuration value if it doesnt exist in cache', () => {
        let configurationManager = new ConfigurationManager();

        configurationManager.setIfNonExistant('test', 'Evan');
        configurationManager.setIfNonExistant('test', 'Evan1');

        expect(configurationManager.get('test')).toEqual('Evan');
    });
});