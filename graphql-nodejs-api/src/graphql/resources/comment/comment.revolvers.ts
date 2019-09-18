import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";

import {handleError, throwError} from '../../../utils/utils'
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const commentResolvers = {

    Comment : {
        user :  (user, args, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User
                .findById(user.get('user'))
                .catch(handleError)
        },
        post :  (post, args, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findById(post.get('post'))
                .catch(handleError)
        }
    },

    Query : {
        commentsByPost : (parent, {id, first = 10, offset = 0}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.Comment
                .findAll({
                    where: { post: id},
                    limit: first,
                    offset
                })
                .catch(handleError)
        }
    },

    Mutation : {
        createComment : compose(...authResolvers)((parent, {input}, {db, authUser} : {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment.create(input, {transaction: t})
            }).catch(handleError)

        }),
        updateComment :compose(...authResolvers)((parent, {id, input}, {db, authUser} : {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`)
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit your comments`)
                        input.user = authUser.id;
                        return comment.update(input, {transaction: t})
                    });
            }).catch(handleError)
        }),
        deleteComment :compose(...authResolvers)((parent, {id}, {db, authUser} : {db:DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`)
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete your comments`)
                        return comment.destroy({transaction: t})
                            //.then(comment => !!comment)
                    });
            }).catch(handleError)
        }),
    }
}