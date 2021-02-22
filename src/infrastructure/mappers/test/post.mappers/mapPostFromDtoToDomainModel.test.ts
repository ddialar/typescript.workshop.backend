import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts } from '@testingFixtures'

import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'

describe('[MAPPERS] Post mapper - mapPostFromDtoToDomainModel', () => {
  it('maps successfully from DTO to Domain', () => {
    const [originalPost] = testingLikedAndCommentedPersistedDtoPosts
    const [expectedPost] = testingLikedAndCommentedPersistedDomainModelPosts

    const mappedData = mapPostFromDtoToDomainModel(originalPost)
    expect(mappedData).toStrictEqual(expectedPost)
  })
})
