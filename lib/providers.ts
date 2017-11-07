import { error } from 'util';
import { MINDLESS_SERVICE_INDENTIFIERS } from './types';
import { DefaultConfig, MindlessConfig, ConfigurationManager } from './configs';
import { Container } from 'inversify';
import { Dynamo } from './data';

export const registerProviders = (container: Container) => {
    if (!container.isBound(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig)) {
        container.bind<MindlessConfig>(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig).to(DefaultConfig);
    }

    const configurationManager = new ConfigurationManager(container.get<MindlessConfig>(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig));
    container.bind<ConfigurationManager>(MINDLESS_SERVICE_INDENTIFIERS.ConfigurationManager).toConstantValue(configurationManager);

    container.bind<Dynamo>(MINDLESS_SERVICE_INDENTIFIERS.Dynamo).to(Dynamo);
}