export interface GenericConstructor<T> {
  new (...args: any[]): T
}
