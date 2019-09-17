import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { verifyTokenResolver } from "../../composable/verify-token.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const userResolvers ={

    User : {
        posts:(user, {first = 10, offset = 0}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where : {author : user.get('id')},
                    limit: first,
                    offset
                }).catch(handleError)
        }
    },

    Query : {        
        users : (parent, {first = 10, offset = 0}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User.findAll({
                limit: first,
                offset
            }).catch(handleError)
        },
        user : (parent, {id}, {db} : {db : DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.User.findById(id)
                .then((user:UserInstance) => {
                    if(!user) throw new Error(`User with id ${id} not found!`)
                    return user
            }).catch(handleError)
        }
    },
    Mutation: {
        createUser : (parent, args, {db} : {db : DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t : Transaction) => {
                return db.User
                    .create(args.input, {transaction: t});
            }).catch(handleError);
        },
        updateUser : compose(...authResolvers)((parent, {input}, {db, authUser} : {db : DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t:Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) =>{
                        throwError(!user, `User with id ${authUser.id} not found!`) 
                        return user.update(input, {transaction : t})
                    })
            }).catch(handleError)
        }),
        updateUserPassword :compose(...authResolvers)((parent, {input}, {db, authUser} : {db : DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t:Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) =>{
                        throwError(!user, `User with id ${authUser.id} not found!`) 
                        return user.update(input, {transaction : t})
                            .then((user: UserInstance) => !! user)
                    })
            }).catch(handleError)
        }),
        deleteUser :compose(...authResolvers)((parent, args, {db, authUser} : {db : DbConnection, authUser : AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t:Transaction) => {
                return db.User.findById(authUser.id)
                    .then((user : UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`) 
                        return user.destroy({transaction : t})
                            //.then(user => !! user);
                })
            }).catch(handleError)
        })
    }
}