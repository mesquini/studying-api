import { commentMutations } from './resources/comment/comment.shema'
import { postMutations } from './resources/post/post.schema'
import {userMutations} from './resources/user/user.schema'

const Mutation = `
    type Mutation {
        ${commentMutations}
        ${postMutations}
        ${userMutations}
    }
`

export {
    Mutation
}