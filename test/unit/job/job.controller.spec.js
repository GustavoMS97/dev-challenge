const { Op } = require('sequelize');

const JobController = require('../../../src/domain/job/job.controller');

describe('JobController', () => {
  const modelMock = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
  };

  const controller = new JobController({ jobModel: modelMock, contractModel: modelMock });

  describe('findById', () => {
    it('should return an object from the DB successfully', async () => {
      const expectedObject = { test: 1 };
      modelMock.findOne.mockResolvedValueOnce(expectedObject);
      await expect(controller.findById({ id: 1 })).resolves.toEqual(expectedObject);
    });

    it('should return a formatted error if DB fails and throws an error', async () => {
      const expectedError = new Error('test error');
      modelMock.findOne.mockRejectedValueOnce(expectedError);
      await expect(controller.findById({ id: 1 })).rejects.toEqual(new Error(`Error getting job by id=1`));
    });
  });

  describe('updatePaidById', () => {
    it('should return true when update is successful', async () => {
      modelMock.update.mockResolvedValueOnce(true);
      await expect(controller.updatePaidById({ id: 1 })).resolves.toEqual(true);
    });

    it('should return a formatted error if DB fails to update', async () => {
      const now = new Date();
      jest.useFakeTimers();
      jest.setSystemTime(now);
      modelMock.update.mockRejectedValueOnce(new Error('test'));
      await expect(controller.updatePaidById({ id: 1 })).rejects.toEqual(
        new Error(`Error updating job=1 to paid status with payment date=${now}`)
      );
      expect(modelMock.update).toHaveBeenCalledWith({ paid: true, paymentDate: now }, { where: { id: 1 } });

      jest.useRealTimers();
      jest.resetAllMocks();
    });
  });

  describe('getJobByIdAndProfileId', () => {
    it('should get a job by id and profile id', async () => {
      const expected = { test: 1 };
      modelMock.findOne.mockResolvedValueOnce(expected);
      await expect(controller.getJobByIdAndProfileId({ id: 1, profileId: 1 })).resolves.toEqual(expected);
      expect(modelMock.findOne).toHaveBeenCalledWith({
        raw: false,
        where: { id: 1 },
        include: [
          {
            model: modelMock,
            as: 'Contract',
            required: true,
            where: { [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }] }
          }
        ]
      });
    });

    it('should return formatted error if DB fils to find job', async () => {
      modelMock.findOne.mockRejectedValueOnce(new Error('test'));
      await expect(controller.getJobByIdAndProfileId({ id: 1, profileId: 1 })).rejects.toEqual(
        new Error(`Error getting jobs by profileId=1 and id=1`)
      );
    });
  });

  describe('getJobsByPaidStatusProfileIdAndContractStatus', () => {
    it('should return job by paid status, profile id and contractStatus', async () => {
      const expected = [{ a: 1 }, { b: 2 }];
      modelMock.findAll.mockResolvedValueOnce(expected);
      await expect(
        controller.getJobsByPaidStatusProfileIdAndContractStatus({
          contractStatus: 'in_progress',
          paidStatus: false,
          profileId: 1
        })
      ).resolves.toEqual(expected);
      expect(modelMock.findAll).toHaveBeenCalledWith({
        raw: false,
        where: { [Op.or]: [{ paid: false }, { paid: { [Op.is]: null } }] },
        include: [
          {
            model: modelMock,
            as: 'Contract',
            required: true,
            where: { status: 'in_progress', [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }] },
            attributes: ['status']
          }
        ]
      });
    });

    it('should return job by paid status is true, profile id and contractStatus', async () => {
      const expected = [{ a: 1 }, { b: 2 }];
      modelMock.findAll.mockResolvedValueOnce(expected);
      await expect(
        controller.getJobsByPaidStatusProfileIdAndContractStatus({
          contractStatus: 'in_progress',
          paidStatus: true,
          profileId: 1
        })
      ).resolves.toEqual(expected);
      expect(modelMock.findAll).toHaveBeenCalledWith({
        raw: false,
        where: { paid: true },
        include: [
          {
            model: modelMock,
            as: 'Contract',
            required: true,
            where: { status: 'in_progress', [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }] },
            attributes: ['status']
          }
        ]
      });
    });

    it('should return error if DB fails to query job by paid status, profile id and contractStatus', async () => {
      modelMock.findAll.mockRejectedValueOnce(new Error('test'));
      await expect(
        controller.getJobsByPaidStatusProfileIdAndContractStatus({
          contractStatus: 'in_progress',
          paidStatus: false,
          profileId: 1
        })
      ).rejects.toEqual(new Error(`Error getting jobs by profileId=1, paid status=false, contract status=in_progress`));
    });
  });
});
