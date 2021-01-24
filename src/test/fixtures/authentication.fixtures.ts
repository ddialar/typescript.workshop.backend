import { validJwtTokenForNonPersistedUser, expiredJwtToken, validHashedPassword, validPlainPassword, wrongPlainPassword } from './assets/authentication.json'

export const testingValidJwtTokenForNonPersistedUser = validJwtTokenForNonPersistedUser.value
export const testingExpiredJwtToken = expiredJwtToken.value
export const testingValidHashedPassword = validHashedPassword.value
export const testingValidPlainPassword = validPlainPassword.value
export const testingWrongPlainPassword = wrongPlainPassword.value
