import { Request } from 'express'
import { UserDomainModel } from '@domainModels'

export interface RequestDto extends Request {
    user?: UserDomainModel | null
}
