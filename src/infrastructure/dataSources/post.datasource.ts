import { PostCommentDomainModel, PostDomainModel, PostLikeDomainModel, PostOwnerDomainModel } from '@domainModels'
import { PostCommentDto, PostDto, PostOwnerDto } from '@infrastructure/dtos'
import { mapPostCommentFromDtoToDomainModel, mapPostFromDtoToDomainModel, mapPostOwnerFromDomainModelToDto } from '@infrastructure/mappers'
import { mongodb } from '@infrastructure/orm'

export const postFactory = (owner: PostOwnerDto, body: string): PostDto => ({
  body,
  owner,
  comments: [],
  likes: []
})

export const postCommentFactory = (owner: PostOwnerDto, body: string): PostCommentDto => ({
  body,
  owner
})

export const createPost = async (owner: PostOwnerDomainModel, body: string): Promise<PostDomainModel | null> => {
  const createdPost = await mongodb.requests.post.create(postFactory(mapPostOwnerFromDomainModelToDto(owner), body))
  return createdPost ? mapPostFromDtoToDomainModel(createdPost) : null
}

export const createPostComment = async (postId: string, body: string, owner: PostOwnerDomainModel) => {
  const postCommented = await mongodb.requests.post.createComment(postId, postCommentFactory(mapPostOwnerFromDomainModelToDto(owner), body))
  // TODO Review this return because before creating the comment, the post existance must be checked, so it has not sense to return a null.
  return postCommented ? mapPostFromDtoToDomainModel(postCommented) : null
}

export const getPosts = async (): Promise<PostDomainModel[]> => {
  const persistedPosts = await mongodb.requests.post.getAll()
  return persistedPosts ? persistedPosts.map((post) => mapPostFromDtoToDomainModel(post)!) : []
}

export const getPostById = async (postId: string): Promise<PostDomainModel | null> => {
  const persistedPost = await mongodb.requests.post.getById(postId)
  return persistedPost ? mapPostFromDtoToDomainModel(persistedPost)! : null
}

export const deletePost = async (postId: string): Promise<void> =>
  mongodb.requests.post.deletePost(postId)

export const getPostComment = async (postId: string, commentId: string): Promise<PostCommentDomainModel | null> => {
  const persistedComment = await mongodb.requests.post.getComment(postId, commentId)
  return persistedComment ? mapPostCommentFromDtoToDomainModel(persistedComment)! : null
}

export const deletePostComment = async (postId: string, commentId: string): Promise<void> =>
  mongodb.requests.post.deleteComment(postId, commentId)

export const likePost = async (postId: string, owner: PostLikeDomainModel): Promise<PostDomainModel> =>
  mapPostFromDtoToDomainModel(await mongodb.requests.post.like(postId, mapPostOwnerFromDomainModelToDto(owner)))

export const dislikePost = async (postId: string, userId: string): Promise<PostDomainModel> =>
  mapPostFromDtoToDomainModel(await mongodb.requests.post.dislike(postId, userId))
