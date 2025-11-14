import { cleanEnv, str, port } from 'envalid';

const env = cleanEnv(process.env, {
  POSTGRES_USER: str({ default: 'user' }),
  POSTGRES_PASSWORD: str({ default: 'password' }),
  POSTGRES_DB: str({ default: 'orderdb' }),
  POSTGRES_PORT: port({ default: 5434 }),

  ORDER_SERVICE_PORT: port({ default: 5700 }),

  DATABASE_URL: str({
    default: 'postgresql://user:password@postgres:5434/orderdb',
    desc: 'PostgreSQL connection string for Docker',
  }),
});

export default env;
