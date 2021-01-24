import { PostDomainModel, PostOwnerDomainModel, PostCommentDomainModel } from '@domainModels'
import { PostDto, PostOwnerDto, PostCommentDto } from '@infrastructure/dtos'

export const mapOwnerFromDtoToDomainModel = (owner: PostOwnerDto): PostOwnerDomainModel => {
  const { _id, userId, createdAt, updatedAt, ...otherOwnerFields } = owner
  return {
    id: userId,
    ...otherOwnerFields
  }
}

export const mapPostCommentFromDtoToDomainModel = (comment: PostCommentDto): PostCommentDomainModel => {
  const { _id, owner, ...otherCommentFields } = comment
  return {
    ...otherCommentFields,
    id: _id as string,
    owner: mapOwnerFromDtoToDomainModel(owner)
  }
}

export const mapPostFromDtoToDomainModel = (post: PostDto | null): PostDomainModel | null => {
  if (!post) { return post }

  const { _id, owner, comments, likes, ...oherPostFields } = post

  const parsedOwner = mapOwnerFromDtoToDomainModel(owner)
  const parsedComments = comments.map((comment) => mapPostCommentFromDtoToDomainModel(comment))
  const parsedLikes = likes.map((like) => mapOwnerFromDtoToDomainModel(like))
  return {
    ...oherPostFields,
    id: _id?.toString(),
    owner: parsedOwner,
    comments: parsedComments,
    likes: parsedLikes
  }
}

export const mapPostOwnerFromDomainModelToDto = (owner: PostOwnerDomainModel): PostOwnerDto => {
  const { id, ...otherOwnerFields } = owner
  return {
    ...otherOwnerFields,
    userId: id as string
  }
}
