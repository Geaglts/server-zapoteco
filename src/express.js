import { createServer } from "http";
import express from "express";
import graphqlServer from "./graphql";
import cors from "cors";

const app = express();

app.set("port", process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

graphqlServer.applyMiddleware({ app, path: "/graphql" });

const httpServer = createServer(app);
graphqlServer.installSubscriptionHandlers(httpServer);

app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
});

export default { app, server: graphqlServer, httpServer };
