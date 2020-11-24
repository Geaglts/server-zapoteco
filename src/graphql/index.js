if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

import { ApolloServer, PubSub } from "apollo-server-express";
import typeDefs from "./schema";
import resolvers from "./resolvers/";
import { PrismaClient } from "@prisma/client";
import * as Utils from "../utils";

const pubsub = new PubSub();
const prisma = new PrismaClient();

export default new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true,
    subscriptions: {
        onConnect: () => console.log("Conectado a WS"),
    },
    context: (req) => {
        const authorization = req.req?.headers.authorization;
        if (!authorization) {
            return { req, prisma, pubsub };
        }

        const token = authorization.replace("Bearer ");

        const { verifyToken } = Utils.token;
        const data = verifyToken(token);

        return { req, prisma, user: data.data, pubsub };
    },
});
