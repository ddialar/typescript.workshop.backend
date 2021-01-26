import { PostDto } from '@infrastructure/dtos'
import { mongodb } from '@infrastructure/orm'

const { models: { Post } } = mongodb

export const cleanPostsCollection = async () => Post.deleteMany({})

export const savePost = async (postData: PostDto) => (new Post(postData)).save()
export const savePosts = async (postsData: PostDto[]) => Post.insertMany(postsData)

export const getPostById = async (postId: string) => {
  const retrievedPost = await Post.findById(postId)
  return retrievedPost ? retrievedPost.toJSON() as PostDto : null
}
