import { Container } from 'inversify';
import { Dynamo } from './data';

export const registerProviders = (container: Container) => {
    container.bind<Dynamo>(Dynamo).to(Dynamo);
}