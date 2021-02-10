import { Request } from 'express'
import { UserDomainModel } from '@domainModels'
import { LoginInputParams } from '@infrastructure/types'
import { PostDto, NewUserInputDto, NewUserProfileDto, PostCommentDto } from '@infrastructure/dtos'

export interface RequestDto extends Request {
    user?: UserDomainModel | null
    loginData?: LoginInputParams
    signinData?: NewUserInputDto
    newProfileData?: NewUserProfileDto
    postId?: Required<PostDto>['_id']
    postBody?: PostDto['body']
    postComment?: {
        postId: Required<PostDto>['_id']
        commentId: Required<PostCommentDto>['_id']
    }
    newPostComment?: {
        postId: Required<PostDto>['_id']
        commentBody: PostDto['body']
    }
}
