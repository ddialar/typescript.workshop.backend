import {
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
} from './assets/posts.json'
import { PostDomainModelFixture, PostDtoFixture, UserDomainModelFixture, UserDtoFixture } from './types'
import { generateMockedMongoDbId } from './utils.fixtures'

export const testingDtoPostOwners: UserDtoFixture[] = basicDtoPostOwners
export const testingDtoPostCommentOwners: UserDtoFixture[] = basicDtoPostCommentOwners
export const testingDtoPostLikeOwners: UserDtoFixture[] = basicDtoPostLikeOwners
export const testingDtoFreeUsers: UserDtoFixture[] = basicDtoFreeUsers

export const testingDomainModelPostOwners: UserDomainModelFixture[] = basicDomainModelPostOwners
export const testingDomainModelPostCommentOwners: UserDomainModelFixture[] = basicDomainModelPostCommentOwners
export const testingDomainModelPostLikeOwners: UserDomainModelFixture[] = basicDomainModelPostLikeOwners
export const testingDomainModelFreeUsers: UserDomainModelFixture[] = basicDomainModelFreeUsers

export const testingBasicPersistedDtoPosts: PostDtoFixture[] = basicDtoPersistedPosts
export const testingCommentedPersistedDtoPosts: PostDtoFixture[] = commentedDtoPersistedPosts
export const testingLikedAndCommentedPersistedDtoPosts: PostDtoFixture[] = likedAndCommentedDtoPersistedPosts

export const testingBasicPersistedDomainModelPosts: PostDomainModelFixture[] = basicDomainModelPosts
export const testingCommentedPersistedDomainModelPosts: PostDomainModelFixture[] = commentedDomainModelPosts
export const testingLikedAndCommentedPersistedDomainModelPosts: PostDomainModelFixture[] = likedAndCommentedDomainModelPosts

export const testingNonValidPostId = generateMockedMongoDbId()
export const testingNonValidPostCommentId = generateMockedMongoDbId()
export const testingNonValidCommentOwnerId = generateMockedMongoDbId()
export const testingNonValidLikeOwnerId = generateMockedMongoDbId()
