import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
// #endregion

export class TestSetup {
  // #region Properties - What this class manages
  // The NestJS application instance we'll test against
  app: INestApplication;
  // Database connection that lets us clean data between tests
  dataSource: DataSource;
  // #endregion

  // #region Setup - Creating and initializing test environment
  // Static factory method - easier to use than constructor
  static async create(module: any) {
    const instance = new TestSetup();
    await instance.init(module);
    return instance;
  }

  // Sets up testing module with custom configuration
  private async init(module: any) {
    // setup-env.ts sets process.env (POSTGRES_DB=tasks_e2e, JWT_SECRET, etc.)
    // before ConfigModule validates; use real ConfigService for proper bootstrap
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [module],
    }).compile();

    // Create NestJS application
    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalInterceptors(
      new ClassSerializerInterceptor(moduleFixture.get(Reflector)),
    );
    this.app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    // Get database connection
    this.dataSource = moduleFixture.get(DataSource);
    // Initialize app (starts servers, connects to db etc.)
    await this.app.init();
  }
  // #endregion

  // #region Database Operations - Managing test data
  // Cleans all tables between tests
  async cleanup() {
    // Get all entity metadata to find table names
    const entities = this.dataSource.entityMetadatas;
    // Create list of table names for SQL query
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');
    // TRUNCATE removes all data
    // RESTART IDENTITY resets auto-increment counters
    // CASCADE handles foreign key relationships
    await this.dataSource.query(
      `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
    );
  }
  // #endregion

  // #region Cleanup - Properly closing everything after tests
  // Properly close database and app after tests
  async teardown() {
    await this.dataSource.destroy(); // Close database connection
    await this.app.close(); // Shut down NestJS app
  }
  // #endregion
}
