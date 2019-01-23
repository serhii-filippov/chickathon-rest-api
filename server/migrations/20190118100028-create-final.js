'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Finals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      botId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      position: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      score: {
        allowNull: false,
        type: Sequelize.REAL
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
    return queryInterface.dropTable('Finals');
  }
};