import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import orderRoutes from './routes/orderRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import userRoutes from './routes/userRoute';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

app.use('/api', userRoutes);
app.use('/api', inventoryRoutes, orderRoutes);
// Health Check
app.get('/', (_req: Request, res: Response) => {
  res.send('🚀 API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
