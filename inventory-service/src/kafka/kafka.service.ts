import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import env from '../../env';

class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS.split(','),
    });
  }

  /** -------- PRODUCER ---------- **/
  async initProducer(): Promise<void> {
    if (this.producer) return;

    this.producer = this.kafka.producer();
    await this.producer.connect();

    console.log('✅ Kafka producer connected');
  }

  async send(topic: string, message: any): Promise<void> {
    if (!this.producer) {
      await this.initProducer();
    }

    await this.producer!.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`📤 Message sent to ${topic}`);
  }

  /** -------- CONSUMER ---------- **/
  async createConsumer(groupId: string): Promise<Consumer> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    return consumer;
  }

  async subscribe(
    consumer: Consumer,
    topic: string,
    handler: (payload: EachMessagePayload) => Promise<void>
  ) {
    await consumer.subscribe({ topic });

    console.log(`📥 Listening on topic: ${topic}`);

    await consumer.run({
      eachMessage: async (payload) => {
        try {
          await handler(payload);
        } catch (err) {
          console.error('❌ Error in handler:', err);
        }
      },
    });
  }
}

export default new KafkaService();
