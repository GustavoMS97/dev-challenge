class ProfileController {
  #profileModel;

  constructor({ profileModel } = {}) {
    this.#profileModel = profileModel;
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
}

module.exports = ProfileController;
