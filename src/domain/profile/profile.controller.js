class ProfileController {
  #profileModel;

  constructor(profileModel) {
    this.#profileModel = profileModel;
  }

  async findById(id) {
    try {
      return await this.#profileModel.findOne({ where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting profile by id=${id}`);
    }
  }
}

module.exports = ProfileController;
