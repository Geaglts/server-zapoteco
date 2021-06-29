import { createServer } from 'http';
import express from 'express';
import graphqlServer from './graphql';
import cors from 'cors';
import { config } from './config';
const app = express();

app.set('port', config.port);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

graphqlServer.applyMiddleware({ app, path: '/graphql' });

const httpServer = createServer(app);
graphqlServer.installSubscriptionHandlers(httpServer);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default { app, server: graphqlServer, httpServer };
