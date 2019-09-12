import { commentQueries } from './resources/comment/comment.shema'
import { postQueries } from './resources/post/post.schema'
import {userQueries} from './resources/user/user.schema'

const Query = `
    type Query{
        ${commentQueries}
        ${postQueries}
        ${userQueries}
    }
`

export {
    Query
}