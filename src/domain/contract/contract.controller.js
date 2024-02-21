const { Op } = require('sequelize');

class ContractController {
  #contractModel;

  constructor({ contractModel }) {
    this.#contractModel = contractModel;
  }

  async getByIdAndProfileId({ id, profileId }) {
    try {
      return await this.#contractModel.findOne({
        where: { id, [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] }
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting contract by id=${id} and profileId=${profileId}`);
    }
  }

  async getByProfileIdAndStatus({ profileId, status, statusNot, raw = false }) {
    try {
      return await this.#contractModel.findAll({
        where: {
          status: status ? status : { [Op.not]: statusNot },
          [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
        },
        raw
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting contract by profileId=${profileId}, status|statusNot=${status ?? statusNot}`);
    }
  }
}

module.exports = ContractController;
