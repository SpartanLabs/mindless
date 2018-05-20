export interface ModelConstructor<T extends Model> {
  new (data: { [key: string]: any }): T
}

export interface IModel {
  model: { [key: string]: any }
}

/**
 * Currently you may only use the following types (as well as any compositions) for model properties
 *  number, string, boolean, array, object
 */
export abstract class Model implements IModel {
  constructor(data: { [key: string]: any }) {
    Object.keys(data).forEach(prop => ((this as any)[prop] = data[prop]))
  }

  public static createModel<TModel extends Model>(
    constructor: ModelConstructor<TModel>,
    data: {}
  ): TModel {
    return Object.assign(new constructor({}), data)
  }

  get model(): { [key: string]: any } {
    const props = Object.keys(this)
    return props.reduce((obj: { [key: string]: any }, prop) => {
      obj[prop] = (this as any)[prop]
      return obj
    }, {})
  }
}
