import env from '../env.js';
import app from './express-server';
import './grpc/grpc.server.js';

const PORT = env.PORT;

async function start() {
  app.listen(PORT, () => {
    console.log(`Inventory service running on port ${PORT}`);
  });
}

start();
