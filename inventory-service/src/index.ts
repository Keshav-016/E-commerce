import env from '../env.js';
import app from './express-server';
import './grpc/grpc.server.js';
import startOrderCreatedConsumer from './kafka/kafka.listeners';
import kafkaService from './kafka/kafka.service';

const PORT = env.PORT;

async function start() {
  app.listen(PORT, async () => {
    await kafkaService.initProducer();

    // Start listening for messages
    await startOrderCreatedConsumer();
    console.log(`Inventory service running on port ${PORT}`);
  });
}

start();
