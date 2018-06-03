import define, {
  DynogelsItemCallback,
  CreateItemOptions,
  Model as DynModel,
  ModelConfiguration,
  Document,
  DocumentCollection,
  UpdateItemOptions,
  DestroyItemOptions,
  GetItemOptions
} from 'dynogels'
import { Model, ModelConstructor } from '../model'
import { ModelFactory } from '../model-factory'

export abstract class DynamoTable<TModel extends Model>
  implements ModelFactory<TModel> {
  public abstract dynModel: DynModel
  protected abstract tableName: string
  protected abstract definition: ModelConfiguration
  protected abstract TConstructor: ModelConstructor<TModel>
  protected partitionKeyValue?: string
  protected rangeKeyValue?: string
  private _partitionKeyReplacables?: string[]
  private _rangeKeyReplacables?: string[]

  private static getKeyMatches(key: string | undefined): string[] {
    if (key === undefined) {
      return []
    }
    const regex = new RegExp(/{([^}]+)}/gi)
    let match = regex.exec(key)
    const matches: string[] = []

    while (match != null) {
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
      matches.push(match[1])
      match = regex.exec(key)
    }

    return matches
  }

  public create(
    data: TModel,
    options: CreateItemOptions = {}
  ): Promise<TModel> {
    const mappedItem = this.mapToDynamoItem(data.model)

    let promiseCallback = (resolve: Function, reject: Function) => {
      let createModelCallback: DynogelsItemCallback = err => {
        if (err) {
          console.error(
            `Failed to create item on ${this.tableName} table.
              \n Item: ${JSON.stringify(data.model)}
              \n Err: `,
            err
          )
          reject(err)
        } else {
          resolve(data)
        }
      }

      this.dynModel.create(mappedItem, options, createModelCallback)
    }

    return new Promise(promiseCallback)
  }

  public getAll(): Promise<TModel[]> {
    const documentMapper = (documents: Document[]) =>
      documents
        .map(document => this.mapFromDynamoItem(document.attrs))
        .map(document => Model.createModel(this.TConstructor, document))

    return this.getAllBase(documentMapper)
  }

  public getAllRaw(): Promise<{}[]> {
    return this.getAllBase((documents: Document[]) =>
      documents.map(document => document.attrs)
    )
  }

  public getItems(
    items: any[],
    options: GetItemOptions = {}
  ): Promise<TModel[]> {
    let promiseCallback = (resolve: Function, reject: Function) => {
      let callback = (err: any, documents: any[]) => {
        if (err) {
          console.error(
            `Error getting items on ${this.tableName} table. Err: ${err}`
          )
          reject(err)
        } else {
          const models = documents
            .map(document => this.mapFromDynamoItem(document.attrs))
            .map(document => Model.createModel(this.TConstructor, document))

          resolve(models)
        }
      }

      this.dynModel.getItems(items, options, callback)
    }

    return new Promise(promiseCallback)
  }

  public get(
    hashKey: string,
    options: GetItemOptions = {},
    rangeKey?: string
  ): Promise<TModel> {
    let promiseCallback = (resolve: Function, reject: Function) => {
      let callback: DynogelsItemCallback = (err, document) => {
        if (err) {
          console.error(
            `Error getting items on ${this.tableName} table. Err: ${err}`
          )
          reject(err)
        } else if (document === undefined || document === null) {
          resolve(undefined)
        } else {
          const model = Model.createModel(
            this.TConstructor,
            this.mapFromDynamoItem((document as any).attrs)
          )
          resolve(model)
        }
      }

      if (rangeKey == null) {
        this.dynModel.get(hashKey, options, callback)
      } else {
        this.dynModel.get(hashKey, rangeKey, options, callback)
      }
    }

    return new Promise(promiseCallback)
  }

  public getOrFail(
    hashKey: string,
    options: GetItemOptions = {},
    rangeKey?: string
  ): Promise<TModel> {
    return this.get(hashKey, options, rangeKey).then(model => {
      if (model === undefined) {
        const keyMsg =
          `HashKey: ${hashKey} ` + (rangeKey === undefined)
            ? ''
            : `, RangeKey: ${rangeKey}`

        console.error(
          `No item with ${keyMsg} found on ${this.tableName} table.`
        )
        return Promise.reject('Model not found')
      }
      return Promise.resolve(model)
    })
  }

  public update(data: TModel, options: UpdateItemOptions = {}): Promise<void> {
    return this.updateRaw(data.model, options)
  }

  public updateRaw(
    data: { [key: string]: {} },
    options: UpdateItemOptions = {}
  ): Promise<void> {
    const mappedItem = this.mapToDynamoItem(data)
    let promiseCallback = (resolve: Function, reject: Function) => {
      let callback: DynogelsItemCallback = (err, item) => {
        if (err) {
          console.error(
            'Error updating item on ' + this.tableName + ' table. Err: ',
            err
          )
          reject(err)
        } else {
          resolve()
        }
      }

      this.dynModel.update(mappedItem, options, callback)
    }

    return new Promise(promiseCallback)
  }

  public delete(
    hashKey: string,
    rangeKey?: string,
    options: DestroyItemOptions = {}
  ): Promise<void> {
    let promiseCallback = (resolve: Function, reject: Function) => {
      let callback: DynogelsItemCallback = err => {
        if (err) {
          console.error(
            'Error deleting item on ' + this.tableName + ' table. Err: ',
            err
          )
          reject(err)
        } else {
          resolve()
        }
      }

      if (rangeKey == null) {
        this.dynModel.destroy(hashKey, options, callback)
      } else {
        this.dynModel.destroy(hashKey, rangeKey, options, callback)
      }
    }
    return new Promise(promiseCallback)
  }

  protected registerTable() {
    this.dynModel = define(this.tableName, this.definition)
  }

  protected getAllBase(documentMapper: (x: any[]) => any): Promise<any[]> {
    let promiseCallback = (resolve: Function, reject: Function) => {
      let callback = (err: any, documentCollection: DocumentCollection) => {
        if (err) {
          console.error(
            'Error retrieving all models on ' +
              this.tableName +
              ' table. Err: ',
            err
          )
          reject(err)
        } else {
          resolve(documentMapper(documentCollection.Items))
        }
      }

      this.dynModel
        .scan()
        .loadAll()
        .exec(callback)
    }

    return new Promise(promiseCallback)
  }

  protected get partitionKeyReplacables() {
    return (this._partitionKeyReplacables =
      this._partitionKeyReplacables ||
      DynamoTable.getKeyMatches(this.partitionKeyValue))
  }

  protected get rangeKeyReplacables() {
    return (this._rangeKeyReplacables =
      this._rangeKeyReplacables ||
      DynamoTable.getKeyMatches(this.rangeKeyValue))
  }

  private mapToDynamoItem(data: { [key: string]: any }) {
    const keyReplacementReducer = (outStr: string, field: string) =>
      outStr.replace(`${field}`, data[field])

    const fieldsToRemove: string[] = []

    if (this.partitionKeyValue !== undefined) {
      // merge the arrays
      Array.prototype.push.apply(fieldsToRemove, this.partitionKeyReplacables)
      data[this.definition.hashKey] = this.partitionKeyReplacables.reduce(
        keyReplacementReducer,
        this.partitionKeyValue
      )
    }

    if (this.rangeKeyValue !== undefined && this.definition.rangeKey) {
      // merge the arrays
      Array.prototype.push.apply(fieldsToRemove, this.rangeKeyReplacables)
      data[this.definition.rangeKey] = this.rangeKeyReplacables.reduce(
        keyReplacementReducer,
        this.rangeKeyValue
      )
    }

    // create set to make the array unique
    new Set(fieldsToRemove).forEach(field => delete data[field])

    return data
  }

  private mapFromDynamoItem(data: { [key: string]: any }) {
    if (this.partitionKeyValue !== undefined) {
      const hashKey = data[this.definition.hashKey]
      const replacementValues = DynamoTable.getKeyMatches(hashKey)
      if (this.partitionKeyReplacables.length !== replacementValues.length) {
        throw new Error(
          'Partition key format does not match the Models PartitionKeyValue'
        )
      }

      this.partitionKeyReplacables.forEach(
        (match, idx) => (data[match] = replacementValues[idx])
      )

      delete data[this.definition.hashKey]
    }

    if (this.rangeKeyValue !== undefined && this.definition.rangeKey) {
      const rangeKey = data[this.definition.rangeKey]
      const replacementValues = DynamoTable.getKeyMatches(rangeKey)

      if (this.rangeKeyReplacables.length !== replacementValues.length) {
        throw new Error(
          'Range key format does not match the Models RangeKeyValue'
        )
      }

      this.rangeKeyReplacables.forEach(
        (match, idx) => (data[match] = replacementValues[idx])
      )

      delete data[this.definition.rangeKey]
    }

    return data
  }
}
