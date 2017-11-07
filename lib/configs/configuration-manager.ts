import { injectable } from "inversify";
import { MindlessConfig } from "./config";

@injectable()
export class ConfigurationManager {

    private configs: Object = {};

    constructor(private mindlessConfig?: MindlessConfig) {
        if (mindlessConfig === undefined)
            return;

        var properties = Object.getOwnPropertyNames(mindlessConfig);
        properties.forEach((property) => {
            this.set(property, mindlessConfig[property]);
        });

    }

    public get(name: string): any {
        if (this.configs.hasOwnProperty(name)) {
            return this.configs[name];
        }
        else {
            throw Error(`Configuration entry with key '${name}' not found`);
        }
    }

    public set(name: string, value: any): void {
        this.configs[name] = value;
    }

    public setIfNonExistant(name: string, value: any): void {
        if (this.configs.hasOwnProperty(name))
            return;
        this.set(name, value);
    }
}