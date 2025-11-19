import express from 'express';
import bodyParser from 'body-parser';
import paymentRouter from './routers/payment.routes';

const app = express();

app.use(bodyParser.json());

app.use('/', paymentRouter);

export default app;
