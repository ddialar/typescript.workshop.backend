import { postDataSource } from '@infrastructure/dataSources'
import {
  CreatingPostCommentError,
  CreatingPostError,
  DeletingPostCommentError,
  DeletingPostLikeError,
  GettingPostCommentError,
  GettingPostError,
  GettingPostLikeError,
  LikingPostError,
  PostCommentNotFoundError,
  PostNotFoundError,
  UnauthorizedPostCommentDeletingError,
  UnauthorizedPostDeletingError,
  DeletingPostError,
  ApiError
} from '@errors'
import { ExtendedPostDomainModel, PostCommentDomainModel, PostDomainModel, PostLikeDomainModel, PostOwnerDomainModel } from '@domainModels'

// #################################################
// #####               POSTS                   #####
// #################################################

export const getPosts = async (): Promise<PostDomainModel[]> => {
  try {
    return await postDataSource.getPosts()
  } catch ({ message }) {
    throw new GettingPostError(`Error retereaving posts. ${message}`)
  }
}

export const getExtendedPosts = async (userId: string): Promise<ExtendedPostDomainModel[]> => {
  try {
    const retrievedPosts = await postDataSource.getPosts()
    return retrievedPosts.length ? extendPosts(userId, retrievedPosts) : retrievedPosts
  } catch ({ message }) {
    throw new GettingPostError(`Error retereaving posts. ${message}`)
  }
}

export const getPostById = async (postId: string): Promise<PostDomainModel> => {
  try {
    const retrievedPost = await postDataSource.getPostById(postId)

    if (!retrievedPost) { throw new Error('getPostById_not_found') }

    return retrievedPost
  } catch ({ message }) {
    throw message.match(/getPostById_not_found/)
      ? new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)
      : new GettingPostError(`Error retereaving post '${postId}'. ${message}`)
  }
}

export const createPost = async (owner: PostOwnerDomainModel, postBody: string): Promise<PostDomainModel> => {
  try {
    const createdPost = await postDataSource.createPost(owner, postBody)
    if (!createdPost) { throw new Error('Post creation process initiated but completed with NULL result') }
    return createdPost
  } catch ({ message }) {
    throw new CreatingPostError(`Error creating post for user '${owner.id}'. ${message}`)
  }
}

export const deletePost = async (postId: string, postOwnerId: string): Promise<void> => {
  const selectedPost = await getPostById(postId)

  try {
    if (selectedPost.owner.id !== postOwnerId) { throw new Error('deletePost_owner_mismatch') }
    await postDataSource.deletePost(postId)
  } catch ({ message }) {
    throw message.match(/deletePost_owner_mismatch/)
      ? new UnauthorizedPostDeletingError(`User '${postOwnerId}' is not the owner of the post '${postId}', which is trying to delete.`)
      : new DeletingPostError(`Error deleting post '${postId}' by user '${postOwnerId}'. ${message}`)
  }
}

// #################################################
// #####              COMMENTS                 #####
// #################################################

export const getPostComment = async (postId: string, commentId: string): Promise<PostCommentDomainModel | null> => {
  await getPostById(postId)

  try {
    return await postDataSource.getPostComment(postId, commentId)
  } catch ({ message }) {
    throw new GettingPostCommentError(`Error retereaving post comment. ${message}`)
  }
}

export const createPostComment = async (postId: string, commentBody: string, owner: PostOwnerDomainModel): Promise<PostDomainModel> => {
  await getPostById(postId)

  try {
    const createdPostComment = await postDataSource.createPostComment(postId, commentBody, owner)
    if (!createdPostComment) { throw new Error('Post comment insertion process initiated but completed with NULL result') }
    return createdPostComment
  } catch ({ message }) {
    throw new CreatingPostCommentError(`Error creating post '${postId}' commment by user '${owner.id}'. ${message}`)
  }
}

export const deletePostComment = async (postId: string, commentId: string, commentOwnerId: string): Promise<void> => {
  const selectedComment = await getPostComment(postId, commentId)

  try {
    if (!selectedComment) { throw new Error('deletePostComment_not_found') }
    if (selectedComment.owner.id !== commentOwnerId) { throw new Error('deletePostComment_unauthorized') }
    await postDataSource.deletePostComment(postId, commentId)
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error
      const possibleErrors: Record<string, ApiError> = {
        deletePostComment_not_found: new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`),
        deletePostComment_unauthorized: new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`),
        default: new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${message}`)
      }

      throw possibleErrors[message] || possibleErrors.default
    }
  }
}

// #################################################
// #####                LIKES                  #####
// #################################################

export const getPostLikeByOwnerId = async (postId: string, likeOwnerId: string): Promise<PostLikeDomainModel | null> => {
  try {
    return await postDataSource.getPostLikeByOwnerId(postId, likeOwnerId)
  } catch ({ message }) {
    throw new GettingPostLikeError(`Error retereaving post comment. ${message}`)
  }
}

export const likePost = async (postId: string, owner: PostOwnerDomainModel): Promise<void> => {
  await getPostById(postId)

  try {
    await postDataSource.likePost(postId, owner)
  } catch ({ message }) {
    throw new LikingPostError(`Error setting like to post '${postId}' by user '${owner.id}'. ${message}`)
  }
}

export const dislikePost = async (postId: string, likeOwnerId: string): Promise<void> => {
  await getPostById(postId)

  const selectedLike = await getPostLikeByOwnerId(postId, likeOwnerId)
  if (selectedLike) {
    try {
      await postDataSource.dislikePost(postId, selectedLike.id)
    } catch ({ message }) {
      throw new DeletingPostLikeError(`Error deleting like '${selectedLike.id}', from post '${postId}', by user '${likeOwnerId}'. ${message}`)
    }
  }
}

// #################################################
// #####                UTILS                  #####
// #################################################

const identifyIfUserIsPostOwner = (userId: string, post: PostDomainModel): ExtendedPostDomainModel => ({
  ...post,
  userIsOwner: userId === post.owner.id
})

const identifyIfUserHasLikedPost = (userId: string, post: ExtendedPostDomainModel): ExtendedPostDomainModel => ({
  ...post,
  userHasLiked: !!post.likes.find(({ id }) => userId === id)
})

const identifyUserPostComments = (userId: string, post: ExtendedPostDomainModel): ExtendedPostDomainModel => {
  const analyzedComments = post.comments.map(comment => ({ ...comment, userIsOwner: userId === comment.owner.id }))

  return {
    ...post,
    comments: analyzedComments
  }
}

const extendPosts = (userId: string, posts: PostDomainModel[]): ExtendedPostDomainModel[] =>
  posts.map(post => identifyUserPostComments(userId, identifyIfUserHasLikedPost(userId, identifyIfUserIsPostOwner(userId, post))))
