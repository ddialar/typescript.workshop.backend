import { UserDomainModel } from './user.domain.models'

interface BasicPostDomainModel {
  id?: string
  body: string
  createdAt?: string
  updatedAt?: string
}

export type PostOwnerDomainModel = Required<Pick<UserDomainModel, 'id' | 'name' | 'surname' | 'avatar'>>
export type PostCommentOwnerDomainModel = PostOwnerDomainModel
export type PostLikeOwnerDomainModel = PostOwnerDomainModel

export interface PostCommentDomainModel extends BasicPostDomainModel {
  owner: PostCommentOwnerDomainModel
}

export interface PostDomainModel extends BasicPostDomainModel {
  owner: PostOwnerDomainModel
  comments: PostCommentDomainModel[]
  likes: PostLikeOwnerDomainModel[]
}
