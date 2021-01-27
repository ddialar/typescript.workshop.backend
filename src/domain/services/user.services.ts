import { updateUserById } from '@infrastructure/dataSources'
// import { UpdatingUserError } from '@errors'
import { getUtcTimestampIsoString } from '@common'

export const updateUserLoginData = async (userId: string, token: string): Promise<void> => {
  try {
    await updateUserById(userId, { token, lastLoginAt: getUtcTimestampIsoString() })
  } catch ({ message }) {
    // throw new UpdatingUserError(`Error updating user '${userId}' login data. ${message}`)
    // TODO Crear error específico 500
    throw new Error(`Error updating user '${userId}' login data. ${message}`)
  }
}
