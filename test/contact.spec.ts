import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserTestService } from './user-test.service';
import { TestModule } from './test.module';
import { ContactTestService } from './contact-test.service';
import { ContactResponse } from '../src/model/contact.model';

describe('ContactController', () => {
  let app: INestApplication;
  let userTestHelper: UserTestService;
  let contactTestHelper: ContactTestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    userTestHelper = app.get(UserTestService);
    contactTestHelper = app.get(ContactTestService);

    await app.init();
  });

  beforeEach(async () => {
    await contactTestHelper.cleanTable();
    await userTestHelper.cleanTable();
  });

  afterAll(async () => {
    await contactTestHelper.cleanTable();
    await userTestHelper.cleanTable();
  });

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
    });

    afterEach(async () => {
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when request data is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'token')
        .send({
          first_name: '',
          last_name: '',
          email: 'email',
          phone: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'token-x')
        .send({
          first_name: '',
          last_name: '',
          email: 'email',
          phone: '',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should be able to add new contact', async () => {
      const payload = {
        first_name: 'brian',
        last_name: 'griffin',
        email: 'brian@email.com',
        phone: '99991234',
      };

      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty(
        'first_name',
        payload.first_name,
      );
      expect(response.body.data).toHaveProperty('last_name', payload.last_name);
      expect(response.body.data).toHaveProperty('email', payload.email);
      expect(response.body.data).toHaveProperty('phone', payload.phone);
      expect(response.body.data).toHaveProperty('user_id', 'griffin');
    });
  });

  describe('GET /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
    });

    afterEach(async () => {
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when contact is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-x')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should return correct contact', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', 'contact-1');
      expect(response.body.data).toHaveProperty('first_name', 'stewie');
      expect(response.body.data).toHaveProperty('last_name', 'griffin');
      expect(response.body.data).toHaveProperty('email', 'stewie@email.com');
      expect(response.body.data).toHaveProperty('phone');
      expect(response.body.data).toHaveProperty('user_id', 'griffin');
    });
  });

  describe('PUT /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
    });

    afterEach(async () => {
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when contact is not found', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-x')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should throw error when request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1')
        .set('Authorization', 'token')
        .send({
          first_name: '',
          last_name: '',
          email: 'email',
          phone: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it("should be able to update contact's first_name, phone and email", async () => {
      const payload = {
        first_name: 'louis',
        email: 'louis@email.com',
        phone: '88889090',
      };

      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        new ContactResponse({
          id: 'contact-1',
          first_name: payload.first_name,
          last_name: 'griffin',
          email: payload.email,
          phone: payload.phone,
          user_id: 'griffin',
        }),
      );

      const contact = await contactTestHelper.getContact('contact-1');

      expect(contact.first_name).toBe(payload.first_name);
      expect(contact.email).toBe(payload.email);
      expect(contact.phone).toBe(payload.phone);
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
    });

    afterEach(async () => {
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-1')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when contact is not found', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-x')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should be able to remove contact', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const contact = await contactTestHelper.getContact('contact-1');

      expect(contact).toBeNull();
    });
  });
});
