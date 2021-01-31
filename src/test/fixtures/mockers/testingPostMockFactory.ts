import { lorem } from 'faker'
import { generateMockedMongoDbId } from './utils'
import { UserDomainModel } from '@domainModels'
import {
  UserDomainModelFixture,
  UserDtoFixture,
  OwnerDtoFixture,
  CommentDtoFixture,
  CommentDomainModelFixture,
  PostDtoFixture,
  PostDomainModelFixture,
  LikeDtoFixture,
  LikeDomainModelFixture,
  MockedPosts
} from '../types'

const domainModelOwnerFactory = (rawOwner: UserDomainModel): UserDomainModelFixture => {
  const { id, name, surname, avatar } = rawOwner
  return { id, name, surname, avatar }
}

const dtoOwnerFactory = (rawOwner: UserDomainModel): UserDtoFixture => {
  const { id, name, surname, avatar, createdAt, updatedAt } = rawOwner
  return {
    _id: generateMockedMongoDbId(),
    userId: id,
    name,
    surname,
    avatar,
    createdAt,
    updatedAt
  }
}

const postDtoFactory = (owner: UserDomainModel): PostDtoFixture => ({
  _id: generateMockedMongoDbId(),
  body: lorem.paragraphs(),
  owner: dtoOwnerFactory(owner),
  comments: [],
  likes: [],
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
})

const commentDtoFactory = (owner: UserDomainModel): CommentDtoFixture => ({
  _id: generateMockedMongoDbId(),
  body: lorem.paragraph(),
  owner: dtoOwnerFactory(owner),
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
})

const likeDtoFactory = (owner: UserDomainModel): OwnerDtoFixture => dtoOwnerFactory(owner)

const createPostsDto = (owners: UserDomainModel[]): PostDtoFixture[] => owners.map((owner) => postDtoFactory(owner))

const createCommentsDto = (owners: UserDomainModel[]) => {
  const amountOfComments = Math.floor(Math.random() * (5 - 1)) + 1
  return [...Array(amountOfComments)].map(() => {
    const ownerIndex = Math.floor(Math.random() * (owners.length - 1)) + 1
    const commentOwner = owners[ownerIndex]

    return commentDtoFactory(commentOwner)
  })
}

const createLikesDto = (owners: UserDomainModel[]): OwnerDtoFixture[] => {
  const amountOfComments = Math.floor(Math.random() * (5 - 1)) + 1
  return [...Array(amountOfComments)].map(() => {
    const ownerIndex = Math.floor(Math.random() * (owners.length - 1)) + 1
    const likeOwner = owners[ownerIndex]

    return likeDtoFactory(likeOwner)
  })
}

const commentPost = (post: PostDtoFixture, comments: CommentDtoFixture[]): PostDtoFixture => {
  const commentedPost: PostDtoFixture = JSON.parse(JSON.stringify(post))
  commentedPost.comments = JSON.parse(JSON.stringify(comments))
  return commentedPost
}

const likePost = (post: PostDtoFixture, likes: OwnerDtoFixture[]): PostDtoFixture => {
  const likedPost: PostDtoFixture = JSON.parse(JSON.stringify(post))
  likedPost.likes = JSON.parse(JSON.stringify(likes))
  return likedPost
}

const mapPostFromDtoToDomainModel = (post: PostDtoFixture): PostDomainModelFixture => {
  const { _id: postDatabaseId, owner, comments, likes, ...otherPostFields } = post
  const { _id: ownerDatabaseId, userId, createdAt, updatedAt, ...otherOwnerFields } = owner

  return {
    id: postDatabaseId,
    owner: {
      id: userId,
      ...otherOwnerFields
    },
    comments: mapPostCommentsFromDtoToDomainModel(comments),
    likes: mapPostLikesFromDtoToDomainModel(likes),
    ...otherPostFields
  }
}

const mapPostCommentsFromDtoToDomainModel = (postComments: CommentDtoFixture[]): CommentDomainModelFixture[] =>
  postComments.map((comment) => {
    const { _id: commentDatabaseId, owner, ...otherCommentFields } = comment
    const { _id: ownerDatabaseId, userId, createdAt, updatedAt, ...otherOwnerFields } = owner

    return {
      id: commentDatabaseId,
      owner: {
        id: userId,
        ...otherOwnerFields
      },
      ...otherCommentFields
    }
  })

const mapPostLikesFromDtoToDomainModel = (postLikes: LikeDtoFixture[]): LikeDomainModelFixture[] =>
  postLikes.map((like) => {
    const { _id, userId, createdAt, updatedAt, ...otherOwnerFields } = like

    return {
      id: userId,
      ...otherOwnerFields
    }
  })

export const createMockedPosts = (mockedUsers: UserDomainModel[]): MockedPosts => {
  const users: UserDomainModel[] = [...mockedUsers]
  const postOwners = users.splice(0, 5)
  const postCommentOwners = users.splice(0, 100)
  const postLikeOwners = users.splice(0, 100)
  const postFreeOwners = users.splice(0, 100)

  const basicDomainModelPostOwners = postOwners.map((owner) => domainModelOwnerFactory(owner))
  const basicDomainModelPostCommentOwners = postCommentOwners.map((owner) => domainModelOwnerFactory(owner))
  const basicDomainModelPostLikeOwners = postLikeOwners.map((owner) => domainModelOwnerFactory(owner))
  const basicDomainModelFreeUsers = postFreeOwners.map((owner) => domainModelOwnerFactory(owner))

  const basicDtoPostOwners = postOwners.map((owner) => dtoOwnerFactory(owner))
  const basicDtoPostCommentOwners = postCommentOwners.map((owner) => dtoOwnerFactory(owner))
  const basicDtoPostLikeOwners = postLikeOwners.map((owner) => dtoOwnerFactory(owner))
  const basicDtoFreeUsers = postFreeOwners.map((owner) => dtoOwnerFactory(owner))

  const basicDtoPersistedPosts = createPostsDto(postOwners)

  const postDtoComments = basicDtoPersistedPosts.map(() => createCommentsDto(postCommentOwners))
  const postDtoLikes = basicDtoPersistedPosts.map(() => createLikesDto(postLikeOwners))

  const commentedDtoPersistedPosts = basicDtoPersistedPosts.map((post, index) => commentPost(post, postDtoComments[index]))
  const likedAndCommentedDtoPersistedPosts = commentedDtoPersistedPosts.map((post, index) => likePost(post, postDtoLikes[index]))

  const basicDomainModelPosts = basicDtoPersistedPosts.map((dtoPost) => mapPostFromDtoToDomainModel(dtoPost))
  const commentedDomainModelPosts = commentedDtoPersistedPosts.map((dtoPost) => mapPostFromDtoToDomainModel(dtoPost))
  const likedAndCommentedDomainModelPosts = likedAndCommentedDtoPersistedPosts.map((dtoPost) => mapPostFromDtoToDomainModel(dtoPost))

  return {
    basicDtoPostOwners,
    basicDtoPostCommentOwners,
    basicDtoPostLikeOwners,
    basicDtoFreeUsers,

    basicDomainModelPostOwners,
    basicDomainModelPostCommentOwners,
    basicDomainModelPostLikeOwners,
    basicDomainModelFreeUsers,

    basicDtoPersistedPosts,
    commentedDtoPersistedPosts,
    likedAndCommentedDtoPersistedPosts,

    basicDomainModelPosts,
    commentedDomainModelPosts,
    likedAndCommentedDomainModelPosts
  }
}
