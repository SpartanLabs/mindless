import Route from 'route-parser'
import { IRouteUrl } from './IRouteUrl'

// do not want to tie user code to route-parser.
// this allows us to change with out requiring users to.
export class RouteUrl extends Route implements IRouteUrl {
  getRaw(): string {
    return (this as any).spec
  }
}
