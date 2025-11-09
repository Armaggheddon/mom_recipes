import express, { Request, Response } from 'express';
import v1Router from './routes/v1/index';
import { logger } from './middlewares/logger.middleware';

const app = express();

app.use(express.json());
app.use(logger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.use('/api/v1', v1Router);

export default app;
