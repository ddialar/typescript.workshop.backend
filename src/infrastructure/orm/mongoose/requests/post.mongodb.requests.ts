import { Types } from 'mongoose'
import { Post } from '../models'
import { PostCommentDto, PostDto, PostLikeDto } from '@infrastructure/dtos'

export const create = async (post: PostDto): Promise<PostDto | null> => {
  const createdPost = await (new Post(post)).save()
  return createdPost ? createdPost.toJSON() as PostDto : null
}

// Official documentation: https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
export const createComment = async (postId: string, postComment: PostCommentDto): Promise<PostDto | null> => {
  const conditions = { _id: postId }
  const update = { $push: { comments: postComment } }
  const options = { new: true }
  return await Post.findOneAndUpdate(conditions, update, options).lean<PostDto>()
}

export const getAll = async (): Promise<PostDto[] | null> =>
  Post.find({}).lean<PostDto[]>()

export const getById = async (postId: string): Promise<PostDto | null> =>
  Post.findById(postId).lean<PostDto>()

export const deletePost = async (postId: string): Promise<void> => {
  const conditions = { _id: postId }
  await Post.deleteOne(conditions)
}

export const getComment = async (postId: string, commentId: string): Promise<PostCommentDto | null> => {
  const postMatcher = { $match: { _id: Types.ObjectId(postId) } }
  const commentMatcher = {
    $project: {
      _id: 0,
      comments: {
        $arrayElemAt: [{
          $filter: {
            input: '$comments',
            as: 'item',
            cond: { $eq: ['$$item._id', Types.ObjectId(commentId)] }
          }
        }, 0]
      }
    }
  }
  const commentReduction = {
    $project: {
      _id: '$comments._id',
      body: '$comments.body',
      owner: '$comments.owner',
      createdAt: '$comments.createdAt',
      updatedAt: '$comments.updatedAt'
    }
  }

  const [retrievedPost] = await Post.aggregate([
    postMatcher,
    commentMatcher,
    commentReduction
  ])

  return retrievedPost && Object.keys(retrievedPost).length ? retrievedPost : null
}

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  const conditions = { _id: postId }
  const update = { $pull: { comments: { _id: commentId } } }
  await Post.findOneAndUpdate(conditions, update)
}

export const getLikeByOwnerId = async (postId: string, ownerId: string): Promise<PostLikeDto | null> => {
  const postMatcher = { $match: { _id: Types.ObjectId(postId) } }
  const likeMatcher = {
    $project: {
      _id: 0,
      likes: {
        $arrayElemAt: [{
          $filter: {
            input: '$likes',
            as: 'item',
            cond: { $eq: ['$$item.userId', `${ownerId}`] }
          }
        }, 0]
      }
    }
  }
  const likeReduction = {
    $project: {
      _id: '$likes._id',
      userId: '$likes.userId',
      name: '$likes.name',
      surname: '$likes.surname',
      avatar: '$likes.avatar',
      createdAt: '$likes.createdAt',
      updatedAt: '$likes.updatedAt'
    }
  }

  const [retrievedPostLike] = await Post.aggregate<PostLikeDto>([
    postMatcher,
    likeMatcher,
    likeReduction
  ])

  // NOTE If no coincidences are found, the aggregation returns and empty object.
  return retrievedPostLike && Object.keys(retrievedPostLike).length ? retrievedPostLike : null
}

export const like = async (postId: string, owner: PostLikeDto): Promise<PostDto | null> => {
  const conditions = { _id: postId }
  const update = { $push: { likes: owner } }
  const options = { new: true }
  return await Post.findOneAndUpdate(conditions, update, options).lean<PostDto>()
}

export const dislike = async (postId: string, userId: string): Promise<void> => {
  const conditions = { _id: postId }
  const update = { $pull: { likes: { userId } } }
  await Post.findOneAndUpdate(conditions, update)
}
