'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING
      },
      eventId: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      botId: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      battleId: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Logs');
  }
};