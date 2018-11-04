import { Request } from '../request'
import { Response } from '../response'

export type CustomErrorHandler = (e: Error, r: Request) => Response
