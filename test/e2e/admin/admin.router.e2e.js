const request = require('supertest');

const runServer = require('../../../src/server');
const { seed } = require('../../../scripts/seedDb');
const ProfileController = require('../../../src/domain/profile/profile.controller');

describe('AdminRouter', () => {
  let requestServer;

  beforeAll(async () => {
    requestServer = await runServer();
    await seed(requestServer.get('sequelize'));
  });

  describe('GET /admin/best-profession?start=<date>&end=<date>', () => {
    it('(200) should return the best contractor in a date range', async () => {
      const response = await request(requestServer).get('/admin/best-profession?start=2020-08-10&end=2020-08-17');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ earnings: 2683, profession: 'Programmer' });
    });

    it('(500) should return error if profile controller fails', async () => {
      const error = new Error('test');
      const spy = jest.spyOn(ProfileController.prototype, 'getProfessionByEarningDesc').mockRejectedValueOnce(error);
      const response = await request(requestServer).get('/admin/best-profession?start=2020-08-10&end=2020-08-17');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });

    it('(500) should return error if no start date is sent', async () => {
      const response = await request(requestServer).get('/admin/best-profession');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"start" is required' });
    });

    it('(500) should return error if no end date is sent', async () => {
      const response = await request(requestServer).get('/admin/best-profession?start=2020-01-01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"end" is required' });
    });

    it('(500) should return error if start date is invalid', async () => {
      const response = await request(requestServer).get('/admin/best-profession?start=2020/01/01&end=2020-01-01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"start" must be in YYYY-MM-DD format' });
    });

    it('(500) should return error if end date is invalid', async () => {
      const response = await request(requestServer).get('/admin/best-profession?start=2020-01-01&end=2020/01/01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"end" must be in YYYY-MM-DD format' });
    });
  });

  describe('GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>', () => {
    it('(200) should return the best clients in a date range with limit', async () => {
      const response = await request(requestServer).get('/admin/best-clients?start=2020-08-10&end=2020-08-17&limit=3');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { fullName: 'Ash Kethcum', id: 4, paid: 2020 },
        { fullName: 'Mr Robot', id: 2, paid: 442 },
        { fullName: 'Harry Potter', id: 1, paid: 442 }
      ]);
    });

    it('(200) should return the best clients in a date range with limit as default (2)', async () => {
      const response = await request(requestServer).get('/admin/best-clients?start=2020-08-10&end=2020-08-17');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { fullName: 'Ash Kethcum', id: 4, paid: 2020 },
        { fullName: 'Mr Robot', id: 2, paid: 442 }
      ]);
    });

    it('(500) should return error if profile controller fails with an error', async () => {
      const error = new Error('test');
      const spy = jest
        .spyOn(ProfileController.prototype, 'getClientsThatPaidTheMostWithRangeAndLimit')
        .mockRejectedValueOnce(error);
      const response = await request(requestServer).get('/admin/best-clients?start=2020-08-10&end=2020-08-17');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });

    it('(500) should return error if no start date is sent', async () => {
      const response = await request(requestServer).get('/admin/best-clients');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"start" is required' });
    });

    it('(500) should return error if no end date is sent', async () => {
      const response = await request(requestServer).get('/admin/best-clients?start=2020-01-01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"end" is required' });
    });

    it('(500) should return error if start date is invalid', async () => {
      const response = await request(requestServer).get('/admin/best-clients?start=2020/01/01&end=2020-01-01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"start" must be in YYYY-MM-DD format' });
    });

    it('(500) should return error if end date is invalid', async () => {
      const response = await request(requestServer).get('/admin/best-clients?start=2020-01-01&end=2020/01/01');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: '"end" must be in YYYY-MM-DD format' });
    });
  });
});
