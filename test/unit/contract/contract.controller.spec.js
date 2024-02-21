const { Op } = require('sequelize');

const ContractController = require('../../../src/domain/contract/contract.controller');

describe('ContractController', () => {
  const modelMock = {
    findOne: jest.fn(),
    findAll: jest.fn()
  };

  const controller = new ContractController({ contractModel: modelMock });

  describe('getByIdAndProfileId', () => {
    it('should return an object from the DB successfully', async () => {
      const expectedObject = { test: 1 };
      modelMock.findOne.mockResolvedValueOnce(expectedObject);
      await expect(controller.getByIdAndProfileId({ id: 1, profileId: 1 })).resolves.toEqual(expectedObject);
      expect(modelMock.findOne).toHaveBeenCalledWith({
        where: { id: 1, [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }] }
      });
    });

    it('should return a formatted error if DB fails and throws an error', async () => {
      const expectedError = new Error('test error');
      modelMock.findOne.mockRejectedValueOnce(expectedError);
      await expect(controller.getByIdAndProfileId({ id: 1, profileId: 1 })).rejects.toEqual(
        new Error(`Error getting contract by id=1 and profileId=1`)
      );
    });
  });

  describe('getByProfileIdAndStatus', () => {
    it('should return contracts from the DB successfully by profile and status', async () => {
      const expectedObject = [{ test: 1 }];
      modelMock.findAll.mockResolvedValueOnce(expectedObject);
      await expect(controller.getByProfileIdAndStatus({ profileId: 1, status: 'in_progress' })).resolves.toEqual(
        expectedObject
      );
      expect(modelMock.findAll).toHaveBeenCalledWith({
        where: {
          status: 'in_progress',
          [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }]
        },
        raw: false
      });
    });

    it('should return contracts from the DB successfully by profile and statusNot', async () => {
      const expectedObject = [{ test: 1 }];
      modelMock.findAll.mockResolvedValueOnce(expectedObject);
      await expect(controller.getByProfileIdAndStatus({ profileId: 1, statusNot: 'in_progress' })).resolves.toEqual(
        expectedObject
      );
      expect(modelMock.findAll).toHaveBeenCalledWith({
        where: {
          status: { [Op.not]: 'in_progress' },
          [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }]
        },
        raw: false
      });
    });

    it('should return a formatted error if DB fails to query the contract from DB by profile and status', async () => {
      modelMock.findAll.mockRejectedValueOnce(new Error('test'));
      await expect(controller.getByProfileIdAndStatus({ profileId: 1, status: 'in_progress' })).rejects.toEqual(
        new Error(`Error getting contract by profileId=1, status|statusNot=in_progress`)
      );
    });

    it('should return a formatted error if DB fails to query the contract from DB by profile and status', async () => {
      modelMock.findAll.mockRejectedValueOnce(new Error('test'));
      await expect(controller.getByProfileIdAndStatus({ profileId: 1, statusNot: 'in_progress' })).rejects.toEqual(
        new Error(`Error getting contract by profileId=1, status|statusNot=in_progress`)
      );
    });
  });
});
