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

    public get(key: string): any {
        if (this.configs.hasOwnProperty(key)) {
            return this.configs[key];
        }
        else {
            throw Error(`Configuration entry with key '${key}' not found`);
        }
    }

    public set(key: string, value: any): void {
        this.configs[key] = value;
    }

    public setIfNonExistant(key: string, value: any): void {
        if (this.configs.hasOwnProperty(key))
            return;
        this.set(key, value);
    }
}