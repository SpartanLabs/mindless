import { injectable } from "inversify";

export interface MindlessConfig {
    dynamoEndpoint: string;
}

@injectable()
export class DefaultConfig implements MindlessConfig {
    public dynamoEndpoint: string = "http://localhost:8008";
}