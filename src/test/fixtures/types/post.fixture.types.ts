import { PostOwnerDomainModel } from '@domainModels'
import { PostOwnerDto } from '@infrastructure/dtos'
import { UserDomainModelFixture, UserDtoFixture } from './user.fixture.types'
interface BasicContentFixture {
  body: string
  createdAt: string
  updatedAt: string
}

export type OwnerDtoFixture = PostOwnerDto
export type CommentDtoFixture = BasicContentFixture & { _id: string, owner: OwnerDtoFixture }
export type LikeDtoFixture = OwnerDtoFixture
export type PostDtoFixture = BasicContentFixture & { _id: string, owner: OwnerDtoFixture, comments: CommentDtoFixture[], likes: LikeDtoFixture[] }

type OwnerDomainModelFixture = PostOwnerDomainModel
export type CommentDomainModelFixture = BasicContentFixture & { id: string, owner: OwnerDomainModelFixture }
export type LikeDomainModelFixture = OwnerDomainModelFixture
export type PostDomainModelFixture = BasicContentFixture & { id: string, owner: OwnerDomainModelFixture, comments: CommentDomainModelFixture[], likes: LikeDomainModelFixture[] }

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
