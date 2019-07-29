import { RouteMetadata } from '../routing/IRouter'
import { RequestBodyDeserializer } from './request-body-deserializer'
import { RequestEvent } from './request-event'

export class DefaultBodyDeserializer implements RequestBodyDeserializer {
  deserialize(event: RequestEvent<object>, metadata: RouteMetadata): object {
    return event.body
  }
}
