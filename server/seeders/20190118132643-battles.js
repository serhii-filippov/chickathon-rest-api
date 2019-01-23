'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Battles', [{
      type: 'test_battle_type',
      bot1Id: 1,
      bot2Id: 2,
      result: 'test_battle_result',
      replayFile: 'test_battle_replay_uri',
      dateOfBattle: '2019-01-02'
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
