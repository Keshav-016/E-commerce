import env from '../env.js';
import app from './server.js';

const PORT = env.PORT;

async function start() {
  app.listen(PORT, () => {
    console.log(` User service running on port ${PORT}`);
  });
}

start();
