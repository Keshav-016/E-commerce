import { cleanEnv, port, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PAYMENT_SERVICE_PORT: port({ default: 5900 }),
});
