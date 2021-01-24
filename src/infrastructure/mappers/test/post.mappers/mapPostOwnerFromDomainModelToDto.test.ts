import { PostOwnerDomainModel } from '@domainModels'
import { testingDomainModelPostOwners } from '@testingFixtures'

import { mapPostOwnerFromDomainModelToDto } from '@infrastructure/mappers'

describe('[MAPPERS] Post mapper - mapPostOwnerFromDomainModelToDto', () => {
  it('maps successfully from Domain to DTO', () => {
    const originalPostOwner = JSON.parse(JSON.stringify(testingDomainModelPostOwners[0])) as PostOwnerDomainModel
    const { id, ...otherOriginalPostOwnerFields } = originalPostOwner
    const expectedPostOwner = {
      ...otherOriginalPostOwnerFields,
      userId: id
    }

    const mappedData = mapPostOwnerFromDomainModelToDto(originalPostOwner)
    expect(mappedData).toStrictEqual(expectedPostOwner)
  })
})
