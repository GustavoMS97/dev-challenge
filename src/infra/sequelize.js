const Sequelize = require('sequelize');
const ProfileModel = require('../domain/profile/profile.model');
const ContractModel = require('../domain/contract/contract.model');
const JobModel = require('../domain/job/job.model');

class SequelizeManager {
  #instance;

  start() {
    try {
      this.#instance = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite3'
      });
      return this.#instance;
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error('Error starting sequelize connection');
    }
  }

  createRelationships() {
    try {
      // Initialize models
      const Profile = ProfileModel(this.#instance);
      const Contract = ContractModel(this.#instance);
      const Job = JobModel(this.#instance);
      // Create relationships
      Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
      Contract.belongsTo(Profile, { as: 'Contractor' });
      Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
      Contract.belongsTo(Profile, { as: 'Client' });
      Contract.hasMany(Job);
      Job.belongsTo(Contract);
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error('Error creating models relationships');
    }
  }
}

module.exports = SequelizeManager;
