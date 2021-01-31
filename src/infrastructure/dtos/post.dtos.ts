import { OwnerBasicStructure } from '@domainModels'

interface DatabaseSpecificStructure {
    _id?: string
    createdAt?: string
    updatedAt?: string
}

interface BasicContentStructure extends DatabaseSpecificStructure {
    body: string
}

export type PostOwnerDto = DatabaseSpecificStructure & OwnerBasicStructure & { userId: string }
type PostCommentOwnerDto = PostOwnerDto

export interface PostCommentDto extends BasicContentStructure {
    owner: PostCommentOwnerDto
}

export type PostLikeDto = PostOwnerDto

export interface PostDto extends BasicContentStructure {
    owner: PostOwnerDto
    comments: PostCommentDto[]
    likes: PostLikeDto[]
}
