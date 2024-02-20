const { Op } = require('sequelize');

class JobController {
  #jobModel;
  #contractModel;

  constructor({ jobModel, contractModel }) {
    this.#jobModel = jobModel;
    this.#contractModel = contractModel;
  }

  async getJobsByPaidStatusProfileIdAndContractStatus({ paidStatus, profileId, contractStatus, raw = false }) {
    try {
      return await this.#jobModel.findAll({
        raw,
        where: paidStatus ? { paid: paidStatus } : { [Op.or]: [{ paid: false }, { paid: { [Op.is]: null } }] },
        include: [
          {
            model: this.#contractModel,
            as: 'Contract',
            required: true,
            where: { status: contractStatus, [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] },
            attributes: ['status']
          }
        ]
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting jobs by profileId=${profileId} and contract status=${contractStatus}`);
    }
  }
}

module.exports = JobController;
