import { Request } from 'express'
import { LoginInputParams } from '@infrastructure/types'

export interface RequestDto extends Request {
    loginData?: LoginInputParams
}
