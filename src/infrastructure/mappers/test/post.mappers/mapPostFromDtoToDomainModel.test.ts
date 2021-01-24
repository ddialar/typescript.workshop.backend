import { PostDomainModel } from '@domainModels'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts } from '@testingFixtures'
import { PostDto } from '@infrastructure/dtos'

import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'

describe('[MAPPERS] Post mapper - mapPostFromDtoToDomainModel', () => {
  it('returns NULL when we don\'t provide data to be mapped', () => {
    expect(mapPostFromDtoToDomainModel(null)).toBeNull()
  })

  it('maps successfully from DTO to Domain', () => {
    const originalPost = JSON.parse(JSON.stringify(testingLikedAndCommentedPersistedDtoPosts[0])) as PostDto
    const expectedPost = JSON.parse(JSON.stringify(testingLikedAndCommentedPersistedDomainModelPosts[0])) as PostDomainModel

    const mappedData = mapPostFromDtoToDomainModel(originalPost)
    expect(mappedData).toStrictEqual(expectedPost)
  })
})
