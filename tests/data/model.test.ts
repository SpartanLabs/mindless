import 'reflect-metadata';
import {IModel, Model} from "../../src/data/model";


describe('Model maps simple properties', () => {


    test("#string, number, and array is properly mapped", () => {
        class MyModel extends Model {
            public prop1: string;
            protected prop2: number;
            private prop3: string[];
        }

        const data = {
            prop1: "hello",
            prop2: 12,
            prop3: ['a', 'b', 'c']
        };

        const myModel = new MyModel(data);

        expect(myModel.model).toEqual(data);
    });

    test("#objects are properly mapped", () => {

        interface ComposedObject {
            a: string[],
            b: {
                a: number,
                b: boolean[]
            }
        }

        class MyModel extends Model {
            public prop1: string;
            protected prop2: ComposedObject[];
        }

        const data = {
            prop1: "hello",
            prop2: [
                {
                    a: ['a', 'b'],
                    b: {
                        a: 15.2,
                        b: [true, false, true]
                    }
                },
                {
                    a: ['c', 'd'],
                    b: {
                        a: -3.5,
                        b: [false, true, true]
                    }
                }
            ]
        };

        const myModel = new MyModel(data);

        expect(myModel.model).toEqual(data);
    });
});

describe("Model cannot map complex properties", () => {
    class MyClass {
        public prop1: string;
        private prop2: string;

        getConcatenatedProperties() {
            return this.prop1 + this.prop2;
        }
    }

    class MyModel extends Model {
        public prop1: Map<string,boolean>;
        public prop2: MyClass;
    }

    const data = {
        prop1: [["I", true],["am", false], ["a", true], ["map", false]],
        prop2: {prop1: "my", prop2: "class"}
    };

    const myModel = new MyModel(data);

    test("#complex objects appear to be mapped properly", () => {
        expect(myModel.model).toEqual(data);
    });

    test("#complex objects do not get created properly", () => {
        expect(() => myModel.prop1.get("I")).toThrow(/is not a function/);
        expect(() => myModel.prop2.getConcatenatedProperties()).toThrow(/is not a function/);
    });
});

describe("Example of how to use the Model class", () => {

    /**
     * We can optionally create an interface to define
     * the shape of the data we pass to our constructor.
     * We should include all properties we want to be included
     * on our model.
     */
    interface IUserData {
        name: string;
        age: number;
        accounts: string[];
    }

    /**
     * We can also optionally define an interface for our User class.
     * It should extend IModel.
     */
    interface IUser extends IModel {
        age: number;
        getName(): string;
        retrieveAccount(accountIdx: number): string;
    }


    /**
     * Are User class will implement the IUser interface
     * and NOT the IUserData interface because we want
     * to be able reference all necessary methods when
     * using the IUser interface. Where as the IUserData
     * interface is simply for ensuring we pass in the correct
     * data to our User Model constructor.
     */
    class User extends Model implements IUser {
        /**
         * Out properties can have any visibility you choose
         */
        public age: number;
        protected name: string;
        private accounts: string[];

        /**
         * This will help by ensuring all necessary data is passed through
         * when creating instances of User.
         * @param {IUserData} data
         */
        constructor(data: IUserData) {
            super(data);
        }

        /**
         * We can define additional methods as we like
         */

        public getName() {
            return this.name;
        }
        public retrieveAccount(accountIdx: number) {

            if (accountIdx >= this.accounts.length) {
                throw new RangeError("Account Index out of range");
            }

            return this.accounts[accountIdx];
        }
    }

    const myUserData: IUserData = {
        age: 22,
        name: "Zach",
        accounts: ["abc123", "def456"]
    };

    const myUser: IUser = new User(myUserData);

    test("#GetName works as expected", () => {
        expect(myUser.getName()).toBe(myUserData.name);
    });

    test("#retrieveAccount works as expected", () => {
        expect(myUser.retrieveAccount(1)).toBe(myUserData.accounts[1]);
    });

    test("#model property gives us our data as javascript object", () => {
        expect(myUser.model).toEqual(myUserData);
    });
});