import { NewUserInputDto } from '@infrastructure/dtos'
import { NewUserDomainModel } from '@domainModels'

import { testingUsers } from '@testingFixtures'

import { mapNewUserFromDtoToDomainModel } from '@infrastructure/mappers'

const { email, password, name, surname, avatar } = testingUsers[0]

describe('[MAPPERS] User mapper - mapNewUserFromDtoToDomainModel', () => {
  it('maps successfully from DTO to Domain', () => {
    const originData: NewUserInputDto = {
      email,
      password,
      name,
      surname,
      avatar
    }
    const expectedData: NewUserDomainModel = {
      ...originData,
      username: email
    }
    const mappedData = mapNewUserFromDtoToDomainModel(originData)

    expect(mappedData).toEqual(expectedData)
  })
})
