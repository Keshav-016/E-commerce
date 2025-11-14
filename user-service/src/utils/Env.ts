import { cleanEnv, str } from 'envalid';

const ENV = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development' }),
  USER_SERVICE_PORT: str({ default: '5500' }),
  DATABASE_URL: str(),
  DOCKER_DATABASE_URL: str(),
  JWT_SECRET: str({ default: 'secret' }),
  TOKEN_EXPIRATION: str({ default: '1h' }),
});

export default ENV;
