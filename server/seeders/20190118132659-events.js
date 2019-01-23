'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return queryInterface.bulkInsert('Events', [{
        startDate: '2019-01-02',
        endDate: '2019-01-03',
        firstPlace: 1,
        secondPlace: 2,
        thirdPlace: 3
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
