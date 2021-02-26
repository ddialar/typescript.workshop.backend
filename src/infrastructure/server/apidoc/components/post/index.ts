import { postComponent } from './Post'
import { extendedPostComponent } from './ExtendedPost'
import { newPostComponent } from './NewPost'
import { postArrayComponent } from './PostArray'
import { extendedPostArrayComponent } from './ExtendedPostArray'
import { ownerComponent } from './Owner'
import { commentComponent } from './Comment'
import { extendedCommentComponent } from './ExtendedComment'
import { commentArrayComponent } from './CommentArray'
import { extendedCommentArrayComponent } from './ExtendedCommentArray'
import { likeArrayComponent } from './LikeArray'
import { emptyArrayComponent } from './EmptyArray'

export const posts = {
  ...newPostComponent,
  ...postComponent,
  ...extendedPostComponent,
  ...postArrayComponent,
  ...extendedPostArrayComponent,
  ...ownerComponent,
  ...commentComponent,
  ...extendedCommentComponent,
  ...commentArrayComponent,
  ...extendedCommentArrayComponent,
  ...likeArrayComponent,
  ...emptyArrayComponent
}
