import express from 'express';
import bodyParser from 'body-parser';
import inventoryRoutes from './routes/inventory.routes';
import adminInventoryRoutes from './routes/admin.routes';
import cartRoutes from './routes/cart.routes';

const app = express();

app.use(bodyParser.json());

app.use('/admin', adminInventoryRoutes);
app.use('/', inventoryRoutes, cartRoutes);

export default app;
