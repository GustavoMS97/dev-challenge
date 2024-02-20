const { Op } = require('sequelize');

class ContractController {
  #contractModel;

  constructor(contractModel) {
    this.#contractModel = contractModel;
  }

  async getByIdAndProfileId(id, profileId) {
    try {
      return await this.#contractModel.findOne({ where: { id, [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting contract by id=${id} and profileId=${profileId}`);
    }
  }
}

module.exports = ContractController;
