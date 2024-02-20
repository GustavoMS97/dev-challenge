const { Sequelize } = require('sequelize');

const ContractModel = (sequelize) => {
  class Contract extends Sequelize.Model {}
  Contract.init(
    {
      terms: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('new', 'in_progress', 'terminated')
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
