import { AuthenticatedUserDomainModel } from '@domainModels'
import { login } from '@domainServices'

import {
  ParentValue,
  Context
} from '../../types'

interface LoginArgs {
  username: string
  password: string
}

const AuthenticationMutations = {
  login: async (parentValue: ParentValue, { username, password }: LoginArgs, context: Context): Promise<AuthenticatedUserDomainModel> => {
    return await login(username, password)
  }
}

export {
  AuthenticationMutations
}
