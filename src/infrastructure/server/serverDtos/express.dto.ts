import { Request } from 'express'
import { UserDomainModel } from '@domainModels'
import { LoginInputParams } from '@infrastructure/types'

export interface RequestDto extends Request {
    user?: UserDomainModel | null
    loginData?: LoginInputParams
}
