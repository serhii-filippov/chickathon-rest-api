'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      firstPlace: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      secondPlace: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      thirdPlace: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      isEnded: {
        defaultValue: false,
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Events');
  }
};