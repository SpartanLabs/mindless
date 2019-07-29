import { RouteMetadata } from '../routing/IRouter'
import { RequestEvent } from './request-event'

export interface RequestBodyDeserializer {
  deserialize(event: RequestEvent<object>, metadata: RouteMetadata): object
}
