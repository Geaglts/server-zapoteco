import App from "./express";
const { app, server, httpServer } = App;

// mongodb connection
import "./lib/mongo";

const PORT = app.get("port");
const GRAPHQL_PATH = server.graphqlPath;

httpServer.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}${GRAPHQL_PATH}`);
});
