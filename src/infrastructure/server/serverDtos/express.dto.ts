import { Request } from 'express'
import { UserDomainModel } from '@domainModels'
import { LoginInputParams } from '@infrastructure/types'
import { NewUserInputDto, NewUserProfileDto } from '@infrastructure/dtos'

export interface RequestDto extends Request {
    user?: UserDomainModel | null
    loginData?: LoginInputParams
    signinData?: NewUserInputDto
    newProfileData?: NewUserProfileDto
}
