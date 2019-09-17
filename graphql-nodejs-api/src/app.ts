import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'

import db from './models'
import schema from './graphql/schema'
import { extractJwtMddleware } from './middlewares/extract-jwt.middleware';

class App{

    public express : express.Application;

    constructor(){
        this.express = express();
        this.middleware();
    }

    private middleware(): void {
        this.express.use('/graphql', 

            extractJwtMddleware(),

            (req,res, next) =>{
                
                req['context'].db = db
                next()
            },
            graphqlHTTP((req) => ({
                schema,
                graphiql: process.env.NODE_ENV === 'development',
                context: req['context']
            }))
        )
    }
}

export default new App().express