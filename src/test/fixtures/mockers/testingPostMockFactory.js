const { lorem } = require('faker')
const { generateMockedMongoDbId } = require('./utils')

const domainModelOwnerFactory = (rawOwner) => {
  const { id, name, surname, avatar } = rawOwner
  return { id, name, surname, avatar }
}

const dtoOwnerFactory = (rawOwner) => {
  const { id, name, surname, avatar } = rawOwner
  return { userId: id, name, surname, avatar }
}

const postDtoFactory = (owner) => ({
  _id: generateMockedMongoDbId(),
  body: lorem.paragraphs(),
  owner: {
    _id: generateMockedMongoDbId(),
    ...dtoOwnerFactory(owner),
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString()
  },
  comments: [],
  likes: [],
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
})

const commentDtoFactory = (owner) => ({
  _id: generateMockedMongoDbId(),
  body: lorem.paragraph(),
  owner: {
    _id: generateMockedMongoDbId(),
    ...dtoOwnerFactory(owner),
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString()
  },
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
})

const likeDtoFactory = (owner) => ({
  _id: generateMockedMongoDbId(),
  ...dtoOwnerFactory(owner),
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
})

const createPostsDto = (owners) => owners.map((owner) => postDtoFactory(owner))
const createCommentsDto = (owners) => {
  const amountOfComments = Math.floor(Math.random() * (5 - 1)) + 1
  return [...Array(amountOfComments)].map(() => {
    const ownerIndex = Math.floor(Math.random() * (owners.length - 1)) + 1
    const commentOwner = owners[ownerIndex]

    return commentDtoFactory(commentOwner)
  })
}
const createLikesDto = (owners) => {
  const amountOfComments = Math.floor(Math.random() * (5 - 1)) + 1
  return [...Array(amountOfComments)].map(() => {
    const ownerIndex = Math.floor(Math.random() * (owners.length - 1)) + 1
    const likeOwner = owners[ownerIndex]

    return likeDtoFactory(likeOwner)
  })
}

const commentPost = (post, comments) => {
  const commentedPost = JSON.parse(JSON.stringify(post))
  commentedPost.comments = JSON.parse(JSON.stringify(comments))
  return commentedPost
}

const likePost = (post, likes) => {
  const likedPost = JSON.parse(JSON.stringify(post))
  likedPost.likes = JSON.parse(JSON.stringify(likes))
  return likedPost
}

const mapPostFromDtoToDomainModel = (post) => {
  const { _id: postDatabaseId, owner, ...otherPostFields } = post
  const { _id: ownerDatabaseId, userId, createdAt, updatedAt, ...otherOwnerFields } = owner

  return {
    id: postDatabaseId,
    owner: {
      id: userId,
      ...otherOwnerFields
    },
    ...otherPostFields
  }
}

const mapPostCommentsFromDtoToDomainModel = (post) => {
  const postToBeMapped = JSON.parse(JSON.stringify(post))
  const { comments } = postToBeMapped

  const mappedComments = comments.map((comment) => {
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

  postToBeMapped.comments = mappedComments

  return postToBeMapped
}

const mapPostLikesFromDtoToDomainModel = (post) => {
  const postToBeMapped = JSON.parse(JSON.stringify(post))
  const { likes } = postToBeMapped

  const mappedLikes = likes.map((like) => {
    const { _id, userId, createdAt, updatedAt, ...otherOwnerFields } = like

    return {
      id: userId,
      ...otherOwnerFields
    }
  })

  postToBeMapped.likes = mappedLikes

  return postToBeMapped
}

const createMockedPosts = ({ mockedUsers }) => {
  const users = [].concat(mockedUsers)
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
  const commentedDomainModelPosts = commentedDtoPersistedPosts
    .map((dtoPost) => mapPostCommentsFromDtoToDomainModel(dtoPost))
    .map((dtoPost) => mapPostFromDtoToDomainModel(dtoPost))
  const likedAndCommentedDomainModelPosts = likedAndCommentedDtoPersistedPosts
    .map((dtoPost) => mapPostLikesFromDtoToDomainModel(dtoPost))
    .map((dtoPost) => mapPostCommentsFromDtoToDomainModel(dtoPost))
    .map((dtoPost) => mapPostFromDtoToDomainModel(dtoPost))

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

module.exports = { createMockedPosts }
