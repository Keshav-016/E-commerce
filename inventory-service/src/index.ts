import env from '../env.js';
import app from './express-server';
import './grpc/server';

const PORT = env.PORT;

async function start() {
  app.listen(PORT, () => {
    console.log(`Inventory service running on port ${PORT}`);
  });
}

start();
