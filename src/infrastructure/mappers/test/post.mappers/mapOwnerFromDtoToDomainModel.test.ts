import { PostOwnerDomainModel } from '@domainModels'
import { testingDtoPostCommentOwners } from '@testingFixtures'

import { mapOwnerFromDtoToDomainModel } from '@infrastructure/mappers'
import { PostOwnerDto } from '@infrastructure/dtos'

describe('[MAPPERS] Post mapper - mapOwnerFromDtoToDomainModel', () => {
  it('maps successfully from Domain to DTO', () => {
    const [testingPostCommentOwner] = testingDtoPostCommentOwners
    const { userId, name, surname, avatar } = testingPostCommentOwner
    const originalOwner: PostOwnerDto = {
      ...testingPostCommentOwner,
      _id: userId,
      createdAt: (new Date()).toISOString().replace(/\dZ/, '0Z'),
      updatedAt: (new Date()).toISOString().replace(/\dZ/, '0Z')
    }
    const expectedOwner: PostOwnerDomainModel = {
      id: userId,
      name,
      surname,
      avatar
    }

    const mappedData = mapOwnerFromDtoToDomainModel(originalOwner)
    expect(mappedData).toStrictEqual(expectedOwner)
  })
})
