import { PaginationResponse } from 'src/common/pagination.response';
import { Task } from 'src/tasks/task.entity';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TaskStatus } from './../src/tasks/task.model';
import { TestSetup } from './test-setup';

describe('Tasks (e2e)', () => {
  let testSetup: TestSetup;
  let authToken: string;
  let taskId: string | undefined;
  let otherUserToken: string | undefined;

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  };

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);

    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const loginResponse: { body: { accessToken: string } } = await request(
      testSetup.app.getHttpServer(),
    )
      .post('/auth/login')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });

    authToken = loginResponse.body.accessToken;

    const response: { body: { id: string } } = await request(
      testSetup.app.getHttpServer(),
    )
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        description: 'Test Desc',
        status: TaskStatus.OPEN,
        labels: [{ name: 'test' }],
      });
    taskId = response.body.id;

    expect(taskId).toBeDefined();
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  it('should get all tasks', async () => {
    const response: { body: PaginationResponse<Task> } = await request(
      testSetup.app.getHttpServer(),
    )
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].id).toBe(taskId);
  });

  it('should not allow access to other users tasks', async () => {
    const otherUser = { ...testUser, email: 'other@example.com' };
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(otherUser)
      .expect(201);

    const loginResponse: { body: { accessToken: string } } = await request(
      testSetup.app.getHttpServer(),
    )
      .post('/auth/login')
      .send(otherUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });

    otherUserToken = loginResponse.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(403);
  });

  it('should not allow access to other users tasks by id', async () => {
    await request(testSetup.app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(403);
  });

  it('should not find other users tasks', async () => {
    const response: { body: PaginationResponse<Task> } = await request(
      testSetup.app.getHttpServer(),
    )
      .get('/tasks')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(200);

    expect(response.body.data.length).toBe(0);
  });
});
