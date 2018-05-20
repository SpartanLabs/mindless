import * as TypeMoq from 'typemoq'
import { types, Model as DynModel } from 'dynogels'
import { DynamoTable, Model } from '../../../src/data'
import * as joi from 'joi'

describe('DynamoTable ', () => {
  let testTable: TestTable

  const dynogelsModelMock = TypeMoq.Mock.ofType<DynModel>()
  const errorMessage = 'I Failed'
  const documentCollection = {
    Items: [
      { attrs: { name: 'Ronald' } },
      { attrs: { name: 'Donald' } },
      { attrs: { name: 'McDonald' } }
    ]
  }
  const parsedDocumentCollection = [
    { name: 'Ronald' },
    { name: 'Donald' },
    { name: 'McDonald' }
  ]
  const document = { attrs: { name: 'Evan' } }
  const parsedDocument = { name: 'Evan' }
  const hashKey = 'Hash'
  const rangeKey = 'Range'
  let testModel: TestModel

  beforeEach(() => {
    dynogelsModelMock.reset()
    testTable = new TestTable()
    testTable.dynModel = dynogelsModelMock.object

    testModel = new TestModel({ name: 'Evan' })
  })

  test('gets constructed', () => {
    const testTable = new TestTable()
    expect(testTable).toBeInstanceOf(TestTable)
  })

  describe('create() ', () => {
    test('succeeds', async () => {
      const testData = { name: 'Evan' }

      dynogelsModelMock
        .setup(c => c.create(testData, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, 'document'))
        .verifiable(TypeMoq.Times.once())

      const testModel = new TestModel(testData)

      const createdModel = await testTable.create(testModel)

      expect(createdModel).toBe(testModel)
      dynogelsModelMock.verifyAll()
    })

    test('errors', async () => {
      const testData = { name: 'Evan' }

      dynogelsModelMock
        .setup(c => c.create(testData, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(errorMessage))
        .verifiable(TypeMoq.Times.once())

      const testModel = new TestModel(testData)

      let error
      try {
        await testTable.create(testModel)
      } catch (err) {
        error = err
      }
      expect(error).toBe(errorMessage)
      dynogelsModelMock.verifyAll()
    })
  })

  describe('getAllRaw() ', () => {
    test('succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.scan())
        .returns(() => {
          return {
            loadAll: () => {
              return {
                exec: (callback: Function) => {
                  callback(undefined, documentCollection)
                }
              }
            }
          } as any
        })
        .verifiable(TypeMoq.Times.once())

      const items = await testTable.getAllRaw()

      expect(items).toEqual(parsedDocumentCollection)
      dynogelsModelMock.verifyAll()
    })

    test('errors', async () => {
      dynogelsModelMock
        .setup(c => c.scan())
        .returns(() => {
          return {
            loadAll: () => {
              return {
                exec: (callback: Function) => {
                  callback(errorMessage)
                }
              }
            }
          } as any
        })
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        await testTable.getAllRaw()
      } catch (err) {
        error = err
      }
      expect(error).toBe(errorMessage)

      dynogelsModelMock.verifyAll()
    })
  })

  describe('getAll() ', () => {
    test('succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.scan())
        .returns(() => {
          return {
            loadAll: () => {
              return {
                exec: (callback: Function) => {
                  callback(undefined, documentCollection)
                }
              }
            }
          } as any
        })
        .verifiable(TypeMoq.Times.once())

      const items = await testTable.getAll()

      expect(items).toEqual(
        parsedDocumentCollection.map(item => {
          return new TestModel(item)
        })
      )
      dynogelsModelMock.verifyAll()
    })
  })

  describe('getItems() ', () => {
    test('succeeds', async () => {
      const itemsToGet = ['testKey1', 'testKey2', 'testKey3']

      dynogelsModelMock
        .setup(c => c.getItems(itemsToGet, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, documentCollection.Items))
        .verifiable(TypeMoq.Times.once())

      const items = await testTable.getItems(itemsToGet)

      expect(items).toEqual(
        parsedDocumentCollection.map(item => {
          return new TestModel(item)
        })
      )
      dynogelsModelMock.verifyAll()
    })
    test('errors', async () => {
      const itemsToGet = ['testKey1', 'testKey2', 'testKey3']

      dynogelsModelMock
        .setup(c => c.getItems(itemsToGet, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(errorMessage))
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        await testTable.getItems(itemsToGet)
      } catch (err) {
        error = err
      }
      expect(error).toBe(errorMessage)

      dynogelsModelMock.verifyAll()
    })
  })

  describe('get() ', () => {
    test('with just hashKey succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, document))
        .verifiable(TypeMoq.Times.once())

      const item = await testTable.get(hashKey)

      expect(item).toEqual(new TestModel(parsedDocument))
      dynogelsModelMock.verifyAll()
    })

    test('with rangeKey succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, rangeKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c, d) => d(undefined, document))
        .verifiable(TypeMoq.Times.once())

      const item = await testTable.get(hashKey, {}, rangeKey)

      expect(item).toEqual(new TestModel(parsedDocument))
      dynogelsModelMock.verifyAll()
    })

    test('item null returns undefined', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, null))
        .verifiable(TypeMoq.Times.once())

      const item = await testTable.get(hashKey)

      expect(item).toEqual(undefined)
      dynogelsModelMock.verifyAll()
    })

    test('item undefined returns undefined', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, undefined))
        .verifiable(TypeMoq.Times.once())

      const item = await testTable.get(hashKey)

      expect(item).toEqual(undefined)
      dynogelsModelMock.verifyAll()
    })

    test('errors', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(errorMessage))
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        const item = await testTable.get(hashKey)
      } catch (err) {
        error = err
      }

      expect(error).toEqual(errorMessage)
      dynogelsModelMock.verifyAll()
    })
  })

  describe('getOrFail() ', () => {
    test('errors when retreived model is undefined', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, undefined))
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        const item = await testTable.getOrFail(hashKey)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Model not found')
      dynogelsModelMock.verifyAll()
    })

    test('succeeds when retrieved model is not undefined', async () => {
      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, document))
        .verifiable(TypeMoq.Times.once())

      const item = await testTable.getOrFail(hashKey)

      expect(item).toEqual(new TestModel(parsedDocument))
      dynogelsModelMock.verifyAll()
    })
  })

  describe('update() ', () => {
    test('succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.update(testModel.model, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, document))
        .verifiable(TypeMoq.Times.once())

      await testTable.update(testModel)

      dynogelsModelMock.verifyAll()
    })

    test('errors', async () => {
      dynogelsModelMock
        .setup(c => c.update(testModel.model, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(errorMessage))
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        await testTable.update(testModel)
      } catch (err) {
        error = err
      }

      expect(error).toEqual(errorMessage)

      dynogelsModelMock.verifyAll()
    })
  })

  describe('delete() ', () => {
    test('with just haskKey succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.destroy(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined))
        .verifiable(TypeMoq.Times.once())

      await testTable.delete(hashKey)

      dynogelsModelMock.verifyAll()
    })

    test('with rangeKey succeeds', async () => {
      dynogelsModelMock
        .setup(c => c.destroy(hashKey, rangeKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c, d) => d(undefined))
        .verifiable(TypeMoq.Times.once())

      await testTable.delete(hashKey, rangeKey)

      dynogelsModelMock.verifyAll()
    })

    test('errors', async () => {
      dynogelsModelMock
        .setup(c => c.destroy(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(errorMessage))
        .verifiable(TypeMoq.Times.once())

      let error
      try {
        await testTable.delete(hashKey)
      } catch (err) {
        error = err
      }

      expect(error).toEqual(errorMessage)

      dynogelsModelMock.verifyAll()
    })
  })

  describe('create() with mappedKeys ', () => {
    test('succeeds', async () => {
      let table = new TestTableWithCalculatedKeys()
      table.dynModel = dynogelsModelMock.object

      const testData = {
        name: 'Evan',
        email: 'evan@gmail.com',
        alternateName: 'Zeech',
        alternateEmail: 'zeech@gmail.com'
      }

      dynogelsModelMock
        .setup(c =>
          c.create(
            {
              test: 'Evan:evan@gmail.com',
              teste: 'Zeech:zeech@gmail.com'
            },
            {},
            TypeMoq.It.isAny()
          )
        )
        .callback((a, b, c) => c(undefined, 'document'))
        .verifiable(TypeMoq.Times.once())

      const testModel = new TestModel(testData)

      const createdModel = await table.create(testModel)

      expect(createdModel).toBe(testModel)
      dynogelsModelMock.verifyAll()
    })
  })

  describe('getAll() with mappedKeys ', () => {
    test('succeeds', async () => {
      let table = new TestTableWithCalculatedKeys()
      table.dynModel = dynogelsModelMock.object

      const testData = {
        name: 'Evan',
        email: 'evan@gmail.com',
        alternateName: 'Zeech',
        alternateEmail: 'zeech@gmail.com'
      }

      const dynamoRaw = {
        Items: [
          {
            attrs: {
              test: 'Evan:evan@gmail.com',
              teste: 'Zeech:zeech@gmail.com'
            }
          }
        ]
      }

      dynogelsModelMock
        .setup(c => c.scan())
        .returns(() => {
          return {
            loadAll: () => {
              return {
                exec: (callback: Function) => {
                  callback(undefined, dynamoRaw)
                }
              }
            }
          } as any
        })
        .verifiable(TypeMoq.Times.once())

      const models = await table.getAll()

      expect(models[0]).toEqual(testData)
      dynogelsModelMock.verifyAll()
    })
  })

  describe('getItems() with mappedKeys ', () => {
    test('succeeds', async () => {
      let table = new TestTableWithCalculatedKeys()
      table.dynModel = dynogelsModelMock.object

      const testData = {
        name: 'Evan',
        email: 'evan@gmail.com',
        alternateName: 'Zeech',
        alternateEmail: 'zeech@gmail.com'
      }

      const dynamoRaw = {
        Items: [
          {
            attrs: {
              test: 'Evan:evan@gmail.com',
              teste: 'Zeech:zeech@gmail.com'
            }
          }
        ]
      }

      const itemsToGet = ['testKey1', 'testKey2', 'testKey3']

      dynogelsModelMock
        .setup(c => c.getItems(itemsToGet, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, dynamoRaw.Items))
        .verifiable(TypeMoq.Times.once())

      const items = await table.getItems(itemsToGet)

      expect(items[0]).toEqual(testData)
      dynogelsModelMock.verifyAll()
    })
  })

  describe('get() with mappedKeys ', () => {
    test('succeeds', async () => {
      let table = new TestTableWithCalculatedKeys()
      table.dynModel = dynogelsModelMock.object

      const testData = {
        name: 'Evan',
        email: 'evan@gmail.com',
        alternateName: 'Zeech',
        alternateEmail: 'zeech@gmail.com'
      }

      const dynamoRaw = {
        attrs: {
          test: 'Evan:evan@gmail.com',
          teste: 'Zeech:zeech@gmail.com'
        }
      }

      dynogelsModelMock
        .setup(c => c.get(hashKey, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, dynamoRaw))
        .verifiable(TypeMoq.Times.once())

      const item = await table.get(hashKey)

      expect(item).toEqual(new TestModel(testData))
      dynogelsModelMock.verifyAll()
    })
  })

  describe('update() with mappedKeys ', () => {
    test('succeeds', async () => {
      let table = new TestTableWithCalculatedKeys()
      table.dynModel = dynogelsModelMock.object

      const testData = new TestModel({
        name: 'Evan',
        email: 'evan@gmail.com',
        alternateName: 'Zeech',
        alternateEmail: 'zeech@gmail.com'
      })

      const dynamoRaw = {
        test: 'Evan:evan@gmail.com',
        teste: 'Zeech:zeech@gmail.com'
      }

      dynogelsModelMock
        .setup(c => c.update(dynamoRaw, {}, TypeMoq.It.isAny()))
        .callback((a, b, c) => c(undefined, document))
        .verifiable(TypeMoq.Times.once())

      await table.update(testData)

      dynogelsModelMock.verifyAll()
    })
  })
})

class TestModel extends Model {
  public name: string
  public email: string
  public alternateName: string
  public alternateEmail: string
}

class TestTable extends DynamoTable<TestModel> {
  protected tableName = 'Test'
  protected TConstructor = TestModel

  protected definition = {
    tableName: this.tableName,
    hashKey: 'test',
    rangeKey: 'teste',
    timestamps: true,
    schema: {
      name: joi.string(),
      ownerEmail: joi.string().email(),
      settings: joi.object(),
      users: types.stringSet()
    }
  } as any

  constructor() {
    super()
  }
}

class TestTableWithCalculatedKeys extends DynamoTable<TestModel> {
  protected tableName = 'Test'
  protected TConstructor = TestModel
  protected partitionKeyValue = '{name}:{email}'
  protected rangeKeyValue = '{alternateName}:{alternateEmail}'

  protected definition = {
    tableName: this.tableName,
    hashKey: 'test',
    rangeKey: 'teste',
    timestamps: true,
    schema: {
      name: joi.string(),
      ownerEmail: joi.string().email(),
      settings: joi.object(),
      users: types.stringSet()
    }
  } as any

  constructor() {
    super()
  }
}
