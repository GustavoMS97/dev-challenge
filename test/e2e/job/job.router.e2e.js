const request = require('supertest');

const runServer = require('../../../src/server');
const { seed } = require('../../../scripts/seedDb');

const JobController = require('../../../src/domain/job/job.controller');

describe('JobRouter', () => {
  let requestServer;

  beforeEach(async () => {
    requestServer = await runServer();
    await seed(requestServer.get('sequelize'));
  });

  describe('GET /jobs/unpaid', () => {
    it('(200) should return the unpaid jobs for a user', async () => {
      const response = await request(requestServer).get('/jobs/unpaid').set('profile_id', 1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          'Contract.status': 'in_progress',
          ContractId: 2,
          createdAt: expect.any(String),
          description: 'work',
          id: 2,
          paid: null,
          paymentDate: null,
          price: 201,
          updatedAt: expect.any(String)
        }
      ]);
    });

    it('(500) should return error if service fails for some reason', async () => {
      const error = new Error('test');
      const spy = jest
        .spyOn(JobController.prototype, 'getJobsByPaidStatusProfileIdAndContractStatus')
        .mockRejectedValueOnce(error);
      const response = await request(requestServer).get('/jobs/unpaid').set('profile_id', 1);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });
  });

  describe('POST /jobs/:job_id/pay', () => {
    it('(200) should return success after updating job/profile balance info', async () => {
      const response = await request(requestServer).post('/jobs/1/pay').set('profile_id', 1);
      expect(response.status).toBe(200);
    });

    it('(401) should return error if a contractor is calling the payment request', async () => {
      const response = await request(requestServer).post('/jobs/1/pay').set('profile_id', 7);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Only a client can perform the payment action' });
    });

    it('(404) should return error if job is not found', async () => {
      const response = await request(requestServer).post('/jobs/99/pay').set('profile_id', 1);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Job not found' });
    });

    it('(400) should error if job is already paid', async () => {
      const response = await request(requestServer).post('/jobs/1/pay').set('profile_id', 1);
      expect(response.status).toBe(200);

      const response2 = await request(requestServer).post('/jobs/1/pay').set('profile_id', 1);
      expect(response2.status).toBe(400);
      expect(response2.body).toEqual({ message: 'Job is already paid' });
    });

    it('(404) should return error if client does not have enough balance', async () => {
      const response = await request(requestServer).post('/jobs/5/pay').set('profile_id', 4);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: `You don't have enough balance to pay for this job` });
    });

    it('(500) should return error if service fails to find the job', async () => {
      const error = new Error('test');
      const spy = jest.spyOn(JobController.prototype, 'getJobByIdAndProfileId').mockRejectedValueOnce(error);
      const response = await request(requestServer).post('/jobs/5/pay').set('profile_id', 4);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: error.message });
      spy.mockRestore();
    });
  });
});
