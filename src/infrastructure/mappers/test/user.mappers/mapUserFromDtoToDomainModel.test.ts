import { UserDto } from '@infrastructure/dtos'
import { UserDomainModel } from '@domainModels'

import { testingUsers } from '@testingFixtures'

import { mapUserFromDtoToDomainModel } from '@infrastructure/mappers'

const [{ id, ...otherUserFields }] = testingUsers

describe('[MAPPERS] User mapper - mapUserFromDtoToDomainModel', () => {
  it('maps successfully from DTO to Domain when we provide user information', () => {
    const originData: UserDto = {
      _id: id,
      ...otherUserFields,
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString()
    }
    const expectedData: UserDomainModel = {
      id,
      ...otherUserFields,
      createdAt: originData.createdAt,
      updatedAt: originData.updatedAt
    }
    const mappedData = mapUserFromDtoToDomainModel(originData)

    expect(mappedData).toEqual(expectedData)
  })

  it('must return null when we provide null', () => {
    const mappedData = mapUserFromDtoToDomainModel(null)

    expect(mappedData).toBeNull()
  })
})
