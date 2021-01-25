import { PostCommentDomainModel } from '@domainModels'
import { testingCommentedPersistedDtoPosts } from '@testingFixtures'

import { mapPostCommentFromDtoToDomainModel } from '@infrastructure/mappers'
import { PostCommentDto } from '@infrastructure/dtos'

describe('[MAPPERS] Post mapper - mapPostCommentFromDtoToDomainModel', () => {
  it('maps successfully from Domain to DTO', () => {
    const [selectedPost] = testingCommentedPersistedDtoPosts
    const [orifginalComment] = selectedPost.comments as PostCommentDto[]
    const { _id: commentId, owner, ...otherCommentFields } = orifginalComment
    const { _id: commentOwnerId, userId, createdAt, updatedAt, ...otherCommentOwnerFields } = owner

    const expectedOwner: PostCommentDomainModel = {
      ...otherCommentFields,
      id: commentId,
      owner: {
        id: userId,
        ...otherCommentOwnerFields
      }
    }

    const mappedData = mapPostCommentFromDtoToDomainModel(orifginalComment)
    expect(mappedData).toStrictEqual(expectedOwner)
  })
})
