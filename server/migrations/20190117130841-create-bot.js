'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      devLanguage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      devRating: {
        defaultValue: 0,
        allowNull: true,
        type: Sequelize.REAL
      },
      eventRating: {
        defaultValue: 0,
        allowNull: true,
        type: Sequelize.REAL
      },
      jarFile: {
        type: Sequelize.STRING
      },
      jarFileUpdateDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Bots');
  }
};