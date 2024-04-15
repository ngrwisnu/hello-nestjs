import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserTestService } from './user-test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let userTestHelper: UserTestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    userTestHelper = app.get(UserTestService);

    await app.init();
  });

  describe('POST /api/users', () => {
    afterEach(async () => {
      await userTestHelper.cleanTable();
    });

    it('should fail when request data is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should be able to register new user', async () => {
      const payload = {
        username: 'griffin',
        password: 'secret',
        name: 'griffin',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('username', payload.username);
      expect(response.body.data).toHaveProperty('name', payload.name);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail when username already exist', async () => {
      await userTestHelper.createUser();

      const payload = {
        username: 'griffin',
        password: 'secret',
        name: 'griffin',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {
    afterEach(async () => {
      await userTestHelper.cleanTable();
    });

    it('should fail when request data is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });

    it('should be able to perform the login', async () => {
      const payload = {
        username: 'griffin',
        password: 'secret',
        name: 'griffin',
      };

      // * create user
      await request(app.getHttpServer()).post('/api/users').send(payload);

      // * login user
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: payload.username,
          password: payload.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('username', payload.username);
      expect(response.body.data).toHaveProperty('name', payload.name);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).not.toHaveProperty('password');
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
    });

    afterEach(async () => {
      await userTestHelper.cleanTable();
    });

    it('should fail when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });

    it('should be able to get the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('username', 'griffin');
      expect(response.body.data).toHaveProperty('name', 'griffin');
      expect(response.body.data).not.toHaveProperty('password');
    });
  });

  describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
    });

    afterEach(async () => {
      await userTestHelper.cleanTable();
    });

    it('should fail when request data is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', 'token')
        .send({
          password: '',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it("should be able to update user's data", async () => {
      const payload = {
        password: 'newPass',
        name: 'stewie',
      };

      let response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', 'token')
        .send({
          password: payload.password,
          name: payload.name,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('username', 'griffin');
      expect(response.body.data).toHaveProperty('name', payload.name);
      expect(response.body.data).not.toHaveProperty('password');

      // * login with new password
      response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          password: payload.password,
          username: 'griffin',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('username', 'griffin');
      expect(response.body.data).toHaveProperty('name', payload.name);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).not.toHaveProperty('password');
    });
  });

  describe('DELETE /api/users/current', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
    });

    afterEach(async () => {
      await userTestHelper.cleanTable();
    });

    it('should fail when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });

    it('should be able to logout', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).not.toHaveProperty('data');

      const user = await userTestHelper.getUser();

      expect(user.token).toBeNull();
    });
  });
});
