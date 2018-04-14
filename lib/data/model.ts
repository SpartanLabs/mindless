/**

 interface IMyModel {
   prop1: string;
   prop2: number;
 }

 class MyModel extends Model {

   // Note you may use any visibility on class properties
   public prop1: string;
   private prop2: number;

   constructor(data: IMyModel) {
     super(data);
   }
 }

 The only point of the interface is for type safety when creating instances of MyModel.
 It is optional but recommended


 __
 Wrote this bc I thought it was cool. Does not give us much use as of now.
 In the future if we want we could use it to support more complex types like nested objects, Maps, Sets, etc
 The above will only work for simple types: number,boolean, string, arrays, and javascript objects.
 To support more advanced types we can add an optional parameter to ModelProperty that accepts a function to map the data stored in dynamo to that type.

 import "reflect-metadata";

 const ModelPropertyMetaDataKey = Symbol("DataMember");


 function ModelProperty() {
        return (target, property) => {
            const props = Reflect.getMetadata(ModelPropertyMetaDataKey, target) || [];
            props.push(property);
            Reflect.defineMetadata(ModelPropertyMetaDataKey, props, target);
        }
    }

 function GetModelProperty(target: any) {
        return Reflect.getMetadata(ModelPropertyMetaDataKey, target);
    }


 We would then change the constructor to:
 constructor(data: {[key: string]: any}) {
    const props = GetDataMembers(this);
    console.log("props: ", props);
    Object.keys(data)
        .filter(prop => props.some(p => p === prop))
        .forEach(prop => this[prop] = data[prop]);
 }

 In the current implementation without the decorators additional properties could get mapped and be saved in dynamo
 Example:
 Let the above constructor be the constructor of the abstract Model class
 Now define class B
 class B extends A2 {
    prop1: string;
    prop2: string;
 }

 And initialize:

 const b = new B({prop1: 'hi', prop2: 'hi', prop3: "hi"});

 Now
 b.model
 returns the following
 { prop1: 'hi', prop2: 'hi', prop3: 'hi' }

 Ultimately this will cause prop3 to be saved in dynamo.
 */

export interface ModelConstructor<T extends Model> {
    new (data: {[key: string]: any}): T;
}

/**
 * Currently you may only use the following types (as well as any compositions) for model properties
 *  number, string, boolean, array, object
 */
export abstract class Model {

    constructor(data: {[key: string]: any}) {
        Object.keys(data)
            .forEach(prop => this[prop] = data[prop]);
    }

    get model(): { [key: string]: any} {
        const props =  Object.keys(this);
        return props.reduce((obj, prop) => {
            obj[prop] = this[prop];
            return obj;
        }, {});
    }
}