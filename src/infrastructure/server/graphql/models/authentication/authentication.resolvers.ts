import { AuthenticatedUserDomainModel } from '@domainModels'
import { login } from '@domainServices'
import { LoginInputParams } from '@infrastructure/types'

import {
  ParentValue,
  Context
} from '../../types'

export const AuthenticationMutations = {
  login: async (parentValue: ParentValue, { username, password }: LoginInputParams, context: Context): Promise<AuthenticatedUserDomainModel> => {
    return await login(username, password)
  }
}
