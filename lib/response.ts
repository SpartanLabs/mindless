export interface AWSLambdaIntegrationResponse {
  statusCode: number;
  body: string;
  headers: { [key: string]: string };
}

export class Response {

  /**
   * 
   * @param statusCode 
   * @param headers 
   * @param body 
   */
  public constructor(
    public statusCode: number = 200,
    public body: { [key: string]: any } = {},
    public headers: { [key: string]: string } = {}
  ) { }

  public toAWSLambdaIntegrationResponse(): AWSLambdaIntegrationResponse {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify(this.body),
      headers: this.headers
    }
  }
}