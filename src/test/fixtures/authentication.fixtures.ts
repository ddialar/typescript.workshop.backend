import {
  validJwtTokenForNonPersistedUser,
  expiredJwtToken,
  validHashedPassword,
  validPlainPassword,
  wrongPlainPassword
} from './assets/authentication.json'

export const testingValidJwtTokenForNonPersistedUser: string = validJwtTokenForNonPersistedUser.value
export const testingExpiredJwtToken: string = expiredJwtToken.value
export const testingValidHashedPassword: string = validHashedPassword.value
export const testingValidPlainPassword: string = validPlainPassword.value
export const testingWrongPlainPassword: string = wrongPlainPassword.value
