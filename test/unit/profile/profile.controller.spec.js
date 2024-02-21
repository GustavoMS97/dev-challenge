const { Op, fn, col } = require('sequelize');
const { ValidationError } = require('joi');

const ProfileController = require('../../../src/domain/profile/profile.controller');

describe('ProfileController', () => {
  const modelMock = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    increment: jest.fn(),
    sequelize: {
      query: jest.fn()
    }
  };
  const controller = new ProfileController({ profileModel: modelMock, contractModel: modelMock, jobModel: modelMock });

  describe('findById', () => {
    it('should return an object from the DB successfully', async () => {
      const expectedObject = { test: 1 };
      modelMock.findOne.mockResolvedValueOnce(expectedObject);
      await expect(controller.findById({ id: 1 })).resolves.toEqual(expectedObject);
    });

    it('should return a formatted error if DB fails and throws an error', async () => {
      const expectedError = new Error('test error');
      modelMock.findOne.mockRejectedValueOnce(expectedError);
      await expect(controller.findById({ id: 1 })).rejects.toEqual(new Error(`Error getting profile by id=1`));
    });
  });

  describe('updateBalanceById', () => {
    it('should increment a value in the DB successfully', async () => {
      const expectedObject = true;
      modelMock.increment.mockResolvedValueOnce(expectedObject);
      await expect(controller.updateBalanceById({ id: 1, valueToAdd: 10 })).resolves.toEqual(expectedObject);
      expect(modelMock.increment).toHaveBeenCalledWith({ balance: 10 }, { where: { id: 1 } });
    });

    it('should return a formatted error if DB fails to increment and throws an error', async () => {
      modelMock.increment.mockRejectedValueOnce(new Error('test'));
      await expect(controller.updateBalanceById({ id: 1, valueToAdd: 10 })).rejects.toEqual(
        new Error(`Error updating profile=1 balance=+10`)
      );
    });
  });

  describe('getProfessionByEarningDesc', () => {
    it('should return a list of profiles successfully', async () => {
      const expectedObject = [1, 2, 3];
      modelMock.findAll.mockResolvedValueOnce(expectedObject);
      const start = '2020-01-01';
      const end = '2020-01-02';
      await expect(controller.getProfessionByEarningDesc({ start, end, raw: true })).resolves.toEqual(expectedObject);
      expect(modelMock.findAll).toHaveBeenCalledWith({
        raw: true,
        where: { type: 'contractor' },
        attributes: ['profession', [fn('SUM', col('Contractor.Jobs.price')), 'earnings']],
        include: [
          {
            model: modelMock,
            as: 'Contractor',
            attributes: [],
            include: [
              {
                model: modelMock,
                as: 'Jobs',
                attributes: [],
                where: {
                  paid: true,
                  paymentDate: {
                    [Op.between]: [new Date(`${start}T00:00:00Z`), new Date(`${end}T23:59:59Z`)]
                  }
                }
              }
            ]
          }
        ],
        group: ['profession'],
        order: [[col('earnings'), 'DESC']]
      });
    });

    it('should return a list of profiles successfully with raw set to default value', async () => {
      const expectedObject = [1, 2, 3];
      modelMock.findAll.mockResolvedValueOnce(expectedObject);
      const start = '2020-01-01';
      const end = '2020-01-02';
      await expect(controller.getProfessionByEarningDesc({ start, end })).resolves.toEqual(expectedObject);
      expect(modelMock.findAll).toHaveBeenCalledWith({
        raw: false,
        where: { type: 'contractor' },
        attributes: ['profession', [fn('SUM', col('Contractor.Jobs.price')), 'earnings']],
        include: [
          {
            model: modelMock,
            as: 'Contractor',
            attributes: [],
            include: [
              {
                model: modelMock,
                as: 'Jobs',
                attributes: [],
                where: {
                  paid: true,
                  paymentDate: {
                    [Op.between]: [new Date(`${start}T00:00:00Z`), new Date(`${end}T23:59:59Z`)]
                  }
                }
              }
            ]
          }
        ],
        group: ['profession'],
        order: [[col('earnings'), 'DESC']]
      });
    });

    it('should return a formatted error if DB fails to query the highest earning professionals', async () => {
      modelMock.findAll.mockRejectedValueOnce(new Error('test'));
      const start = '2020-01-01';
      const end = '2020-01-02';
      await expect(controller.getProfessionByEarningDesc({ start, end, raw: false })).rejects.toEqual(
        new Error(`Error getting the profession that earned the most money by time range=${start}-${end}`)
      );
    });

    it('should return a formatted error if params sent are not valid', async () => {
      modelMock.findAll.mockResolvedValueOnce([1, 2, 3]);
      const start = '2020/01/01';
      const end = '2020-01-02';
      await expect(controller.getProfessionByEarningDesc({ start, end, raw: false })).rejects.toEqual(
        new ValidationError(`"start" must be in YYYY-MM-DD format`)
      );
    });
  });

  describe('getClientsThatPaidTheMostWithRangeAndLimit', () => {
    it('should return a list of clients successfully', async () => {
      const expectedObject = [1, 2, 3];
      modelMock.sequelize.query.mockResolvedValueOnce([expectedObject, true]);
      const start = '2020-01-01';
      const end = '2020-01-02';
      const limit = 3;
      await expect(
        controller.getClientsThatPaidTheMostWithRangeAndLimit({ start, end, raw: true, limit })
      ).resolves.toEqual(expectedObject);
    });

    it('should return a list of clients successfully and send default values for raw and limit', async () => {
      const expectedObject = [1, 2];
      modelMock.sequelize.query.mockResolvedValueOnce([expectedObject, true]);
      const start = '2020-01-01';
      const end = '2020-01-02';
      await expect(controller.getClientsThatPaidTheMostWithRangeAndLimit({ start, end })).resolves.toEqual(
        expectedObject
      );
    });

    it('should return a formatted error if sequelize raw query fails to execute and get the clients', async () => {
      modelMock.sequelize.query.mockRejectedValueOnce(new Error('test'));
      const start = '2020-01-01';
      const end = '2020-01-02';
      const limit = 3;
      await expect(
        controller.getClientsThatPaidTheMostWithRangeAndLimit({ start, end, raw: true, limit })
      ).rejects.toEqual(
        new Error(`Error getting the client that paid the most money by time range=${start}-${end} and limit=${limit}`)
      );
    });
  });
});
