import { UserDomainModel } from '@domainModels'

import { testingUsers } from '@testingFixtures'

// TODO Request user data to the database.
export const getUserByUsername = async (username: string): Promise<UserDomainModel> => {
  const selectedUser = testingUsers.find(user => user.username === username)!

  return await Promise.resolve({
    ...selectedUser,
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString()
  })
}
