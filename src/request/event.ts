export enum HttpMethods {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  OPTIONS,
  HEAD
}

export interface Event {
  headers: { [key: string]: string },
  path: string,
  pathParameters: { [key: string]: string },
  requestContext: { [key: string]: any },
  resource: string,
  httpMethod: string,
  queryStringParameters: { [key: string]: any },
  stageVariables: { [key: string]: any },
  body: string,
  isOffline?: boolean
}

/*
export class Event {
  constructor(
    protected headers: { [key: string]: string },
    protected pathParameters: { [key: string]: string },
    protected requestContext: { [key: string]: any },
    protected queryStringParameters: { [key: string]: any },
    protected stageVariables: { [key: string]: any },
    protected body: string,
    path: string,
    resource: string,
    httpMethod: HttpMethods,
    isOffline?: boolean
  ) {} */