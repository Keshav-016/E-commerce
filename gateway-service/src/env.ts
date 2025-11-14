import { cleanEnv, str, port } from 'envalid';

const env = cleanEnv(process.env, {
  PORT: port(),
  ORDERS_SERVICE_URL: str(),
  INVENTORY_SERVICE_URL: str(),
  USERS_SERVICE_URL: str(),
  JWT_SECRET: str(),
});

export default env;
