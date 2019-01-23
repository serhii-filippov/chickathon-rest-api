'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Battles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      bot1Id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      bot2Id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      result: {
        allowNull: false,
        type: Sequelize.STRING
      },
      replayFile: {
        type: Sequelize.STRING
      },
      dateOfBattle: {
        allowNull: false,
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
    return queryInterface.dropTable('Battles');
  }
};