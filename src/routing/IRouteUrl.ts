export interface IRouteUrl {
  getRaw(): string
  match(pathname: string): { [i: string]: string } | false
}
