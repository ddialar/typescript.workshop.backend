import { UserDomainModel } from './user.domain.models'

interface DatabaseSpecificStructure {
  id?: string
  createdAt?: string
  updatedAt?: string
}

interface BasicContentStructure extends DatabaseSpecificStructure {
  body: string
}

export type OwnerBasicStructure = Pick<UserDomainModel, 'name' | 'surname' | 'avatar'>

export type PostOwnerDomainModel = OwnerBasicStructure & Pick<UserDomainModel, 'id'>
export type PostCommentOwnerDomainModel = PostOwnerDomainModel

export type PostCommentDomainModel = BasicContentStructure & {
  owner: PostCommentOwnerDomainModel
}

export type PostLikeDomainModel = PostOwnerDomainModel

export interface PostDomainModel extends BasicContentStructure {
  owner: PostOwnerDomainModel
  comments: PostCommentDomainModel[]
  likes: PostLikeDomainModel[]
}

export interface ExtendedPostDomainModel extends PostDomainModel {
  userIsOwner?: boolean
  userHasLiked?: boolean
  comments: (PostCommentDomainModel & { userIsOwner?: boolean })[]
}
