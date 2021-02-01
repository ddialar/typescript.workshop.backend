import { Types } from 'mongoose'
import { Post } from '../models'
import { PostCommentDto, PostDto, PostLikeDto } from '@infrastructure/dtos'

export const create = async (post: PostDto): Promise<PostDto | null> => {
  const createdPost = await (new Post(post)).save()
  return createdPost ? createdPost.toJSON() : null
}

// Official documentation: https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
export const createComment = async (postId: string, postComment: PostCommentDto): Promise<PostDto | null> => {
  const conditions = { _id: postId }
  const update = { $push: { comments: postComment } }
  const options = { new: true }
  const updaterPost = await Post.findOneAndUpdate(conditions, update, options).lean()
  return updaterPost ? JSON.parse(JSON.stringify(updaterPost)) : null
}

export const getAll = async (): Promise<PostDto[] | null> => {
  const retrievedPosts = await Post.find({}).lean()
  return retrievedPosts ? JSON.parse(JSON.stringify(retrievedPosts)) as PostDto[] : null
}

export const getById = async (postId: string): Promise<PostDto | null> => Post.findById(postId).lean<PostDto>()

export const deletePost = async (postId: string): Promise<void> => {
  const conditions = { _id: postId }
  await Post.deleteOne(conditions)
}

export const getComment = async (postId: string, commentId: string): Promise<PostCommentDto | null> => {
  // REFACTOR Research about how to retrieve the selected comment from the post, using aggregation framework.
  const retrievedPost = await Post.findById({ _id: postId }).lean()
  return (JSON.parse(JSON.stringify(retrievedPost)) as PostDto).comments.find(({ _id }) => _id === commentId) || null
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
  return Object.keys(retrievedPostLike).length ? retrievedPostLike : null
}

export const like = async (postId: string, owner: PostLikeDto): Promise<PostDto | null> => {
  const conditions = { _id: postId }
  const update = { $push: { likes: owner } }
  const options = { new: true }
  const updaterPost = await Post.findOneAndUpdate(conditions, update, options).lean()
  return updaterPost ? JSON.parse(JSON.stringify(updaterPost)) : null
}

export const dislike = async (postId: string, userId: string): Promise<void> => {
  const conditions = { _id: postId }
  const update = { $pull: { likes: { userId } } }
  await Post.findOneAndUpdate(conditions, update)
}
