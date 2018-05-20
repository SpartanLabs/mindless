export interface Context {
  functionName: string
  functionVersion: string
  invokedFunctionArn: string
  awsRequestId: string
  logGroupName: string
  logStreamName: string
  identity: any // idk?
  clientContext: any // idk?
}
