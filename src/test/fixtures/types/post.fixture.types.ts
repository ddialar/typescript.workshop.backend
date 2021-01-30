import { UserDomainModelFixture, UserDtoFixture } from './user.fixture.types'

interface OwnerFixture {
  name: string
  surname: string
  avatar: string
}

export type OwnerDtoFixture = OwnerFixture & { _id: string, userId: string, createdAt: string, updatedAt: string }
type OwnerDomainModelFixture = OwnerFixture & { id: string }

interface CommentFixture {
  body: string
  createdAt: string
  updatedAt: string
}

export type CommentDtoFixture = CommentFixture & { _id: string, owner: OwnerDtoFixture }
export type CommentDomainModelFixture = CommentFixture & { id: string, owner: OwnerDomainModelFixture }

interface PostFixture {
  body: string
  createdAt: string
  updatedAt: string
}

export type LikeDtoFixture = OwnerDtoFixture
export type LikeDomainModelFixture = OwnerDomainModelFixture

export type PostDtoFixture = PostFixture & { _id: string, owner: OwnerDtoFixture, comments: CommentDtoFixture[], likes: LikeDtoFixture[] }
export type PostDomainModelFixture = PostFixture & { id: string, owner: OwnerDomainModelFixture, comments: CommentDomainModelFixture[], likes: LikeDomainModelFixture[] }

export interface MockedPosts {
  basicDtoPostOwners: UserDtoFixture[]
  basicDtoPostCommentOwners: UserDtoFixture[]
  basicDtoPostLikeOwners: UserDtoFixture[]
  basicDtoFreeUsers: UserDtoFixture[]

  basicDomainModelPostOwners: UserDomainModelFixture[]
  basicDomainModelPostCommentOwners: UserDomainModelFixture[]
  basicDomainModelPostLikeOwners: UserDomainModelFixture[]
  basicDomainModelFreeUsers: UserDomainModelFixture[]

  basicDtoPersistedPosts: PostDtoFixture[]
  commentedDtoPersistedPosts: PostDtoFixture[]
  likedAndCommentedDtoPersistedPosts: PostDtoFixture[]

  basicDomainModelPosts: PostDomainModelFixture[]
  commentedDomainModelPosts: PostDomainModelFixture[]
  likedAndCommentedDomainModelPosts: PostDomainModelFixture[]
}
