import { cleanEnv, str, port } from 'envalid';

const env = cleanEnv(process.env, {
  POSTGRES_USER: str({ default: 'user' }),
  POSTGRES_PASSWORD: str({ default: 'password' }),
  POSTGRES_DB: str({ default: 'usersdb' }),
  POSTGRES_PORT: port({ default: 5432 }),

  DATABASE_URL: str({
    default: 'postgresql://user:password@localhost:5432/usersdb',
    desc: 'PostgreSQL connection string',
  }),

  DOCKER_DATABASE_URL: str({
    default: 'postgresql://user:password@postgres:5432/usersdb',
    desc: 'PostgreSQL connection string for Docker',
  }),

  PORT: port({ default: 5800 }),
});

export default env;
