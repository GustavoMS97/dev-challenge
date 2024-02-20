const { Sequelize } = require('sequelize');

const { CONTRACT_STATUS } = require('./contract.enum');

const ContractModel = (sequelize) => {
  class Contract extends Sequelize.Model {}
  Contract.init(
    {
      terms: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(Object.values(CONTRACT_STATUS))
      }
    },
    {
      sequelize,
      modelName: 'Contract'
    }
  );
  return Contract;
};

module.exports = ContractModel;
