import { cleanEnv, str, port } from 'envalid';

const env = cleanEnv(process.env, {
  POSTGRES_USER: str({ default: 'user' }),
  POSTGRES_PASSWORD: str({ default: 'password' }),
  POSTGRES_DB: str({ default: 'inventorydb' }),
  POSTGRES_PORT: port({ default: 5433 }),

  INVENTORY_SERVICE_PORT: port({ default: 5600 }),

  NATS_PORT: port({ default: 4222 }),

  DATABASE_URL: str({
    default: 'postgresql://user:password@postgres:5433/inventorydb',
    desc: 'PostgreSQL connection string for Docker',
  }),
  NATS_URL: str({
    default: 'nats://nats:4222',
    desc: 'NATS server connection string for Docker',
  }),
  GRPC_PORT: port({ default: 50052 }),

  PORT: port({ default: 5600 }),
  // gRPC target for OrderService (use Docker service name when containerized)
  ORDER_GRPC_HOST: str({ default: 'order-service' }),
  ORDER_GRPC_PORT: port({ default: 50052 }),
});

export default env;
