const { fn, col, Op } = require('sequelize');
const { applyDateRangeValidation } = require('../@utils/common.validator');

class ProfileController {
  #profileModel;
  #contractModel;
  #jobModel;

  constructor({ profileModel, contractModel, jobModel } = {}) {
    this.#profileModel = profileModel;
    this.#contractModel = contractModel;
    this.#jobModel = jobModel;
  }

  async findById({ id } = {}) {
    try {
      return await this.#profileModel.findOne({ where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting profile by id=${id}`);
    }
  }

  async updateBalanceById({ id, valueToAdd } = {}) {
    try {
      return await this.#profileModel.increment({ balance: valueToAdd }, { where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error updating profile=${id} balance=+${valueToAdd}`);
    }
  }

  async getProfessionByEarningDesc({ start, end, raw = false } = {}) {
    const validatedParams = applyDateRangeValidation({ start, end });
    try {
      return await this.#profileModel.findAll({
        raw,
        attributes: ['profession', [fn('SUM', col('Contractor.Jobs.price')), 'earnings']],
        include: [
          {
            model: this.#contractModel,
            as: 'Contractor',
            attributes: [],
            include: [
              {
                model: this.#jobModel,
                as: 'Jobs',
                attributes: [],
                where: {
                  paid: true,
                  paymentDate: {
                    [Op.between]: [
                      new Date(`${validatedParams.start}T00:00:00Z`),
                      new Date(`${validatedParams.end}T23:59:59Z`)
                    ]
                  }
                }
              }
            ]
          }
        ],
        group: ['profession'],
        order: [[col('earnings'), 'DESC']]
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting the profession that earned the most money by time range=${start}-${end}`);
    }
  }
}

module.exports = ProfileController;
