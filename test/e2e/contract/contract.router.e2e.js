const request = require('supertest');

const runServer = require('../../../src/server');
const { seed } = require('../../../scripts/seedDb');
const ContractController = require('../../../src/domain/contract/contract.controller');

describe('ContractRouter', () => {
  let requestServer;
  const now = new Date('2024-02-21 10:00:00Z');
  beforeAll(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    requestServer = await runServer();
    await seed(requestServer.get('sequelize'));
  });

  describe('GET /contracts/:id', () => {
    it('(200) should return the contract by id, if it belongs to that user', async () => {
      const response = await request(requestServer).get('/contracts/1').set('profile_id', 1);
      expect(response.status).toBe(200);
    });

    it('(401) should return error if user does not exist', async () => {
      const response = await request(requestServer).get('/contracts/1').set('profile_id', 99);
      expect(response.status).toBe(401);
    });

    it('(401) should return error if user is not in the header', async () => {
      const response = await request(requestServer).get('/contracts/1');
      expect(response.status).toBe(401);
    });

    it('(404) should return error if contract does not belong to user', async () => {
      const response = await request(requestServer).get('/contracts/1').set('profile_id', 2);
      expect(response.status).toBe(404);
    });

    it('(500) should return error if something fails inside the code', async () => {
      const error = new Error('test');
      const spy = jest.spyOn(ContractController.prototype, 'getByIdAndProfileId').mockRejectedValueOnce(error);
      const response = await request(requestServer).get('/contracts/1').set('profile_id', 2);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });
  });

  describe('GET /contracts/', () => {
    it('(200) should return the users non-terminated contracts', async () => {
      const response = await request(requestServer).get('/contracts').set('profile_id', 1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          ClientId: 1,
          ContractorId: 6,
          createdAt: '2024-02-21 10:00:00.000 +00:00',
          id: 2,
          status: 'in_progress',
          terms: 'bla bla bla',
          updatedAt: '2024-02-21 10:00:00.000 +00:00'
        }
      ]);
    });

    it('(500) should return error if controller throws an error', async () => {
      const error = new Error('test');
      const spy = jest.spyOn(ContractController.prototype, 'getByProfileIdAndStatus').mockRejectedValueOnce(error);
      const response = await request(requestServer).get('/contracts').set('profile_id', 1);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });
});
