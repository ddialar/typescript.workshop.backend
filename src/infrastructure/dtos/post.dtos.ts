import { UserDomainModel } from '@domainModels'

type DatabaseFields = {
    _id?: string
    createdAt?: string
    updatedAt?: string
}

type BasicPostDto = DatabaseFields & {
    body: string
}

export type PostOwnerDto = Pick<UserDomainModel, 'name' | 'surname' | 'avatar'> & { userId: string } & DatabaseFields
type PostCommentOwnerDto = PostOwnerDto
export type PostLikeOwnerDto = PostOwnerDto

export type PostCommentDto = BasicPostDto & {
    owner: PostCommentOwnerDto
}

export interface PostDto extends BasicPostDto {
    owner: PostOwnerDto
    comments: PostCommentDto[]
    likes: PostLikeOwnerDto[]
}
