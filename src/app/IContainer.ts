import { GenericConstructor } from '../interfaces'

export interface IContainer {
  resolve<T>(constructor: GenericConstructor<T>): T
}
