import { makeExecutableSchema } from 'graphql-tools'
import { ENUM_VALUE_DEFINITION } from 'graphql/language/kinds';

const users : any[] = [
    {
        id : 1,
        name: 'Jon',
        email: 'jon@gmail.com'
    },
    {
        id : 2,
        name: 'Ana',
        email: 'ana@gmail.com'
    }
]

const typeDefs = `
    type User {
        id: ID!
        name: String!
        email: String!
    }

    type Query{
        allUser: [User!]!
    }

    type Mutation{
        createUser(name: String!, email : String!): User
    }
`;

const resolvers = {    
    Query : {
        allUser : () => users
    },
    Mutation : {
        createUser : (parent, args) => {
            const newUser = Object.assign({id: users.length +1}, args);
            users.push(newUser)
            return newUser
        }
    }
}

export default makeExecutableSchema({typeDefs, resolvers})