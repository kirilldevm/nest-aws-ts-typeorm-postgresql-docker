/**
 * E2E test setup: set env vars before ConfigModule validates.
 * Must run before any module imports (use via jest setupFiles).
 */
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_PASSWORD = 'postgres';
process.env.POSTGRES_DB = 'tasks_e2e';
process.env.DB_SYNC = '1';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '3600';
