import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts } from '@testingFixtures'

import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'

describe('[MAPPERS] Post mapper - mapPostFromDtoToDomainModel', () => {
  it('returns NULL when we don\'t provide data to be mapped', () => {
    expect(mapPostFromDtoToDomainModel(null)).toBeNull()
  })

  it('maps successfully from DTO to Domain', () => {
    const [originalPost] = testingLikedAndCommentedPersistedDtoPosts
    const [expectedPost] = testingLikedAndCommentedPersistedDomainModelPosts

    const mappedData = mapPostFromDtoToDomainModel(originalPost)
    expect(mappedData).toStrictEqual(expectedPost)
  })
})
