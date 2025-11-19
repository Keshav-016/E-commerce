import { Env } from '../env';
import app from './server';

const PORT = Env.PAYMENT_SERVICE_PORT;

const start = async () => {
  try {
    app.listen(PORT, async () => {
      console.log(`REST API Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting servers:', error);
    process.exit(1);
  }
};

start();
