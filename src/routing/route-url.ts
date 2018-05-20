import Route from 'route-parser'

// don't want to tie user code to route-parser.
// this allows us to change with out requiring usrs to.
export class RouteUrl extends Route {}
