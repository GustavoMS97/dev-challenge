const { Op } = require('sequelize');
const { CONTRACT_STATUS } = require('./contract.enum');

class ContractController {
  #contractModel;

  constructor({ contractModel }) {
    this.#contractModel = contractModel;
  }

  async getByIdAndProfileId({ id, profileId }) {
    try {
      return await this.#contractModel.findOne({ where: { id, [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting contract by id=${id} and profileId=${profileId}`);
    }
  }

  async getByProfileId({ profileId, raw = false }) {
    try {
      return await this.#contractModel.findAll({
        where: { status: { [Op.not]: CONTRACT_STATUS.TERMINATED }, [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] },
        raw
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting contract by profileId=${profileId}`);
    }
  }
}

module.exports = ContractController;
