import { AuthenticatedUserDomainModel } from '@domainModels'
import { login } from '@domainServices'
import { LoginInputParams } from '@infrastructure/types'

// import { authEndpointsLogger } from '@logger'

import {
  ParentValue,
  Context
} from '../../types'

export const AuthenticationMutations = {
  login: async (parentValue: ParentValue, { username, password }: LoginInputParams, context: Context): Promise<AuthenticatedUserDomainModel> => {
    // TODO Implement a try/catch block in order to handle any possible API error.
    return await login(username, password)
  }
  // logout: async (parentValue: ParentValue, args: unknown, context: Context): Promise<void> => {
  //   // TODO Retrieve the username and user ID from the token in the specific directive.
  //   authEndpointsLogger('debug', `Logout process started for username: '${username}'.`)

  //   // TODO Implement the error handling for the try/catch blocks.
  //   try {
  //     await logout(userId)
  //     res.status(OK).end('User logged out successfully')
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}
