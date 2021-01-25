import { UserDto } from '@infrastructure/dtos'
import { UserProfileDomainModel } from '@domainModels'

import { testingUsers } from '@testingFixtures'

import { mapUserFromDtoToProfileDomainModel } from '@infrastructure/mappers'

const [{ id, username, email, name, surname, avatar, ...otherUserFields }] = testingUsers

describe('[MAPPERS] User mapper - mapUserFromDtoToProfileDomainModel', () => {
  it('maps successfully from DTO to Domain', () => {
    const originData: UserDto = {
      _id: id,
      username,
      email,
      name,
      surname,
      avatar,
      ...otherUserFields,
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString()
    }
    const expectedData: UserProfileDomainModel = {
      username,
      email,
      name,
      surname,
      avatar
    }
    const mappedData = mapUserFromDtoToProfileDomainModel(originData)

    expect(mappedData).toEqual(expectedData)
  })
})
