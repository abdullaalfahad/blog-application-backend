import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express, { type Application } from 'express';
import { auth } from './lib/auth';
import { postRouter } from './modules/post/post.router';

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  })
);

app.use('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use('/api/posts', postRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;
