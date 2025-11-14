import express from 'express';
import bodyParser from 'body-parser';
import orderRoutes from './routes/order.routes';
import adminOrderRoutes from './routes/admin.order.routes';

const app = express();

app.use(bodyParser.json());

app.use('/', orderRoutes);
app.use('/admin', adminOrderRoutes);

export default app;
