import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserTestService } from './user-test.service';
import { TestModule } from './test.module';
import { ContactTestService } from './contact-test.service';
import { AddressTestService } from './address-test.service';
import { AddressResponse } from '../src/model/address.model';

describe('AddressController', () => {
  let app: INestApplication;
  let userTestHelper: UserTestService;
  let contactTestHelper: ContactTestService;
  let addressTestHelper: AddressTestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    userTestHelper = app.get(UserTestService);
    contactTestHelper = app.get(ContactTestService);
    addressTestHelper = app.get(AddressTestService);

    await app.init();
  });

  describe('POST /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
    });

    afterEach(async () => {
      await addressTestHelper.cleanTable();
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when request data is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts/contact-1/addresses')
        .set('Authorization', 'token')
        .send({
          address: '',
          postal_code: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts/contact-1/addresses')
        .set('Authorization', 'token-x')
        .send({
          address: 'address content',
          postal_code: 11111,
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should be able to add new address', async () => {
      const payload = {
        address: 'address content',
        postal_code: 11111,
      };

      const response = await request(app.getHttpServer())
        .post('/api/contacts/contact-1/addresses')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('address', payload.address);
      expect(response.body.data).toHaveProperty(
        'postal_code',
        payload.postal_code,
      );
      expect(response.body.data).toHaveProperty('contact_id', 'contact-1');
    });
  });

  describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
      await addressTestHelper.createAddress();
    });

    afterEach(async () => {
      await addressTestHelper.cleanTable();
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when contact id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-x/addresses/address-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when address id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1/addresses/address-x')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should return the correct address object', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        new AddressResponse({
          id: 'address-1',
          address: 'address content',
          postal_code: 11111,
          contact_id: 'contact-1',
        }),
      );
    });
  });

  describe('PUT /api/contacts/:contactId/addresses/:addressId', () => {
    const payload = {
      address: 'new address content',
      postal_code: 22222,
    };

    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
      await addressTestHelper.createAddress();
    });

    afterEach(async () => {
      await addressTestHelper.cleanTable();
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when contact id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-x/addresses/address-1')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when address id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1/addresses/address-x')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token-x')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should be able to update the address', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        new AddressResponse({
          id: 'address-1',
          address: payload.address,
          postal_code: payload.postal_code,
          contact_id: 'contact-1',
        }),
      );

      const address = await addressTestHelper.getAddress();

      expect(address.address).toBe(payload.address);
      expect(address.postal_code).toBe(payload.postal_code);
    });
  });

  describe('DELETE /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
      await addressTestHelper.createAddress();
    });

    afterEach(async () => {
      await addressTestHelper.cleanTable();
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when contact id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-x/addresses/address-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when address id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-1/addresses/address-x')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should be able to remove the address', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/contact-1/addresses/address-1')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const address = await addressTestHelper.getAddress();

      expect(address).toBeNull();
    });
  });

  describe('GET /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await userTestHelper.createUser('token');
      await contactTestHelper.createContact();
      await addressTestHelper.createAddress();
    });

    afterEach(async () => {
      await addressTestHelper.cleanTable();
      await contactTestHelper.cleanTable();
      await userTestHelper.cleanTable();
    });

    it('should fail when contact id is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-x/addresses')
        .set('Authorization', 'token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should fail when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1/addresses')
        .set('Authorization', 'token-x');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should return the addresses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/contact-1/addresses')
        .set('Authorization', 'token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toEqual(
        new AddressResponse({
          id: 'address-1',
          address: 'address content',
          postal_code: 11111,
          contact_id: 'contact-1',
        }),
      );
    });
  });
});
