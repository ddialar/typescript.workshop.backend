import { postComponent } from './Post'
import { newPostComponent } from './NewPost'
import { postArrayComponent } from './PostArray'
import { ownerComponent } from './Owner'
import { commentComponent } from './Comment'
import { commentArrayComponent } from './CommentArray'
import { likeArrayComponent } from './LikeArray'
import { emptyArrayComponent } from './EmptyArray'

export const posts = {
  ...newPostComponent,
  ...postComponent,
  ...postArrayComponent,
  ...ownerComponent,
  ...commentComponent,
  ...commentArrayComponent,
  ...likeArrayComponent,
  ...emptyArrayComponent
}
