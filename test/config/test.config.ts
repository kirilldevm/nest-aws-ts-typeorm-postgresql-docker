export const testConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'tasks_e2e',
    synchronize: true,
  },
  app: {
    port: 3001,
    messagePrefix: 'Hello',
  },
  auth: {
    jwt: {
      secret: 'test-secret',
      expiresIn: 60 * 60,
    },
  },
};
