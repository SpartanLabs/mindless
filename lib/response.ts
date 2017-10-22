export class Response {

    /**
     * 
     * @param statusCode 
     * @param headers 
     * @param body 
     */
    public constructor(
      public statusCode: number = 200,
      public body: {[key: string]: any}  = {},
      public headers: {[key: string]: string} = {}
    ) { }
  }