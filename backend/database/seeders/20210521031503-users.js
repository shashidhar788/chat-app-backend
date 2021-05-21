'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert("Users",[
      {
        firstname: "John",
        lastname: "Doe",
        email : "john@doe.com",
        password: bcrypt.hashSync('pass',12),
        gender: 'M',

      },
      {
        firstname: "Rach",
        lastname: "Doe2",
        email : "rach@doe.com",
        password: "pass",
        gender: 'F',

      },
      {
        firstname: "James",
        lastname: "Lick",
        email : "james@lick.com",
        password: "pass",
        gender: 'M',

      }
    ])

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users',null,{}); 
  }
};
