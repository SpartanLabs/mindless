export abstract class Middleware {
  constructor() { }

  protected independent : boolean = true;

  public isIndependent() {
    return this.independent;
  }

  abstract handle(request);
}