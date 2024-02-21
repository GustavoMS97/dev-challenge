const request = require('supertest');

const runServer = require('../../../src/server');
const { seed } = require('../../../scripts/seedDb');
const JobController = require('../../../src/domain/job/job.controller');

describe('BalanceRouter', () => {
  let requestServer;

  beforeEach(async () => {
    requestServer = await runServer();
    await seed(requestServer.get('sequelize'));
  });

  describe('POST /balances/deposit/:userId', () => {
    it('(200) should return success for the deposit', async () => {
      const response = await request(requestServer)
        .post('/balances/deposit/1')
        .set('profile_id', 1)
        .send({ deposit: 10 });
      expect(response.status).toBe(200);
    });

    it('(401) should return error if a contractor calls the deposit api', async () => {
      const response = await request(requestServer)
        .post('/balances/deposit/7')
        .set('profile_id', 7)
        .send({ deposit: 10 });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Only clients can deposit into their account' });
    });

    it('(401) should return error if a client tries to deposit to another user', async () => {
      const response = await request(requestServer)
        .post('/balances/deposit/2')
        .set('profile_id', 1)
        .send({ deposit: 10 });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Cannot deposit into other clients account' });
    });

    it('(400) should return error if a deposit amount is not in the request', async () => {
      const response = await request(requestServer).post('/balances/deposit/1').set('profile_id', 1);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: '"deposit" is required' });
    });

    it('(400) should return error if a deposit amount is greater than 25% of the total jobs to pay', async () => {
      const response = await request(requestServer)
        .post('/balances/deposit/1')
        .set('profile_id', 1)
        .send({ deposit: 100 });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: `Client cannot deposit more than 25% of it's total jobs to pay` });
    });

    it('(500) should return error job controller fails with an error', async () => {
      const error = new Error('test');
      const spy = jest
        .spyOn(JobController.prototype, 'getJobsByPaidStatusProfileIdAndContractStatus')
        .mockRejectedValueOnce(error);
      const response = await request(requestServer)
        .post('/balances/deposit/1')
        .set('profile_id', 1)
        .send({ deposit: 10 });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });
  });
});
