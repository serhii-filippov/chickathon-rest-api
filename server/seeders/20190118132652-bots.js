'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Bots', [{
      name: 'test_bot1_name',
      userId: 1,
      devLanguage: 'test_dev_tech',
      devRating: 1.2,
      eventRating: 1.2,
      jarFile: 'test_jar_file1_uri',
      jarFileUpdateDate: '2019-01-02'
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
