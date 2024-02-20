const { Sequelize } = require('sequelize');

const { PROFILE_TYPE } = require('./profile.enum');

const ProfileModel = (sequelize) => {
  class Profile extends Sequelize.Model {}
  Profile.init(
    {
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: false
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2)
      },
      type: {
        type: Sequelize.ENUM(Object.values(PROFILE_TYPE))
      }
    },
    {
      sequelize: sequelize,
      modelName: 'Profile'
    }
  );
  return Profile;
};

module.exports = ProfileModel;
