const { Op } = require('sequelize');

class JobController {
  #jobModel;
  #contractModel;

  constructor({ jobModel, contractModel }) {
    this.#jobModel = jobModel;
    this.#contractModel = contractModel;
  }

  async findById({ id } = {}) {
    try {
      return await this.#jobModel.findOne({ where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting job by id=${id}`);
    }
  }

  async updatePaidById({ id } = {}) {
    try {
      return await this.#jobModel.update({ paid: true, paymentDate: new Date() }, { where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error updating job=${id} to paid status with payment date=${new Date()}`);
    }
  }

  async getJobByIdAndProfileId({ id, profileId, raw = false } = {}) {
    try {
      return await this.#jobModel.findOne({
        raw,
        where: { id },
        include: [
          {
            model: this.#contractModel,
            as: 'Contract',
            required: true,
            where: { [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }] }
          }
        ]
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting jobs by profileId=${profileId} and id=${id}`);
    }
  }

  async getJobsByPaidStatusProfileIdAndContractStatus({ paidStatus, profileId, contractStatus, raw = false } = {}) {
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
      throw new Error(
        `Error getting jobs by profileId=${profileId}, paid status=${paidStatus}, contract status=${contractStatus}`
      );
    }
  }
}

module.exports = JobController;
